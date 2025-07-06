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

  // Get unique types based on active tab
  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    
    switch (activeTab) {
      case 'spells':
        spellCards.forEach(card => {
          if (card.types && Array.isArray(card.types)) {
            card.types.forEach(type => types.add(type));
          }
        });
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
    
    console.log(`Unique types for ${activeTab}:`, Array.from(types));
    return Array.from(types).sort();
  }, [activeTab, spellCards, equipment, consumables, artefacts]);

  // Filter items based on search and type
  const filteredItems = useMemo(() => {
    let items: any[] = [];
    
    switch (activeTab) {
      case 'spells':
        items = [...spellCards];
        break;
      case 'equipment':
        items = [...equipment];
        break;
      case 'consumables':
        items = [...consumables];
        break;
      case 'artefacts':
        items = [...artefacts];
        break;
    }

    console.log(`Filtering ${activeTab}: starting with ${items.length} items`);

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      items = items.filter(item => {
        const matchName = item.name?.toLowerCase().includes(term);
        const matchEffect = item.effect?.toLowerCase().includes(term);
        const matchTypes = item.types && item.types.some((t: string) => t.toLowerCase().includes(term));
        const matchId = item.id?.toLowerCase().includes(term);
        return matchName || matchEffect || matchTypes || matchId;
      });
      console.log(`After search filter: ${items.length} items`);
    }

    // Apply type filter
    if (selectedType !== 'all') {
      items = items.filter(item => {
        if (item.types && Array.isArray(item.types)) {
          return item.types.includes(selectedType);
        }
        if (item.type === selectedType || (item as any).subtype === selectedType) {
          return true;
        }
        return false;
      });
      console.log(`After type filter: ${items.length} items`);
    }

    return items;
  }, [activeTab, searchTerm, selectedType, spellCards, equipment, consumables, artefacts]);

  const tabs = [
    { id: 'spells', label: 'Spell Cards', count: spellCards.length },
    { id: 'equipment', label: 'Equipment', count: equipment.length },
    { id: 'consumables', label: 'Consumables', count: consumables.length },
    { id: 'artefacts', label: 'Artefacts', count: artefacts.length },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as TabType);
              setSelectedType('all');
            }}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
            <span className="tab-count">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="search-container">
        <div className="filter-grid">
          {/* Search */}
          <div className="filter-group" style={{ gridColumn: 'span 2' }}>
            <label>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}...`}
            />
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <label>Filter Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="filter-group">
            <label>View</label>
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        <div className="results-count">
          Showing <strong>{filteredItems.length}</strong> {activeTab}
        </div>
      </div>

      {/* Content Display */}
      {viewMode === 'grid' ? (
        <div className="card-grid" key={`grid-${activeTab}-${searchTerm}-${selectedType}`}>
          {filteredItems.map((item, index) => (
            <ItemCard key={`${activeTab}-${item.id}-${index}`} item={item} type={activeTab} />
          ))}
        </div>
      ) : (
        <div className="item-list" key={`list-${activeTab}-${searchTerm}-${selectedType}`}>
          {filteredItems.map((item, index) => (
            <ItemListRow key={`${activeTab}-${item.id}-${index}`} item={item} type={activeTab} />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">No {activeTab} found matching your filters.</p>
          <p className="empty-state-subtitle">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

// Card Display Component
const ItemCard: React.FC<{ item: any; type: TabType }> = ({ item, type }) => {
  const getTypeClass = () => {
    if (type === 'spells' && item.types) {
      if (item.types.includes('Fire')) return 'type-fire';
      if (item.types.includes('Wind')) return 'type-wind';
      if (item.types.includes('Stone') || item.types.includes('Metal')) return 'type-stone';
      if (item.types.includes('Nature')) return 'type-nature';
      if (item.types.includes('Water')) return 'type-water';
      if (item.types.includes('Light')) return 'type-light';
      if (item.types.includes('Shadow')) return 'type-shadow';
    }
    if (type === 'equipment') return 'type-equipment';
    if (type === 'consumables') return 'type-consumable';
    if (type === 'artefacts') return 'type-artefact';
    return 'type-default';
  };

  const typeClass = getTypeClass();

  return (
    <div className={`card ${typeClass}`}>
      {/* Header */}
      <div className={`card-header ${typeClass}`}>
        <div className="card-header-content">
          <div>
            <h3 className="card-name">{item.name}</h3>
            {item.id && <p className="card-id">{item.id}</p>}
          </div>
          {type === 'spells' && item.primaryCost !== undefined && (
            <div className="card-cost">
              <span className="card-cost-value">{item.primaryCost}</span>
              <span className="card-cost-separator">|</span>
              <span className="card-cost-value">{item.secondaryCost}</span>
            </div>
          )}
          {(type === 'equipment' || type === 'artefacts') && item.slots !== undefined && (
            <div className="card-cost">
              <span className="card-cost-value">{item.slots} slot{item.slots !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {item.types && (
          <div className="card-types">
            {item.types.join(' • ')}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Requirements */}
        {item.requirements && (
          <p className="card-requirements">
            ⚠ {item.requirements}
          </p>
        )}

        {/* Stats */}
        <div className="card-stats">
          {item.range && (
            <p className="card-stat">
              <span className="card-stat-label">Range:</span>
              <span className="card-stat-value">{item.range}</span>
            </p>
          )}
          {item.weaponRange && (
            <p className="card-stat">
              <span className="card-stat-label">Range:</span>
              <span className="card-stat-value">{item.weaponRange}</span>
            </p>
          )}
          {item.attack && (
            <p className="card-stat">
              <span className="card-stat-label">Attack:</span>
              <span className="card-stat-value attack">{item.attack}</span>
            </p>
          )}
          {item.damage && (
            <p className="card-stat">
              <span className="card-stat-label">Damage:</span>
              <span className="card-stat-value damage">{item.damage}</span>
            </p>
          )}
          {item.cost !== undefined && type === 'artefacts' && (
            <p className="card-stat">
              <span className="card-stat-label">Cost:</span>
              <span className="card-stat-value">{item.cost} points</span>
            </p>
          )}
        </div>

        {/* Effect */}
        {item.effect && (
          <div className="card-effect">
            {item.effect}
          </div>
        )}

        {/* Special Effects */}
        {(item.onHit || item.onBash) && (
          <div className="card-special-effects">
            {item.onHit && (
              <p className="effect-on-hit">
                <strong>On hit:</strong> <span>{item.onHit}</span>
              </p>
            )}
            {item.onBash && (
              <p className="effect-on-bash">
                <strong>On bash:</strong> <span>{item.onBash}</span>
              </p>
            )}
          </div>
        )}

        {/* Pitch Effect */}
        {item.pitchEffect && (
          <div className="card-pitch">
            <p>
              <strong>[Pitch]</strong> <span>{item.pitchEffect}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// List Display Component
const ItemListRow: React.FC<{ item: any; type: TabType }> = ({ item, type }) => {
  const getTypeClass = () => {
    if (type === 'spells' && item.types) {
      if (item.types.includes('Fire')) return 'type-fire';
      if (item.types.includes('Wind')) return 'type-wind';
      if (item.types.includes('Stone') || item.types.includes('Metal')) return 'type-stone';
      if (item.types.includes('Nature')) return 'type-nature';
      if (item.types.includes('Water')) return 'type-water';
      if (item.types.includes('Light')) return 'type-light';
      if (item.types.includes('Shadow')) return 'type-shadow';
    }
    if (type === 'equipment') return 'type-equipment';
    if (type === 'consumables') return 'type-consumable';
    if (type === 'artefacts') return 'type-artefact';
    return 'type-default';
  };

  return (
    <div className={`list-item ${getTypeClass()}`}>
      <div>
        <div className="list-item-header">
          <h3 className="list-item-name">{item.name}</h3>
          {item.id && <span className="list-item-id">{item.id}</span>}
          {item.types && <span className="list-item-types">{item.types.join(', ')}</span>}
        </div>
        
        <div className="list-item-stats">
          {type === 'spells' && item.primaryCost !== undefined && (
            <span className="list-item-stat">
              Cost: <span className="list-item-stat-value">{item.primaryCost} | {item.secondaryCost}</span>
            </span>
          )}
          {(type === 'equipment' || type === 'artefacts') && item.slots !== undefined && (
            <span className="list-item-stat">
              Slots: <span className="list-item-stat-value">{item.slots}</span>
            </span>
          )}
          {(item.range || item.weaponRange) && (
            <span className="list-item-stat">
              Range: <span className="list-item-stat-value">{item.range || item.weaponRange}</span>
            </span>
          )}
          {item.attack && (
            <span className="list-item-stat">
              Attack: <span className="list-item-stat-value">{item.attack}</span>
            </span>
          )}
          {item.damage && (
            <span className="list-item-stat">
              Damage: <span className="list-item-stat-value">{item.damage}</span>
            </span>
          )}
        </div>

        {item.effect && (
          <p className="list-item-effect">{item.effect}</p>
        )}
      </div>
    </div>
  );
};