import React from 'react';
import { useStore } from '../../services/store';
import { CardSearch } from './CardSearch';
import { CardDisplay } from './CardDisplay';

export const CardDatabase: React.FC = () => {
  const { filteredCards, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cards...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Card Database</h2>
      
      <CardSearch />
      
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No cards found.</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your search filters or upload PDFs containing card data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCards.map((card) => (
            <CardDisplay key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};