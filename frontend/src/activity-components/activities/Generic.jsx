import React from 'react';

function Generic({ data = {} }) {
  return (
    <div className="generic-container">
      <h2 className="text-2xl font-semibold text-gray-600 border-b-2 border-gray-600 pb-2 mb-4">
        Generic Activity
      </h2>
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-700">
          This is a generic activity component. It can be used as a fallback when a specific activity component is not available.
        </p>
        {Object.keys(data).length > 0 && (
          <div className="mt-4 p-3 bg-white rounded border">
            <h3 className="font-semibold mb-2">Activity Data:</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Generic;