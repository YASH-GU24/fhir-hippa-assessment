'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Patient } from '../types/fhir';

interface ResultsChartProps {
  patients: Patient[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function ResultsChart({ patients }: ResultsChartProps) {
  // Process data for charts
  const ageGroups = patients.reduce((acc, patient) => {
    const birthYear = parseInt(patient.birthDate.split('-')[0]);
    const age = new Date().getFullYear() - birthYear;
    
    let ageGroup = '';
    if (age < 30) ageGroup = '<30';
    else if (age < 50) ageGroup = '30-49';
    else if (age < 70) ageGroup = '50-69';
    else ageGroup = '70+';
    
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageData = Object.entries(ageGroups).map(([group, count]) => ({
    ageGroup: group,
    count
  }));

  const genderData = patients.reduce((acc, patient) => {
    const gender = patient.gender;
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genderChartData = Object.entries(genderData).map(([gender, count]) => ({
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    count,
    percentage: ((count / patients.length) * 100).toFixed(1)
  }));

  // Extract conditions from patients
  const conditionsData = patients.reduce((acc, patient) => {
    if (patient.contained) {
      patient.contained.forEach(resource => {
        if (resource.resourceType === 'Condition') {
          const condition = resource.code.coding[0].display;
          acc[condition] = (acc[condition] || 0) + 1;
        }
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const conditionChartData = Object.entries(conditionsData).map(([condition, count]) => ({
    condition: condition.length > 20 ? condition.substring(0, 20) + '...' : condition,
    count
  }));

  if (patients.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No data to display
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution Bar Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Age Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="ageGroup" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} patients`, 'Count']}
              labelFormatter={(label) => `Age Group: ${label}`}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gender Distribution Pie Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Gender Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={genderChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ gender, percentage }) => `${gender} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {genderChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} patients`, 'Count']} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Conditions Distribution (if any) */}
      {conditionChartData.length > 0 && (
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Medical Conditions</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={conditionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="condition" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} patients`, 'Count']}
                labelFormatter={(label) => `Condition: ${label}`}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Stats */}
      <div className="card lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(patients.reduce((sum, p) => {
                const age = new Date().getFullYear() - parseInt(p.birthDate.split('-')[0]);
                return sum + age;
              }, 0) / patients.length)}
            </div>
            <div className="text-sm text-gray-600">Average Age</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(conditionsData).length}
            </div>
            <div className="text-sm text-gray-600">Unique Conditions</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Object.keys(genderData).length}
            </div>
            <div className="text-sm text-gray-600">Gender Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
}
