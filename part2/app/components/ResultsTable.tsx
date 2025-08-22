'use client';

import { useState } from 'react';
import { Patient } from '../types/fhir';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsTableProps {
  patients: Patient[];
}

export default function ResultsTable({ patients }: ResultsTableProps) {
  const [sortField, setSortField] = useState<'name' | 'age' | 'gender' | 'conditions'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  // Extract unique values for filters
  const uniqueConditions = Array.from(new Set(
    patients.flatMap(p => 
      p.contained?.filter(c => c.resourceType === 'Condition')
        .map(c => c.code.coding[0].display) || []
    )
  ));

  const uniqueGenders = Array.from(new Set(patients.map(p => p.gender)));

  // Apply filters
  const filteredPatients = patients.filter(patient => {
    const age = new Date().getFullYear() - parseInt(patient.birthDate.split('-')[0]);
    const conditions = patient.contained?.filter(c => c.resourceType === 'Condition')
      .map(c => c.code.coding[0].display) || [];

    const ageMatch = ageFilter === 'all' || 
      (ageFilter === '<30' && age < 30) ||
      (ageFilter === '30-49' && age >= 30 && age < 50) ||
      (ageFilter === '50-69' && age >= 50 && age < 70) ||
      (ageFilter === '70+' && age >= 70);

    const genderMatch = genderFilter === 'all' || patient.gender === genderFilter;
    
    const conditionMatch = conditionFilter === 'all' || conditions.includes(conditionFilter);

    return ageMatch && genderMatch && conditionMatch;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = `${a.name[0].given[0]} ${a.name[0].family}`.toLowerCase();
        bValue = `${b.name[0].given[0]} ${b.name[0].family}`.toLowerCase();
        break;
      case 'age':
        aValue = new Date().getFullYear() - parseInt(a.birthDate.split('-')[0]);
        bValue = new Date().getFullYear() - parseInt(b.birthDate.split('-')[0]);
        break;
      case 'gender':
        aValue = a.gender.toLowerCase();
        bValue = b.gender.toLowerCase();
        break;
      case 'conditions':
        const aConditions = a.contained?.filter(c => c.resourceType === 'Condition').length || 0;
        const bConditions = b.contained?.filter(c => c.resourceType === 'Condition').length || 0;
        aValue = aConditions;
        bValue = bConditions;
        break;
      default:
        aValue = '';
        bValue = '';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortDirection === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  if (patients.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No patients to display
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 lg:mb-0">
          Patient Results ({filteredPatients.length} of {patients.length})
        </h3>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Filters:</span>
          </div>
          
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Ages</option>
            <option value="<30">&lt;30 years</option>
            <option value="30-49">30-49 years</option>
            <option value="50-69">50-69 years</option>
            <option value="70+">70+ years</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Genders</option>
            {uniqueGenders.map(gender => (
              <option key={gender} value={gender}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </option>
            ))}
          </select>

          {uniqueConditions.length > 0 && (
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Conditions</option>
              {uniqueConditions.map(condition => (
                <option key={condition} value={condition}>
                  {condition.length > 30 ? condition.substring(0, 30) + '...' : condition}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center">
                  Age
                  <SortIcon field="age" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gender')}
              >
                <div className="flex items-center">
                  Gender
                  <SortIcon field="gender" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Birth Date
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('conditions')}
              >
                <div className="flex items-center">
                  Conditions
                  <SortIcon field="conditions" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPatients.map((patient) => {
              const age = new Date().getFullYear() - parseInt(patient.birthDate.split('-')[0]);
              const conditions = patient.contained?.filter(c => c.resourceType === 'Condition')
                .map(c => c.code.coding[0].display) || [];
              const address = patient.address?.[0];

              return (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {patient.name[0].given[0]} {patient.name[0].family}
                    </div>
                    <div className="text-sm text-gray-500">ID: {patient.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="capitalize">{patient.gender}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {patient.birthDate}
                  </td>
                  <td className="px-6 py-4">
                    {conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {conditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                          >
                            {condition.length > 20 ? condition.substring(0, 20) + '...' : condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">None recorded</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {address ? (
                      <div>
                        <div>{address.city}, {address.state}</div>
                        <div className="text-gray-500">{address.postalCode}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
