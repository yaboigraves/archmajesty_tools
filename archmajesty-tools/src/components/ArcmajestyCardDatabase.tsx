import React, { useState, useMemo } from 'react';
import { spellCards } from '../data/archmajesty';
import type { SpellCard } from '../types/archmajesty';
import spellCardsJSON from '../data/archmajesty/spellCards.json';

export const ArcmajestyCardDatabase: React.FC = () => {
  // Force component update
  console.log('=== ArcmajestyCardDatabase RENDERING ===');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Use JSON directly as a fallback
  const cardsData = spellCardsJSON as SpellCard[];
  
  // Debug log to check data
  console.log('ArcmajestyCardDatabase component loaded');
  console.log('spellCards from gameData:', spellCards?.length);
  console.log('spellCardsJSON direct:', cardsData?.length);
  console.log('Using cards data with length:', cardsData.length);
  
  // Clear any old cached data
  if (typeof window !== 'undefined' && cardsData.length > 6) {
    localStorage.removeItem('archmajesty-game-data');
    console.log('Cleared old localStorage data');
  }

  // Get unique types from all cards
  const cardTypes = useMemo(() => {
    const allTypes = new Set<string>();
    cardsData?.forEach(card => {
      card.types?.forEach(type => allTypes.add(type));
    });
    return Array.from(allTypes).sort();
  }, []);

  // Filter cards
  const filteredCards = useMemo(() => {
    let cards = cardsData || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      cards = cards.filter(card => 
        card.name.toLowerCase().includes(term) ||
        card.effect?.toLowerCase().includes(term) ||
        card.types.some(t => t.toLowerCase().includes(term)) ||
        card.id.toLowerCase().includes(term)
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
    <div className="max-w-7xl mx-auto">
      {/* Header styled like PDF */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white p-6 rounded-t-lg shadow-lg mb-6">
        <h2 className="text-3xl font-bold tracking-wide">ARCANE COMPENDIUM</h2>
        <p className="text-purple-200 mt-1">Spell Card Database</p>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-gray-900 border-2 border-purple-600 rounded-lg p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-purple-300 mb-1 uppercase tracking-wide">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, effect, type, or ID..."
              className="w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-bold text-purple-300 mb-1 uppercase tracking-wide">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Types</option>
              {cardTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Cost Filter */}
          <div>
            <label className="block text-sm font-bold text-purple-300 mb-1 uppercase tracking-wide">
              Cost Range
            </label>
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Costs</option>
              <option value="0-10">Low (0-10)</option>
              <option value="11-15">Medium (11-15)</option>
              <option value="16-20">High (16-20)</option>
              <option value="21-100">Very High (21+)</option>
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-bold text-purple-300 mb-1 uppercase tracking-wide">
              View
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-purple-500'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-3 py-2 rounded font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-purple-500'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-purple-300">
          Showing <span className="font-bold text-white">{filteredCards.length}</span> of <span className="font-bold text-white">{cardsData?.length || 0}</span> cards
        </div>
      </div>

      {/* Card Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map(card => (
            <SpellCardDisplay key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map(card => (
            <SpellCardListItem key={card.id} card={card} />
          ))}
        </div>
      )}

      {filteredCards.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-gray-900 rounded-lg border-2 border-gray-700">
          <p className="text-xl">No cards found matching your filters.</p>
          <p className="text-sm mt-2">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

const SpellCardDisplay: React.FC<{ card: SpellCard }> = ({ card }) => {
  const getTypeGradient = (types: string[]) => {
    if (types.includes('Fire')) return 'from-red-900 to-orange-800';
    if (types.includes('Wind')) return 'from-blue-900 to-cyan-800';
    if (types.includes('Stone') || types.includes('Metal')) return 'from-gray-800 to-gray-700';
    if (types.includes('Flora') || types.includes('Nature')) return 'from-green-900 to-green-800';
    if (types.includes('Water')) return 'from-blue-900 to-indigo-800';
    if (types.includes('Light')) return 'from-yellow-800 to-amber-700';
    if (types.includes('Shadow')) return 'from-purple-900 to-gray-900';
    return 'from-purple-900 to-purple-800';
  };

  const getTypeBorder = (types: string[]) => {
    if (types.includes('Fire')) return 'border-red-500';
    if (types.includes('Wind')) return 'border-blue-400';
    if (types.includes('Stone') || types.includes('Metal')) return 'border-gray-500';
    if (types.includes('Flora') || types.includes('Nature')) return 'border-green-500';
    if (types.includes('Water')) return 'border-blue-500';
    if (types.includes('Light')) return 'border-yellow-400';
    if (types.includes('Shadow')) return 'border-purple-700';
    return 'border-purple-500';
  };

  return (
    <div className={`relative border-2 ${getTypeBorder(card.types)} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gray-900`}>
      {/* Card Header */}
      <div className={`bg-gradient-to-r ${getTypeGradient(card.types)} p-3 text-white`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight">{card.name}</h3>
            <p className="text-xs opacity-75 font-mono">{card.id}</p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <div className="flex items-center bg-black bg-opacity-30 rounded px-2 py-1">
              <span className="text-lg font-bold">{card.primaryCost}</span>
              <span className="text-xs mx-1 opacity-50">|</span>
              <span className="text-lg font-bold">{card.secondaryCost}</span>
            </div>
          </div>
        </div>
        <div className="mt-1 text-xs font-medium opacity-90">
          {card.types.join(' • ')}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2 text-gray-100">
        {card.requirements && (
          <p className="text-xs text-red-400 font-medium italic">
            ⚠ {card.requirements}
          </p>
        )}

        <div className="space-y-1 text-sm border-l-2 border-purple-600 pl-3">
          {card.range && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Range:</span> <span className="text-gray-200">{card.range}</span></p>
          )}
          {card.attack && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Attack:</span> <span className="text-yellow-300 font-mono">{card.attack}</span></p>
          )}
          {card.damage && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Damage:</span> <span className="text-red-400 font-mono">{card.damage}</span></p>
          )}
        </div>

        {card.effect && (
          <div className="mt-3 p-2 bg-gray-800 rounded text-sm leading-relaxed">
            {card.effect}
          </div>
        )}

        {(card.onHit || card.onBash) && (
          <div className="mt-2 space-y-1">
            {card.onHit && (
              <p className="text-sm bg-blue-900 bg-opacity-50 rounded px-2 py-1">
                <span className="font-bold text-blue-400">On hit:</span> <span className="text-blue-200">{card.onHit}</span>
              </p>
            )}
            {card.onBash && (
              <p className="text-sm bg-green-900 bg-opacity-50 rounded px-2 py-1">
                <span className="font-bold text-green-400">On bash:</span> <span className="text-green-200">{card.onBash}</span>
              </p>
            )}
          </div>
        )}

        {card.pitchEffect && (
          <div className="mt-3 pt-3 border-t border-purple-700">
            <p className="text-sm bg-purple-900 bg-opacity-50 rounded px-2 py-1">
              <span className="font-bold text-purple-400">[Pitch]</span> <span className="text-purple-200">{card.pitchEffect}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SpellCardListItem: React.FC<{ card: SpellCard }> = ({ card }) => {
  const getTypeBorder = (types: string[]) => {
    if (types.includes('Fire')) return 'border-l-red-500';
    if (types.includes('Wind')) return 'border-l-blue-400';
    if (types.includes('Stone') || types.includes('Metal')) return 'border-l-gray-500';
    if (types.includes('Flora') || types.includes('Nature')) return 'border-l-green-500';
    if (types.includes('Water')) return 'border-l-blue-500';
    if (types.includes('Light')) return 'border-l-yellow-400';
    if (types.includes('Shadow')) return 'border-l-purple-700';
    return 'border-l-purple-500';
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 ${getTypeBorder(card.types)} border-l-4 rounded-lg p-4 hover:bg-gray-800 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <h3 className="font-bold text-lg text-white">{card.name}</h3>
            <span className="text-xs text-gray-500 font-mono">{card.id}</span>
            <span className="text-sm text-purple-400">{card.types.join(', ')}</span>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <span className="text-gray-400">
              Cost: <span className="text-white font-mono">{card.primaryCost} | {card.secondaryCost}</span>
            </span>
            {card.range && (
              <span className="text-gray-400">
                Range: <span className="text-gray-200">{card.range}</span>
              </span>
            )}
            {card.attack && (
              <span className="text-gray-400">
                Attack: <span className="text-yellow-300 font-mono">{card.attack}</span>
              </span>
            )}
            {card.damage && (
              <span className="text-gray-400">
                Damage: <span className="text-red-400 font-mono">{card.damage}</span>
              </span>
            )}
          </div>

          {card.effect && (
            <p className="mt-2 text-sm text-gray-300">{card.effect}</p>
          )}
        </div>
      </div>
    </div>
  );
};