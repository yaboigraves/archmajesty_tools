import React, { useState, useMemo } from 'react';
import { dataService } from '../services/dataService';
import type { Card } from '../data/gameData';

export const CardDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSet, setSelectedSet] = useState<string>('all');

  const allCards = dataService.getAllCards();

  // Get unique values for filters
  const colors = useMemo(() => {
    const uniqueColors = new Set(allCards.map(card => card.color).filter(Boolean));
    return Array.from(uniqueColors).sort();
  }, [allCards]);

  const types = useMemo(() => {
    const uniqueTypes = new Set(allCards.map(card => card.type).filter(Boolean));
    return Array.from(uniqueTypes).sort();
  }, [allCards]);

  const sets = useMemo(() => {
    const uniqueSets = new Set(allCards.map(card => card.set).filter(Boolean));
    return Array.from(uniqueSets).sort();
  }, [allCards]);

  // Filter cards
  const filteredCards = useMemo(() => {
    let cards = allCards;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      cards = cards.filter(card => 
        card.name.toLowerCase().includes(term) ||
        card.text?.toLowerCase().includes(term) ||
        card.keywords?.some(k => k.toLowerCase().includes(term))
      );
    }

    // Color filter
    if (selectedColor !== 'all') {
      cards = cards.filter(card => card.color === selectedColor);
    }

    // Type filter
    if (selectedType !== 'all') {
      cards = cards.filter(card => card.type === selectedType);
    }

    // Set filter
    if (selectedSet !== 'all') {
      cards = cards.filter(card => card.set === selectedSet);
    }

    return cards;
  }, [allCards, searchTerm, selectedColor, selectedType, selectedSet]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Card Database</h2>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, text, or keywords..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Colors</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Set Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Set
            </label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sets</option>
              {sets.map(set => (
                <option key={set} value={set}>{set}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCards.length} of {allCards.length} cards
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <CardDisplay key={card.id} card={card} />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cards found matching your filters.
        </div>
      )}
    </div>
  );
};

const CardDisplay: React.FC<{ card: Card }> = ({ card }) => {
  const getColorClass = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      'red': 'border-red-400 bg-red-50',
      'blue': 'border-blue-400 bg-blue-50',
      'green': 'border-green-400 bg-green-50',
      'white': 'border-gray-300 bg-gray-50',
      'black': 'border-gray-700 bg-gray-100',
    };
    return colorMap[color?.toLowerCase() || ''] || 'border-gray-300 bg-white';
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getColorClass(card.color)}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{card.name}</h3>
        <span className="text-sm font-medium bg-white px-2 py-1 rounded">
          {card.cost}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {card.type} {card.set && `• ${card.set}`}
      </div>

      {card.text && (
        <p className="text-sm mb-2">{card.text}</p>
      )}

      {(card.power !== undefined || card.toughness !== undefined) && (
        <div className="text-right text-sm font-bold">
          {card.power}/{card.toughness}
        </div>
      )}

      {card.keywords && card.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.keywords.map(keyword => (
            <span key={keyword} className="text-xs bg-gray-200 px-2 py-1 rounded">
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};