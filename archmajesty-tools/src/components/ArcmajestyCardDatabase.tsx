import React, { useState, useMemo } from 'react';
import { spellCards } from '../data/archmajesty/gameData';
import type { SpellCard } from '../types/archmajesty';

export const ArcmajestyCardDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<string>('all');

  // Get unique types from all cards
  const cardTypes = useMemo(() => {
    const allTypes = new Set<string>();
    spellCards?.forEach(card => {
      card.types?.forEach(type => allTypes.add(type));
    });
    return Array.from(allTypes).sort();
  }, []);

  // Filter cards
  const filteredCards = useMemo(() => {
    let cards = spellCards || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      cards = cards.filter(card => 
        card.name.toLowerCase().includes(term) ||
        card.effect?.toLowerCase().includes(term) ||
        card.types.some(t => t.toLowerCase().includes(term))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      cards = cards.filter(card => card.types.includes(selectedType));
    }

    // Cost filter
    if (costFilter !== 'all') {
      const [min, max] = costFilter.split('-').map(Number);
      cards = cards.filter(card => 
        card.primaryCost >= min && card.primaryCost <= (max || 100)
      );
    }

    return cards;
  }, [searchTerm, selectedType, costFilter]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Spell Card Database</h2>
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, effect, or type..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              {cardTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Cost Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Range
            </label>
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Costs</option>
              <option value="0-10">Low (0-10)</option>
              <option value="11-15">Medium (11-15)</option>
              <option value="16-20">High (16-20)</option>
              <option value="21-100">Very High (21+)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredCards.length} of {spellCards?.length || 0} cards
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => (
          <SpellCardDisplay key={card.id} card={card} />
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

const SpellCardDisplay: React.FC<{ card: SpellCard }> = ({ card }) => {
  const getTypeColor = (types: string[]) => {
    if (types.includes('Fire')) return 'border-red-400 bg-red-50';
    if (types.includes('Wind')) return 'border-blue-400 bg-blue-50';
    if (types.includes('Stone') || types.includes('Metal')) return 'border-gray-400 bg-gray-50';
    if (types.includes('Flora')) return 'border-green-400 bg-green-50';
    return 'border-purple-400 bg-purple-50';
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${getTypeColor(card.types)}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">{card.name}</h3>
          <p className="text-xs text-gray-600">{card.id}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium bg-white px-2 py-1 rounded">
              {card.primaryCost}
            </span>
            <span className="text-xs text-gray-500">|</span>
            <span className="text-sm font-medium bg-white px-2 py-1 rounded">
              {card.secondaryCost}
            </span>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {card.types.join(', ')}
      </div>

      {card.requirements && (
        <p className="text-xs text-red-600 mb-1">
          Req: {card.requirements}
        </p>
      )}

      <div className="space-y-1 text-sm">
        {card.range && (
          <p><span className="font-medium">Range:</span> {card.range}</p>
        )}
        {card.attack && (
          <p><span className="font-medium">Attack:</span> {card.attack}</p>
        )}
        {card.damage && (
          <p><span className="font-medium">Damage:</span> {card.damage}</p>
        )}
      </div>

      {card.effect && (
        <p className="text-sm mt-2">{card.effect}</p>
      )}

      {card.onHit && (
        <p className="text-sm mt-1 text-blue-700">
          <span className="font-medium">On hit:</span> {card.onHit}
        </p>
      )}

      {card.onBash && (
        <p className="text-sm mt-1 text-green-700">
          <span className="font-medium">On bash:</span> {card.onBash}
        </p>
      )}

      {card.pitchEffect && (
        <p className="text-sm mt-2 pt-2 border-t border-gray-300 text-purple-700">
          <span className="font-medium">[Pitch]</span> {card.pitchEffect}
        </p>
      )}
    </div>
  );
};