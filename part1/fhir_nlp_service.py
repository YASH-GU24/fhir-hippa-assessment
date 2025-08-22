import re
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

import spacy
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn


class ResourceType(Enum):
    PATIENT = "Patient"
    CONDITION = "Condition"
    OBSERVATION = "Observation"
    MEDICATION_REQUEST = "MedicationRequest"


@dataclass
class FHIRQuery:
    resource_type: ResourceType
    parameters: Dict[str, Any]
    _include: Optional[List[str]] = None
    _count: Optional[int] = None


class NLQueryRequest(BaseModel):
    query: str


class FHIRQueryResponse(BaseModel):
    original_query: str
    extracted_entities: Dict[str, Any]
    fhir_query: Dict[str, Any]
    fhir_url: str
    results: List[Dict[str, Any]]


class FHIRNLPProcessor:
    """Natural Language Processing service for FHIR queries."""
    
    def __init__(self, fhir_base_url: str = "https://hapi.fhir.org/baseR4"):
        # FHIR server configuration
        self.fhir_base_url = fhir_base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
        })
        
        # Load spaCy model (using small English model)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Please install spaCy English model: python -m spacy download en_core_web_sm")
            raise
        
        # Medical condition mappings
        self.condition_mappings = {
            "diabetes": {"code": "44054006", "system": "http://snomed.info/sct", "display": "Diabetes mellitus"},
            "diabetic": {"code": "44054006", "system": "http://snomed.info/sct", "display": "Diabetes mellitus"},
            "hypertension": {"code": "38341003", "system": "http://snomed.info/sct", "display": "Hypertension"},
            "heart disease": {"code": "56265001", "system": "http://snomed.info/sct", "display": "Heart disease"},
            "asthma": {"code": "195967001", "system": "http://snomed.info/sct", "display": "Asthma"},
            "depression": {"code": "35489007", "system": "http://snomed.info/sct", "display": "Depressive disorder"},
            "cancer": {"code": "363346000", "system": "http://snomed.info/sct", "display": "Malignant neoplastic disease"}
        }
        
        # Age-related keywords
        self.age_patterns = {
            "over": ">",
            "above": ">",
            "under": "<",
            "below": "<",
            "exactly": "=",
            "between": "range"
        }
    
    def extract_entities(self, query: str) -> Dict[str, Any]:
        """Extract medical entities and parameters from natural language query using spaCy NLP."""
        doc = self.nlp(query.lower())
        entities = {
            "conditions": [],
            "age_filters": [],
            "gender": None,
            "intent": self._determine_intent_with_spacy(doc),
            "resource_types": [],
            "extracted_numbers": [],
            "extracted_entities": []
        }
        
        # Extract numbers and their context using spaCy
        numbers_with_context = self._extract_numbers_with_context(doc)
        entities["extracted_numbers"] = numbers_with_context
        
        # Extract named entities using spaCy
        for ent in doc.ents:
            entities["extracted_entities"].append({
                "text": ent.text,
                "label": ent.label_,
                "description": spacy.explain(ent.label_)
            })
        
        # Extract conditions using spaCy lemmatization and dependency parsing
        entities["conditions"] = self._extract_conditions_with_spacy(doc)
        
        # Extract age filters using spaCy's linguistic features
        entities["age_filters"] = self._extract_age_filters_with_spacy(doc, numbers_with_context)
        
        # Extract gender using spaCy token analysis
        entities["gender"] = self._extract_gender_with_spacy(doc)
        
        # Determine resource types needed
        if entities["conditions"]:
            entities["resource_types"].append("Condition")
        entities["resource_types"].append("Patient")
        
        return entities
    
    def _determine_intent_with_spacy(self, doc) -> str:
        """Determine the intent of the query using spaCy linguistic analysis."""
        # Look for intent verbs using lemmatization and POS tagging
        search_verbs = {"show", "list", "find", "get", "display", "retrieve", "fetch"}
        count_verbs = {"count", "number"}
        aggregate_verbs = {"average", "mean", "median", "sum", "total"}
        
        for token in doc:
            # Use lemmatized form for better matching
            lemma = token.lemma_
            
            # Check if it's a verb or if it's in our intent keywords
            if token.pos_ == "VERB" or lemma in search_verbs.union(count_verbs).union(aggregate_verbs):
                if lemma in search_verbs:
                    return "search"
                elif lemma in count_verbs or "many" in [t.lemma_ for t in doc]:
                    return "count"
                elif lemma in aggregate_verbs:
                    return "aggregate"
        
        # Fallback to original method for phrases like "how many"
        query_text = doc.text
        if any(phrase in query_text for phrase in ['how many', 'number of']):
            return "count"
        elif any(phrase in query_text for phrase in ['average', 'mean', 'median']):
            return "aggregate"
        
        return "search"  # default
    
    def _extract_numbers_with_context(self, doc) -> List[Dict[str, Any]]:
        """Extract numbers and their surrounding context using spaCy."""
        numbers = []
        
        for token in doc:
            if token.like_num or token.pos_ == "NUM":
                # Get context around the number
                context_words = []
                
                # Look at surrounding tokens
                start_idx = max(0, token.i - 2)
                end_idx = min(len(doc), token.i + 3)
                
                for i in range(start_idx, end_idx):
                    if i != token.i:
                        context_words.append(doc[i].text)
                
                numbers.append({
                    "value": token.text,
                    "numeric_value": self._convert_to_number(token.text),
                    "context": " ".join(context_words),
                    "position": token.i,
                    "dependencies": [child.text for child in token.children]
                })
        
        return numbers
    
    def _convert_to_number(self, text: str) -> Optional[int]:
        """Convert text to number, handling various formats."""
        try:
            return int(text)
        except ValueError:
            # Handle word numbers
            word_to_num = {
                "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
                "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
                "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90
            }
            return word_to_num.get(text.lower())
    
    def _extract_conditions_with_spacy(self, doc) -> List[Dict[str, Any]]:
        """Extract medical conditions using spaCy's linguistic features."""
        conditions = []
        
        # Use lemmatization for better matching
        for token in doc:
            lemma = token.lemma_
            
            # Check against our condition mappings using lemmatized forms
            for condition, mapping in self.condition_mappings.items():
                condition_words = condition.split()
                
                # For multi-word conditions, check if all words are present
                if len(condition_words) > 1:
                    doc_lemmas = [t.lemma_ for t in doc]
                    if all(word in doc_lemmas for word in condition_words):
                        conditions.append({
                            "term": condition,
                            "code": mapping["code"],
                            "system": mapping["system"],
                            "display": mapping["display"],
                            "extraction_method": "spacy_lemma_multiword"
                        })
                        break
                # For single word conditions
                elif lemma == condition or token.text == condition:
                    conditions.append({
                        "term": condition,
                        "code": mapping["code"],
                        "system": mapping["system"],
                        "display": mapping["display"],
                        "extraction_method": "spacy_lemma"
                    })
                    break
        
        # Also check for medical entities that spaCy might recognize
        for ent in doc.ents:
            if ent.label_ in ["DISEASE", "SYMPTOM"] and ent.text.lower() in self.condition_mappings:
                mapping = self.condition_mappings[ent.text.lower()]
                conditions.append({
                    "term": ent.text.lower(),
                    "code": mapping["code"],
                    "system": mapping["system"],
                    "display": mapping["display"],
                    "extraction_method": "spacy_ner"
                })
        
        # Remove duplicates
        seen = set()
        unique_conditions = []
        for condition in conditions:
            if condition["code"] not in seen:
                seen.add(condition["code"])
                unique_conditions.append(condition)
        
        return unique_conditions
    
    def _extract_age_filters_with_spacy(self, doc, numbers_with_context: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract age filters using spaCy's dependency parsing and context analysis."""
        age_filters = []
        
        # Look for age-related patterns using dependency parsing
        for number_info in numbers_with_context:
            context = number_info["context"].lower()
            numeric_value = number_info["numeric_value"]
            if not numeric_value:
                continue
            
            # Determine operator based on context
            if any(word in context for word in ["over", "above", "more than", "greater"]):
                age_filters.append({
                    "operator": ">",
                    "value": numeric_value,
                    "extraction_method": "spacy_context"
                })
            elif any(word in context for word in ["under", "below", "less than", "younger"]):
                age_filters.append({
                    "operator": "<",
                    "value": numeric_value,
                    "extraction_method": "spacy_context"
                })
            elif "between" in context:
                # Look for the second number for range
                for other_number in numbers_with_context:
                    if other_number != number_info and other_number["numeric_value"]:
                        age_filters.append({
                            "operator": "range",
                            "min": min(numeric_value, other_number["numeric_value"]),
                            "max": max(numeric_value, other_number["numeric_value"]),
                            "extraction_method": "spacy_context_range"
                        })
                        break
    
        # Fallback to regex for patterns not caught by context analysis
        if not age_filters:
            age_match = re.search(r'(over|above|under|below|exactly)\s+(\d+)', doc.text)
            if age_match:
                operator = self.age_patterns.get(age_match.group(1), ">")
                age = int(age_match.group(2))
                age_filters.append({
                    "operator": operator,
                    "value": age,
                    "extraction_method": "regex_fallback"
                })
            
            range_match = re.search(r'between\s+(\d+)\s+and\s+(\d+)', doc.text)
            if range_match:
                age_filters.append({
                    "operator": "range",
                    "min": int(range_match.group(1)),
                    "max": int(range_match.group(2)),
                    "extraction_method": "regex_fallback"
                })
        
        return age_filters
    
    def _extract_gender_with_spacy(self, doc) -> Optional[str]:
        """Extract gender using spaCy's token analysis and named entity recognition."""
        # Check named entities for person names that might indicate gender
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                # This is a basic approach - in real applications you'd use a gender detection library
                pass
        
        # Use lemmatization for better gender keyword matching
        male_indicators = {"male", "man", "men", "boy", "gentleman", "guy"}
        female_indicators = {"female", "woman", "women", "girl", "lady", "gal"}
        
        for token in doc:
            lemma = token.lemma_
            if lemma in male_indicators or token.text in male_indicators:
                return "male"
            elif lemma in female_indicators or token.text in female_indicators:
                return "female"
        
        return None
    
    def _determine_intent(self, query: str) -> str:
        """Legacy method - kept for backward compatibility."""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['show', 'list', 'find', 'get', 'display']):
            return "search"
        elif any(word in query_lower for word in ['count', 'how many', 'number of']):
            return "count"
        elif any(word in query_lower for word in ['average', 'mean', 'median']):
            return "aggregate"
        else:
            return "search"  # default
    
    def build_fhir_query(self, entities: Dict[str, Any]) -> FHIRQuery:
        """Convert extracted entities to FHIR query parameters."""
        
        if entities["intent"] == "count":
            # For count queries, we typically search patients with conditions
            parameters = {}
            
            if entities["conditions"]:
                # Search for patients with specific conditions
                condition_codes = [c["code"] for c in entities["conditions"]]
                parameters["_has:Condition:subject:code"] = ",".join(condition_codes)
            
            if entities["age_filters"]:
                age_filter = entities["age_filters"][0]
                if age_filter["operator"] == ">":
                    # Calculate birth date (approximate)
                    current_year = datetime.now().year
                    birth_year = current_year - age_filter["value"]
                    parameters["birthdate"] = f"le{birth_year}-12-31"
                elif age_filter["operator"] == "<":
                    current_year = datetime.now().year
                    birth_year = current_year - age_filter["value"]
                    parameters["birthdate"] = f"ge{birth_year}-01-01"
                elif age_filter["operator"] == "range":
                    current_year = datetime.now().year
                    max_birth_year = current_year - age_filter["min"]
                    min_birth_year = current_year - age_filter["max"]
                    parameters["birthdate"] = f"ge{min_birth_year}-01-01&birthdate=le{max_birth_year}-12-31"
            
            if entities["gender"]:
                parameters["gender"] = entities["gender"]
            
            return FHIRQuery(
                resource_type=ResourceType.PATIENT,
                parameters=parameters,
                _include=["Condition:subject"] if entities["conditions"] else None,
                _count=100
            )
        
        else:
            # Default search query
            parameters = {}
            
            if entities["conditions"]:
                condition_codes = [c["code"] for c in entities["conditions"]]
                parameters["_has:Condition:subject:code"] = ",".join(condition_codes)
            
            if entities["age_filters"]:
                age_filter = entities["age_filters"][0]
                if age_filter["operator"] == ">":
                    current_year = datetime.now().year
                    birth_year = current_year - age_filter["value"]
                    parameters["birthdate"] = f"le{birth_year}-12-31"
                elif age_filter["operator"] == "<":
                    current_year = datetime.now().year
                    birth_year = current_year - age_filter["value"]
                    parameters["birthdate"] = f"ge{birth_year}-01-01"
                elif age_filter["operator"] == "range":
                    current_year = datetime.now().year
                    max_birth_year = current_year - age_filter["min"]
                    min_birth_year = current_year - age_filter["max"]
                    parameters["birthdate"] = f"ge{min_birth_year}-01-01&birthdate=le{max_birth_year}-12-31"
            
            if entities["gender"]:
                parameters["gender"] = entities["gender"]
            
            return FHIRQuery(
                resource_type=ResourceType.PATIENT,
                parameters=parameters,
                _include=["Condition:subject"] if entities["conditions"] else None,
                _count=100
            )
    
    def fetch_real_fhir_data(self, query: FHIRQuery, max_pages: int = 3) -> Dict[str, Any]:
        """Fetch real data from FHIR server with pagination support."""
        try:
            # Build the complete URL
            url = f"{self.fhir_base_url}/{query.resource_type.value}"
            params = {}
            
            # Add query parameters
            for key, value in query.parameters.items():
                params[key] = value
            
            # Add _include parameters
            if query._include:
                for include in query._include:
                    if '_include' not in params:
                        params['_include'] = []
                    if isinstance(params['_include'], str):
                        params['_include'] = [params['_include']]
                    params['_include'].append(include)
            
            # Add _count parameter (limit per page)
            if query._count:
                params['_count'] = min(query._count, 50)  # Reasonable page size
            
            # Fetch data with pagination
            all_resources = []
            total_count = 0
            current_url = url
            current_params = params
            pages_fetched = 0
            
            while current_url and pages_fetched < max_pages:
                print(f"Making FHIR API request to: {current_url}")
                print(f"Parameters: {current_params}")
                
                if pages_fetched == 0:
                    # First request with parameters
                    response = self.session.get(current_url, params=current_params, timeout=30)
                else:
                    # Subsequent requests using the next link directly
                    response = self.session.get(current_url, timeout=30)
                response.raise_for_status()
                fhir_bundle = response.json()
                
                if fhir_bundle.get("resourceType") != "Bundle":
                    # Handle single resource response
                    return {
                        "total": 1,
                        "resources": [fhir_bundle],
                        "bundle": {"resourceType": "Bundle", "entry": [{"resource": fhir_bundle}]}
                    }
                
                # Extract entries from current page
                entries = fhir_bundle.get("entry", [])
                page_resources = [entry.get("resource", {}) for entry in entries if "resource" in entry]
                all_resources.extend(page_resources)
                
                # Update total count from bundle
                if "total" in fhir_bundle:
                    total_count = fhir_bundle["total"]
                
                
                # Check for next link
                next_url = self._get_next_link(fhir_bundle)
                if next_url:
                    current_url = next_url
                    current_params = {}  # Next link already contains all parameters
                    pages_fetched += 1
                else:
                    break
            
            
            return {
                "total": total_count or len(all_resources),
                "resources": all_resources,
                "bundle": fhir_bundle,  # Return the last bundle for reference
                "pages_fetched": pages_fetched + 1
            }
                
        except requests.exceptions.RequestException as e:
            print(f"FHIR API request failed: {e}")
            return self._generate_fallback_results(query)
        except Exception as e:
            print(f"Error processing FHIR response: {e}")
            return self._generate_fallback_results(query)
    
    def _get_next_link(self, bundle: Dict[str, Any]) -> Optional[str]:
        """Extract the next link from a FHIR Bundle."""
        links = bundle.get("link", [])
        for link in links:
            if link.get("relation") == "next":
                return link.get("url")
        return None
    
    def _generate_fallback_results(self, query: FHIRQuery) -> Dict[str, Any]:
        """Generate minimal fallback results when FHIR API fails."""
        return {
            "total": 0,
            "resources": [],
            "bundle": {
                "resourceType": "Bundle",
                "type": "searchset",
                "total": 0,
                "entry": []
            },
            "error": "Unable to fetch data from FHIR server. This is fallback data."
        }


# FastAPI application
app = FastAPI(title="FHIR NLP Service", version="1.0.0")
processor = FHIRNLPProcessor()


@app.post("/query", response_model=FHIRQueryResponse)
async def process_nlp_query(request: NLQueryRequest):
    """Process natural language query and convert to FHIR request."""
    try:
        # Extract entities from natural language
        entities = processor.extract_entities(request.query)
        
        # Build FHIR query
        fhir_query = processor.build_fhir_query(entities)
        
        # Generate simulated URL
        base_url = "https://hapi.fhir.org/baseR4"
        params = []
        for key, value in fhir_query.parameters.items():
            params.append(f"{key}={value}")
        
        if fhir_query._include:
            params.extend([f"_include={inc}" for inc in fhir_query._include])
        
        if fhir_query._count:
            params.append(f"_count={fhir_query._count}")
        
        simulated_url = f"{base_url}/{fhir_query.resource_type.value}"
        if params:
            simulated_url += "?" + "&".join(params)
        
        # Fetch real FHIR data
        fhir_results = processor.fetch_real_fhir_data(fhir_query)
        
        return FHIRQueryResponse(
            original_query=request.query,
            extracted_entities=entities,
            fhir_query={
                "resourceType": fhir_query.resource_type.value,
                "parameters": fhir_query.parameters,
                "_include": fhir_query._include,
                "_count": fhir_query._count
            },
            fhir_url=simulated_url,
            results=fhir_results.get("resources", [])
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "FHIR NLP Service"}


async def run_example_queries():
    """Run example queries and store results in JSON format."""
    example_queries = [
        "Show me all diabetic patients over 50",
        "Find female patients with hypertension under 65", 
        "List patients with asthma between 30 and 45 years old",
        "How many male patients have depression?",
        "Show me patients with heart disease and diabetes over 60",
        "Find all patients with cancer under 40"
    ]
    
    results = {}
    
    for i, query in enumerate(example_queries, 1):
        print(f"\n--- Example Query {i}: {query} ---")
        
        try:
            # Extract entities from natural language
            entities = processor.extract_entities(query)
            
            # Build FHIR query
            fhir_query = processor.build_fhir_query(entities)
            
            # Generate FHIR URL
            base_url = "https://hapi.fhir.org/baseR4"
            params = []
            for key, value in fhir_query.parameters.items():
                params.append(f"{key}={value}")
            
            if fhir_query._include:
                params.extend([f"_include={inc}" for inc in fhir_query._include])
            
            if fhir_query._count:
                params.append(f"_count={fhir_query._count}")
            
            fhir_url = f"{base_url}/{fhir_query.resource_type.value}"
            if params:
                fhir_url += "?" + "&".join(params)
            
            # Fetch real FHIR data
            fhir_results = processor.fetch_real_fhir_data(fhir_query)
            
            # Store result
            results[f"query_{i}"] = {
                "original_query": query,
                "extracted_entities": entities,
                "fhir_query": {
                    "resourceType": fhir_query.resource_type.value,
                    "parameters": fhir_query.parameters,
                    "_include": fhir_query._include,
                    "_count": fhir_query._count
                },
                "fhir_url": fhir_url,
                "total_results": fhir_results.get("total", 0),
                "results_count": len(fhir_results.get("resources", [])),
                "results": fhir_results.get("resources", [])[:5],  # Store only first 5 results to keep file manageable
                "pages_fetched": fhir_results.get("pages_fetched", 1)
            }
            
            print(f"✓ Extracted entities: {len(entities.get('conditions', []))} conditions, {len(entities.get('age_filters', []))} age filters")
            print(f"✓ Generated FHIR URL: {fhir_url}")
            print(f"✓ Found {fhir_results.get('total', 0)} total results, fetched {len(fhir_results.get('resources', []))} resources")
            
        except Exception as e:
            print(f"✗ Error processing query: {e}")
            results[f"query_{i}"] = {
                "original_query": query,
                "error": str(e)
            }
    
    # Save results to JSON file
    output_file = "example_queries_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n✓ Results saved to {output_file}")
    return results

if __name__ == "__main__":
    import asyncio
    
    # Option to run example queries
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--examples":
        print("Running example queries...")
        asyncio.run(run_example_queries())
    else:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    
