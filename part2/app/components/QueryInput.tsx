'use client';

import { useState } from 'react';
import { Search, Lightbulb } from 'lucide-react';
import { QuerySuggestion } from '../types/fhir';

interface QueryInputProps {
  onSubmit: (query: string) => void;
  loading: boolean;
  suggestions: QuerySuggestion[];
}

export default function QueryInput({ onSubmit, loading, suggestions }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: QuerySuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.text.toLowerCase().includes(query.toLowerCase()) && query.length > 2
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            placeholder="Ask about patients in natural language... (e.g., 'Show me diabetic patients over 50')"
            className="w-full px-4 py-4 pl-12 pr-16 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition-all duration-200"
            disabled={loading}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Search'}
          </button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && (query.length === 0 || filteredSuggestions.length > 0) && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {query.length === 0 ? (
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
                  <Lightbulb className="w-4 h-4" />
                  Try these example queries:
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-800">{suggestion.text}</div>
                    <div className="text-sm text-gray-500 mt-1">{suggestion.description}</div>
                    <div className="text-xs text-primary-600 mt-1 capitalize">{suggestion.category} query</div>
                  </button>
                ))}
              </div>
            ) : (
              filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="font-medium text-gray-800">{suggestion.text}</div>
                  <div className="text-sm text-gray-500">{suggestion.description}</div>
                </button>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  );
}
