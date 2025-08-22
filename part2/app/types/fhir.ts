export interface FHIRQueryRequest {
  query: string;
  max_results?: number;
}

export interface ExtractedEntity {
  conditions: Array<{
    term: string;
    code: string;
    system: string;
    display: string;
  }>;
  age_filters: Array<{
    operator: string;
    value?: number;
    min?: number;
    max?: number;
  }>;
  gender: string | null;
  intent: string;
  resource_types: string[];
}

export interface FHIRQuery {
  resourceType: string;
  parameters: Record<string, any>;
  _include?: string[];
  _count?: number;
}

export interface Patient {
  resourceType: string;
  id: string;
  active: boolean;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  gender: string;
  birthDate: string;
  address?: Array<{
    use: string;
    city: string;
    state: string;
    postalCode: string;
  }>;
  contained?: any[];
}

export interface FHIRQueryResponse {
  original_query: string;
  extracted_entities: ExtractedEntity;
  fhir_query: FHIRQuery;
  fhir_url?: string;
  simulated_url?: string;
  results?: Patient[];
  example_results?: Patient[];
}

export interface QuerySuggestion {
  text: string;
  category: 'condition' | 'demographic' | 'complex';
  description: string;
}
