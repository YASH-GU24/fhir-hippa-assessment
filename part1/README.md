# FHIR NLP Service Backend

AI-powered healthcare data querying service that converts natural language queries into FHIR-compliant API requests using spaCy NLP and real-time data from HAPI FHIR server.

## 🚀 Features

- **Natural Language Processing**: Convert plain English queries to FHIR API calls
- **Real FHIR Data**: Fetches actual patient data from HAPI FHIR server
- **spaCy Integration**: Advanced entity extraction with lemmatization and dependency parsing
- **FHIR R4 Compliant**: Generates proper FHIR search parameters and includes
- **Pagination Support**: Handles multi-page FHIR responses automatically
- **Medical Terminology**: Maps conditions to SNOMED CT codes

## 📋 Prerequisites

- Python 3.11+
- Docker (optional)
- Internet connection (for FHIR API calls)

## 🐳 Running with Docker (Recommended)

### Build and Run
```bash
# Build the Docker image
docker build -t fhir-nlp-service .

# Run the container
docker run -p 8000:8000 fhir-nlp-service
```

### Alternative: One-liner
```bash
docker build -t fhir-nlp-service . && docker run -p 8000:8000 fhir-nlp-service
```

### Background Mode
```bash
docker run -d -p 8000:8000 --name fhir-nlp fhir-nlp-service
```

## 🐍 Running without Docker

### 1. Install Dependencies
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 2. Run the Service
```bash
python fhir_nlp_service.py
```

## 🔗 API Endpoints

### Health Check
```bash
GET http://localhost:8000/health
```

### Process NLP Query
```bash
POST http://localhost:8000/query
Content-Type: application/json

{
  "query": "Show me all diabetic patients over 50"
}
```

## 📝 Example Queries

### 1. Basic Condition Search
```json
{
  "query": "Show me all diabetic patients over 50"
}
```
**Generated FHIR**: `Patient?_has:Condition:subject:code=44054006&birthdate=le1975-12-31`

### 2. Gender and Age Filter
```json
{
  "query": "Find female patients with hypertension under 65"
}
```
**Generated FHIR**: `Patient?_has:Condition:subject:code=38341003&birthdate=ge1960-01-01&gender=female`

### 3. Age Range Query
```json
{
  "query": "List patients with asthma between 30 and 45 years old"
}
```
**Generated FHIR**: `Patient?_has:Condition:subject:code=195967001&birthdate=ge1980-01-01&birthdate=le1995-12-31`

### 4. Count Query
```json
{
  "query": "How many male patients have depression?"
}
```
**Generated FHIR**: `Patient?_has:Condition:subject:code=35489007&gender=male`

### 5. Multiple Conditions
```json
{
  "query": "Show me patients with heart disease and diabetes over 60"
}
```
**Generated FHIR**: `Patient?_has:Condition:subject:code=56265001,44054006&birthdate=le1965-12-31`

### 6. Cancer Patients
```json
{
  "query": "Find all patients with cancer under 40"
}
```
**Generated FHIR**: `Patient?_has:Condition:subject:code=363346000&birthdate=ge1985-01-01`

## 🧪 Running Example Queries

### Inside Docker Container
```bash
docker exec -it <container_name> python -c "import asyncio; from fhir_nlp_service import run_example_queries; asyncio.run(run_example_queries())"
```

### Local Environment
```bash
python fhir_nlp_service.py --examples
```

This generates `example_queries_results.json` with processed results from all example queries.

## 🏥 Supported Medical Conditions

| Condition | SNOMED CT Code | Variations |
|-----------|----------------|------------|
| Diabetes mellitus | 44054006 | diabetes, diabetic |
| Hypertension | 38341003 | high blood pressure |
| Heart disease | 56265001 | cardiac condition |
| Asthma | 195967001 | asthmatic |
| Depression | 35489007 | depressive disorder |
| Cancer | 363346000 | malignant neoplasm |

## 📊 Response Format

```json
{
  "original_query": "Show me all diabetic patients over 50",
  "extracted_entities": {
    "conditions": [
      {
        "term": "diabetes",
        "code": "44054006",
        "system": "http://snomed.info/sct",
        "display": "Diabetes mellitus"
      }
    ],
    "age_filters": [
      {
        "operator": ">",
        "value": 50
      }
    ],
    "gender": null,
    "intent": "search"
  },
  "fhir_query": {
    "resourceType": "Patient",
    "parameters": {
      "_has:Condition:subject:code": "44054006",
      "birthdate": "le1975-12-31"
    },
    "_include": ["Condition:subject"],
    "_count": 100
  },
  "fhir_url": "https://hapi.fhir.org/baseR4/Patient?_has:Condition:subject:code=44054006&birthdate=le1975-12-31&_include=Condition:subject&_count=100",
  "results": [
    {
      "resourceType": "Patient",
      "id": "patient-123",
      "name": [{"family": "Smith", "given": ["John"]}],
      "gender": "male",
      "birthDate": "1965-05-15"
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables
- `FHIR_BASE_URL`: FHIR server base URL (default: `https://hapi.fhir.org/baseR4`)
- `MAX_PAGES`: Maximum pages to fetch (default: 3)
- `PAGE_SIZE`: Results per page (default: 50)

### Docker Environment
```bash
docker run -p 8000:8000 -e FHIR_BASE_URL=https://your-fhir-server.com/fhir fhir-nlp-service
```

## 🧠 NLP Features

### spaCy Integration
- **Named Entity Recognition**: Extracts medical entities
- **Lemmatization**: Handles word variations (diabetic → diabetes)
- **Part-of-Speech Tagging**: Identifies verbs for intent detection
- **Dependency Parsing**: Understands relationships between words
- **Context Analysis**: Extracts numbers with surrounding context

### Intent Detection
- **Search**: "show", "find", "list", "display"
- **Count**: "how many", "count", "number of"
- **Aggregate**: "average", "mean", "median"

## 🚨 Error Handling

The service includes robust error handling for:
- FHIR API failures (falls back to empty results)
- Network timeouts (30-second timeout per request)
- Invalid queries (returns structured error responses)
- Pagination errors (graceful degradation)

## 📈 Performance

- **Concurrent Requests**: FastAPI async support
- **Caching**: Docker layer caching for faster builds
- **Pagination**: Automatic multi-page fetching (configurable)
- **Timeout Protection**: Prevents hanging requests

## 🔒 Security

- **Non-root User**: Docker container runs as `fhiruser`
- **Input Validation**: Pydantic models for request validation
- **HTTPS**: Secure connections to FHIR servers
- **Rate Limiting**: Configurable request limits

## 🐛 Troubleshooting

### Common Issues

1. **spaCy Model Missing**
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **FHIR Server Unreachable**
   - Check internet connection
   - Verify FHIR server URL
   - Check firewall settings

3. **Docker Build Fails**
   ```bash
   docker system prune
   docker build --no-cache -t fhir-nlp-service .
   ```

### Logs
```bash
# Docker logs
docker logs <container_name>

# Local logs
# Check console output for FHIR API requests and responses
```

## 📚 Additional Resources

- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [HAPI FHIR Server](https://hapi.fhir.org/)
- [spaCy Documentation](https://spacy.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
