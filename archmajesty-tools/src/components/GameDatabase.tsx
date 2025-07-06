import React, { useState, useMemo } from 'react';
import type { SpellCard, Equipment } from '../types/archmajesty';

// Import all game data
import spellCardsData from '../data/archmajesty/spellCards.json';
import equipmentData from '../data/archmajesty/equipment.json';
import consumablesData from '../data/archmajesty/consumables.json';
import artefactsData from '../data/archmajesty/artefacts.json';

type TabType = 'spells' | 'equipment' | 'consumables' | 'artefacts';

export const GameDatabase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('spells');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load data
  const spellCards = spellCardsData as SpellCard[];
  const equipment = equipmentData as Equipment[];
  const consumables = consumablesData as any[];
  const artefacts = artefactsData as any[];
  
  // Debug logging
  console.log('GameDatabase loaded:');
  console.log('- Spell cards:', spellCards.length);
  console.log('- Equipment:', equipment.length);
  console.log('- Consumables:', consumables.length);
  console.log('- Artefacts:', artefacts.length);
  console.log('First spell card:', spellCards[0]);

  // Get unique types based on active tab
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    
    switch (activeTab) {
      case 'spells':
        spellCards.forEach(card => card.types?.forEach(type => types.add(type)));
        break;
      case 'equipment':
        equipment.forEach(item => {
          if (item.type) types.add(item.type);
          if ((item as any).subtype) types.add((item as any).subtype);
        });
        break;
      case 'consumables':
        types.add('consumable');
        break;
      case 'artefacts':
        types.add('artefact');
        break;
    }
    
    return Array.from(types).sort();
  }, [activeTab]);

  // Filter items based on search and type
  const filteredItems = useMemo(() => {
    let items: any[] = [];
    
    switch (activeTab) {
      case 'spells':
        items = spellCards;
        break;
      case 'equipment':
        items = equipment;
        break;
      case 'consumables':
        items = consumables;
        break;
      case 'artefacts':
        items = artefacts;
        break;
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name?.toLowerCase().includes(term) ||
        item.effect?.toLowerCase().includes(term) ||
        (item.types && item.types.some((t: string) => t.toLowerCase().includes(term))) ||
        item.id?.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      items = items.filter(item => {
        if (item.types) {
          return item.types.includes(selectedType);
        }
        if (item.type === selectedType || (item as any).subtype === selectedType) {
          return true;
        }
        return false;
      });
    }

    return items;
  }, [activeTab, searchTerm, selectedType]);

  const tabs = [
    { id: 'spells', label: 'Spell Cards', count: spellCards.length },
    { id: 'equipment', label: 'Equipment', count: equipment.length },
    { id: 'consumables', label: 'Consumables', count: consumables.length },
    { id: 'artefacts', label: 'Artefacts', count: artefacts.length },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="bg-gray-900 rounded-t-lg border-2 border-purple-600 border-b-0 overflow-hidden">
        <div className="flex flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setSelectedType('all');
              }}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wide transition-colors flex-1 sm:flex-initial ${
                activeTab === tab.id
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900 border-2 border-purple-600 rounded-b-lg p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-purple-300 mb-1 uppercase tracking-wide">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-bold text-purple-300 mb-1 uppercase tracking-wide">
              Filter Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-purple-500 rounded text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
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
          Showing <span className="font-bold text-white">{filteredItems.length}</span> {activeTab}
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} type={activeTab} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => (
            <ItemListRow key={item.id} item={item} type={activeTab} />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-gray-900 rounded-lg border-2 border-gray-700">
          <p className="text-xl">No {activeTab} found matching your filters.</p>
          <p className="text-sm mt-2">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

// Card Display Component
const ItemCard: React.FC<{ item: any; type: TabType }> = ({ item, type }) => {
  const getTypeColor = () => {
    if (type === 'spells' && item.types) {
      if (item.types.includes('Fire')) return 'from-red-900 to-orange-800 border-red-500';
      if (item.types.includes('Wind')) return 'from-blue-900 to-cyan-800 border-blue-400';
      if (item.types.includes('Stone') || item.types.includes('Metal')) return 'from-gray-800 to-gray-700 border-gray-500';
      if (item.types.includes('Nature')) return 'from-green-900 to-green-800 border-green-500';
      if (item.types.includes('Water')) return 'from-blue-900 to-indigo-800 border-blue-500';
      if (item.types.includes('Light')) return 'from-yellow-800 to-amber-700 border-yellow-400';
      if (item.types.includes('Shadow')) return 'from-purple-900 to-gray-900 border-purple-700';
    }
    if (type === 'equipment') return 'from-gray-800 to-gray-700 border-gray-500';
    if (type === 'consumables') return 'from-green-900 to-green-800 border-green-500';
    if (type === 'artefacts') return 'from-purple-900 to-purple-800 border-purple-500';
    return 'from-purple-900 to-purple-800 border-purple-500';
  };

  const colors = getTypeColor();

  return (
    <div className={`relative border-2 ${colors.split(' ')[2]} rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 bg-gray-900`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${colors.split(' ').slice(0, 2).join(' ')} p-3 text-white`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
            {item.id && <p className="text-xs opacity-75 font-mono">{item.id}</p>}
          </div>
          {type === 'spells' && item.primaryCost !== undefined && (
            <div className="flex items-center bg-black bg-opacity-30 rounded px-2 py-1 ml-2">
              <span className="text-lg font-bold">{item.primaryCost}</span>
              <span className="text-xs mx-1 opacity-50">|</span>
              <span className="text-lg font-bold">{item.secondaryCost}</span>
            </div>
          )}
          {(type === 'equipment' || type === 'artefacts') && item.slots !== undefined && (
            <div className="bg-black bg-opacity-30 rounded px-2 py-1 ml-2">
              <span className="text-sm font-bold">{item.slots} slot{item.slots !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {item.types && (
          <div className="mt-1 text-xs font-medium opacity-90">
            {item.types.join(' • ')}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-2 text-gray-100">
        {/* Requirements */}
        {item.requirements && (
          <p className="text-xs text-red-400 font-medium italic">
            ⚠ {item.requirements}
          </p>
        )}

        {/* Stats */}
        <div className="space-y-1 text-sm border-l-2 border-purple-600 pl-3">
          {item.range && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Range:</span> <span className="text-gray-200">{item.range}</span></p>
          )}
          {item.weaponRange && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Range:</span> <span className="text-gray-200">{item.weaponRange}</span></p>
          )}
          {item.attack && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Attack:</span> <span className="text-yellow-300 font-mono">{item.attack}</span></p>
          )}
          {item.damage && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Damage:</span> <span className="text-red-400 font-mono">{item.damage}</span></p>
          )}
          {item.cost !== undefined && type === 'artefacts' && (
            <p><span className="text-purple-400 font-bold uppercase text-xs">Cost:</span> <span className="text-yellow-300">{item.cost} points</span></p>
          )}
        </div>

        {/* Effect */}
        {item.effect && (
          <div className="mt-3 p-2 bg-gray-800 rounded text-sm leading-relaxed">
            {item.effect}
          </div>
        )}

        {/* Special Effects */}
        {(item.onHit || item.onBash) && (
          <div className="mt-2 space-y-1">
            {item.onHit && (
              <p className="text-sm bg-blue-900 bg-opacity-50 rounded px-2 py-1">
                <span className="font-bold text-blue-400">On hit:</span> <span className="text-blue-200">{item.onHit}</span>
              </p>
            )}
            {item.onBash && (
              <p className="text-sm bg-green-900 bg-opacity-50 rounded px-2 py-1">
                <span className="font-bold text-green-400">On bash:</span> <span className="text-green-200">{item.onBash}</span>
              </p>
            )}
          </div>
        )}

        {/* Pitch Effect */}
        {item.pitchEffect && (
          <div className="mt-3 pt-3 border-t border-purple-700">
            <p className="text-sm bg-purple-900 bg-opacity-50 rounded px-2 py-1">
              <span className="font-bold text-purple-400">[Pitch]</span> <span className="text-purple-200">{item.pitchEffect}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// List Display Component
const ItemListRow: React.FC<{ item: any; type: TabType }> = ({ item, type }) => {
  const getTypeBorder = () => {
    if (type === 'spells' && item.types) {
      if (item.types.includes('Fire')) return 'border-l-red-500';
      if (item.types.includes('Wind')) return 'border-l-blue-400';
      if (item.types.includes('Stone') || item.types.includes('Metal')) return 'border-l-gray-500';
      if (item.types.includes('Nature')) return 'border-l-green-500';
      if (item.types.includes('Water')) return 'border-l-blue-500';
      if (item.types.includes('Light')) return 'border-l-yellow-400';
      if (item.types.includes('Shadow')) return 'border-l-purple-700';
    }
    if (type === 'equipment') return 'border-l-gray-500';
    if (type === 'consumables') return 'border-l-green-500';
    if (type === 'artefacts') return 'border-l-purple-500';
    return 'border-l-purple-500';
  };

  return (
    <div className={`bg-gray-900 border border-gray-700 ${getTypeBorder()} border-l-4 rounded-lg p-4 hover:bg-gray-800 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="font-bold text-lg text-white">{item.name}</h3>
            {item.id && <span className="text-xs text-gray-500 font-mono">{item.id}</span>}
            {item.types && <span className="text-sm text-purple-400">{item.types.join(', ')}</span>}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            {type === 'spells' && item.primaryCost !== undefined && (
              <span className="text-gray-400">
                Cost: <span className="text-white font-mono">{item.primaryCost} | {item.secondaryCost}</span>
              </span>
            )}
            {(type === 'equipment' || type === 'artefacts') && item.slots !== undefined && (
              <span className="text-gray-400">
                Slots: <span className="text-white">{item.slots}</span>
              </span>
            )}
            {(item.range || item.weaponRange) && (
              <span className="text-gray-400">
                Range: <span className="text-gray-200">{item.range || item.weaponRange}</span>
              </span>
            )}
            {item.attack && (
              <span className="text-gray-400">
                Attack: <span className="text-yellow-300 font-mono">{item.attack}</span>
              </span>
            )}
            {item.damage && (
              <span className="text-gray-400">
                Damage: <span className="text-red-400 font-mono">{item.damage}</span>
              </span>
            )}
          </div>

          {item.effect && (
            <p className="mt-2 text-sm text-gray-300">{item.effect}</p>
          )}
        </div>
      </div>
    </div>
  );
};