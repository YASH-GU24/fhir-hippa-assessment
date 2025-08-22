'use client';

import { useState } from 'react';
import axios from 'axios';
import { FHIRQueryResponse, QuerySuggestion } from './types/fhir';
import QueryInput from './components/QueryInput';
import ResultsChart from './components/ResultsChart';
import ResultsTable from './components/ResultsTable';

import { Activity, Stethoscope, AlertCircle } from 'lucide-react';

const QUERY_SUGGESTIONS: QuerySuggestion[] = [
  {
    text: "Show me all diabetic patients over 50",
    category: "condition",
    description: "Find patients with diabetes mellitus who are older than 50 years"
  },
  {
    text: "Find female patients with hypertension under 65",
    category: "demographic",
    description: "Search for female patients with high blood pressure under 65 years old"
  },
  {
    text: "List patients with asthma between 30 and 45 years old",
    category: "condition",
    description: "Get patients diagnosed with asthma in the 30-45 age range"
  },
  {
    text: "How many male patients have depression?",
    category: "demographic",
    description: "Count male patients diagnosed with depressive disorders"
  },
  {
    text: "Find all patients with cancer under 40",
    category: "condition",
    description: "Search for cancer patients in younger age group"
  }
];

export default function Home() {
  const [result, setResult] = useState<FHIRQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, we'll use mock data since the backend might not be running
      // In production, this would call the actual backend
      const mockResponse = await simulateBackendCall(query);
      setResult(mockResponse);
    } catch (err) {
      console.error('Query error:', err);
      setError('Failed to process query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock backend call for demo purposes
  const simulateBackendCall = async (query: string): Promise<FHIRQueryResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock entity extraction based on query content
    const entities = {
      conditions: [] as Array<{
        term: string;
        code: string;
        system: string;
        display: string;
      }>,
      age_filters: [] as Array<{
        operator: string;
        value?: number;
        min?: number;
        max?: number;
      }>,
      gender: null as string | null,
      intent: 'search',
      resource_types: ['Patient']
    };

    // Extract conditions
    if (query.toLowerCase().includes('diabetic') || query.toLowerCase().includes('diabetes')) {
      entities.conditions.push({
        term: 'diabetes',
        code: '44054006',
        system: 'http://snomed.info/sct',
        display: 'Diabetes mellitus'
      });
    }
    if (query.toLowerCase().includes('hypertension')) {
      entities.conditions.push({
        term: 'hypertension',
        code: '38341003',
        system: 'http://snomed.info/sct',
        display: 'Hypertension'
      });
    }
    if (query.toLowerCase().includes('asthma')) {
      entities.conditions.push({
        term: 'asthma',
        code: '195967001',
        system: 'http://snomed.info/sct',
        display: 'Asthma'
      });
    }

    // Extract age filters
    const ageMatch = query.match(/(over|above|under|below)\s+(\d+)/i);
    if (ageMatch) {
      const operator = ageMatch[1].toLowerCase() === 'over' || ageMatch[1].toLowerCase() === 'above' ? '>' : '<';
      entities.age_filters.push({
        operator,
        value: parseInt(ageMatch[2])
      });
    }

    const rangeMatch = query.match(/between\s+(\d+)\s+and\s+(\d+)/i);
    if (rangeMatch) {
      entities.age_filters.push({
        operator: 'range',
        min: parseInt(rangeMatch[1]),
        max: parseInt(rangeMatch[2])
      });
    }

    // Extract gender
    if (query.toLowerCase().includes('male') && !query.toLowerCase().includes('female')) {
      entities.gender = 'male';
    } else if (query.toLowerCase().includes('female')) {
      entities.gender = 'female';
    }

    // Extract intent
    if (query.toLowerCase().includes('how many') || query.toLowerCase().includes('count')) {
      entities.intent = 'count';
    }

    // Generate mock patients
    const mockPatients = [];
    const patientCount = Math.floor(Math.random() * 8) + 3; // 3-10 patients

    for (let i = 0; i < patientCount; i++) {
      const age = entities.age_filters.length > 0 
        ? (entities.age_filters[0].operator === '>' 
          ? entities.age_filters[0].value! + Math.floor(Math.random() * 20) + 1
          : entities.age_filters[0].value! - Math.floor(Math.random() * 20) - 1)
        : Math.floor(Math.random() * 60) + 20;

      const birthYear = new Date().getFullYear() - Math.max(age, 18);
      const gender = entities.gender || (Math.random() > 0.5 ? 'male' : 'female');
      
      const patient = {
        resourceType: 'Patient',
        id: `patient-${1000 + i}`,
        active: true,
        name: [{
          use: 'official',
          family: `Patient${i + 1}`,
          given: [gender === 'male' ? 'John' : 'Jane']
        }],
        gender,
        birthDate: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
        address: [{
          use: 'home',
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][i % 5],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][i % 5],
          postalCode: `${10001 + i * 1000}`
        }],
        contained: [] as any[]
      };

      // Add conditions
      entities.conditions.forEach(condition => {
        patient.contained.push({
          resourceType: 'Condition',
          id: `condition-${patient.id}-${condition.code}`,
          subject: { reference: `Patient/${patient.id}` },
          code: {
            coding: [{
              system: condition.system,
              code: condition.code,
              display: condition.display
            }]
          },
          clinicalStatus: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active'
            }]
          },
          onsetDateTime: `${birthYear + 20}-01-01`
        });
      });

      mockPatients.push(patient);
    }

    // Build FHIR query parameters
    const parameters: any = {};
    if (entities.conditions.length > 0) {
      parameters['_has:Condition:subject:code'] = entities.conditions.map(c => c.code).join(',');
    }
    if (entities.age_filters.length > 0) {
      const filter = entities.age_filters[0];
      if (filter.operator === '>') {
        const birthYear = new Date().getFullYear() - filter.value!;
        parameters['birthdate'] = `le${birthYear}-12-31`;
      } else if (filter.operator === '<') {
        const birthYear = new Date().getFullYear() - filter.value!;
        parameters['birthdate'] = `ge${birthYear}-01-01`;
      }
    }
    if (entities.gender) {
      parameters['gender'] = entities.gender;
    }

    const baseUrl = 'https://hapi.fhir.org/baseR4';
    const resourceType = 'Patient';
    const paramString = Object.entries(parameters).map(([k, v]) => `${k}=${v}`).join('&');
    const simulatedUrl = `${baseUrl}/${resourceType}${paramString ? '?' + paramString : ''}`;

    return {
      original_query: query,
      extracted_entities: entities,
      fhir_query: {
        resourceType,
        parameters,
        _include: entities.conditions.length > 0 ? ['Patient:condition'] : undefined,
        _count: 100
      },
      simulated_url: simulatedUrl,
      example_results: mockPatients
    };
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Stethoscope className="w-8 h-8 text-primary-600" />
            <h1 className="text-4xl font-bold" style={{color: 'rgb(31, 41, 55)'}}>FHIR NLP Query Tool</h1>
          </div>
          <p className="text-xl max-w-3xl mx-auto" style={{color: 'rgb(75, 85, 99)'}}>
            AI-powered healthcare data querying with natural language processing. 
            Ask questions about patients in plain English and get FHIR-compliant results.
          </p>
        </div>

        {/* Query Input */}
        <div className="mb-8">
          <QueryInput 
            onSubmit={handleQuery} 
            loading={loading} 
            suggestions={QUERY_SUGGESTIONS}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary-600 animate-pulse" />
              <span className="text-lg text-gray-600">Processing your query...</span>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Extracting entities • Mapping to FHIR • Generating results
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8">
            {/* Charts */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{color: 'rgb(31, 41, 55)'}}>
                <Activity className="w-6 h-6 text-primary-600" />
                Data Visualization
              </h2>
              <ResultsChart patients={result.results || result.example_results || []} />
            </div>

            {/* Table */}
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{color: 'rgb(31, 41, 55)'}}>
                Patient Details
              </h2>
              <ResultsTable patients={result.results || result.example_results || []} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>
            This is a demonstration of AI-powered FHIR querying capabilities. 
            Results are simulated for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
