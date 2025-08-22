'use client';

import { useState } from 'react';
import { FHIRQueryResponse } from '../types/fhir';
import { ChevronDown, ChevronUp, Code, Database, Brain, ExternalLink } from 'lucide-react';

interface QueryDetailsProps {
  result: FHIRQueryResponse;
}

export default function QueryDetails({ result }: QueryDetailsProps) {
  const [expanded, setExpanded] = useState(false);

  const formatEntityValue = (value: any): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 'None';
      return value.map(item => {
        if (typeof item === 'object') {
          return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
        }
        return String(item);
      }).join('; ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ');
    }
    return String(value || 'None');
  };

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary-600" />
          Query Analysis & FHIR Mapping
        </h3>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="mt-6 space-y-6">
          {/* Original Query */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Original Query
            </h4>
            <div className="bg-gray-50 p-3 rounded-md border">
              <code className="text-sm text-gray-900">"{result.original_query}"</code>
            </div>
          </div>

          {/* Extracted Entities */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Extracted Entities
            </h4>
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Intent:</span>
                  <span className="ml-2 text-blue-700 capitalize">{result.extracted_entities.intent}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Resource Types:</span>
                  <span className="ml-2 text-blue-700">{result.extracted_entities.resource_types.join(', ')}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Gender Filter:</span>
                  <span className="ml-2 text-blue-700">{result.extracted_entities.gender || 'None'}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Age Filters:</span>
                  <span className="ml-2 text-blue-700">{formatEntityValue(result.extracted_entities.age_filters)}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-blue-800">Medical Conditions:</span>
                  <div className="ml-2 mt-1">
                    {result.extracted_entities.conditions.length > 0 ? (
                      result.extracted_entities.conditions.map((condition, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-blue-200 mb-2">
                          <div className="text-blue-800 font-medium">{condition.display}</div>
                          <div className="text-xs text-blue-700">
                            Code: {condition.code} | System: {condition.system}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-blue-700">None specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FHIR Query Parameters */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Generated FHIR Query
            </h4>
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium text-green-800">Resource Type:</span>
                  <span className="ml-2 text-green-700">{result.fhir_query.resourceType}</span>
                </div>
                <div>
                  <span className="font-medium text-green-800">Parameters:</span>
                  <div className="ml-2 mt-1 bg-white p-3 rounded border border-green-200">
                    <pre className="text-xs text-green-800 whitespace-pre-wrap">
                      {JSON.stringify(result.fhir_query.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
                {result.fhir_query._include && (
                  <div>
                    <span className="font-medium text-green-800">Include:</span>
                    <span className="ml-2 text-green-700">{result.fhir_query._include.join(', ')}</span>
                  </div>
                )}
                {result.fhir_query._count && (
                  <div>
                    <span className="font-medium text-green-800">Count Limit:</span>
                    <span className="ml-2 text-green-700">{result.fhir_query._count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generated FHIR URL */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              FHIR API URL
            </h4>
            <div className="bg-purple-50 p-3 rounded-md border border-purple-200">
              <div className="flex items-start gap-2">
                <code className="text-xs text-purple-900 break-all flex-1">
                  {result.fhir_url || result.simulated_url}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(result.fhir_url || result.simulated_url || '')}
                  className="text-purple-600 hover:text-purple-800 text-xs font-medium whitespace-nowrap"
                >
                  Copy URL
                </button>
              </div>
              <div className="mt-2 text-xs text-purple-600">
                This URL can be used with any FHIR R4 compliant server
              </div>
            </div>
          </div>

          {/* Processing Summary */}
          <div className="bg-gray-50 p-4 rounded-md border">
            <h5 className="font-medium text-gray-900 mb-2">Processing Summary</h5>
            <div className="text-sm text-gray-800 space-y-1">
              <div>✓ Natural language query parsed successfully</div>
              <div>✓ Medical entities extracted and mapped to SNOMED CT codes</div>
              <div>✓ FHIR search parameters generated</div>
              <div>✓ {result.results?.length || result.example_results?.length || 0} patient records returned</div>
              <div>✓ Results formatted for display and analysis</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
