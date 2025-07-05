import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Archmajesty Tools
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600">
            This tool helps you search cards and create characters for Archmajesty.
          </p>
          
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-medium">Features:</h3>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Upload and parse PDF rulebooks</li>
                <li>Search card database</li>
                <li>Build characters with a step-by-step wizard</li>
                <li>Export character sheets as PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;