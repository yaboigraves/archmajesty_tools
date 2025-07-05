import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../services/store';
import { Card } from '../types';

export const CardSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'type'>('name');
  
  const { cards, setFilteredCards, filteredCards } = useStore();

  // Extract unique colors and types from cards
  const uniqueColors = useMemo(() => {
    const colors = new Set<string>();
    cards.forEach(card => {
      if (card.color) colors.add(card.color);
    });
    return Array.from(colors).sort();
  }, [cards]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    cards.forEach(card => {
      if (card.type) types.add(card.type);
    });
    return Array.from(types).sort();
  }, [cards]);

  useEffect(() => {
    let filtered = [...cards];

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(lowerSearch) ||
        card.text?.toLowerCase().includes(lowerSearch) ||
        card.keywords?.some(k => k.toLowerCase().includes(lowerSearch))
      );
    }

    // Filter by color
    if (selectedColor !== 'all') {
      filtered = filtered.filter(card => card.color === selectedColor);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(card => card.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost':
          const aCost = typeof a.cost === 'number' ? a.cost : parseInt(a.cost || '0');
          const bCost = typeof b.cost === 'number' ? b.cost : parseInt(b.cost || '0');
          return aCost - bCost;
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

    setFilteredCards(filtered);
  }, [searchTerm, selectedColor, selectedType, sortBy, cards, setFilteredCards]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Cards
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
            {uniqueColors.map(color => (
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
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('name')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'name' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('cost')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'cost' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cost
            </button>
            <button
              onClick={() => setSortBy('type')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'type' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Type
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredCards.length} cards found
        </div>
      </div>
    </div>
  );
};