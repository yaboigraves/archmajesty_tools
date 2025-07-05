import React, { useState, useMemo } from 'react';
import { useStore } from '../../../services/store';
import { Spell } from '../types';

interface SpellSelectionStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const SpellSelectionStep: React.FC<SpellSelectionStepProps> = ({ onNext, onPrevious }) => {
  const { currentCharacter, updateCurrentCharacter, availableSpells } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

  const selectedSpells = currentCharacter?.spells || [];

  // Group spells by level
  const spellsByLevel = useMemo(() => {
    const grouped: { [level: number]: Spell[] } = {};
    availableSpells.forEach(spell => {
      const level = spell.level || 0;
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(spell);
    });
    return grouped;
  }, [availableSpells]);

  // Filter spells based on search and level
  const filteredSpells = useMemo(() => {
    let spells = availableSpells;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      spells = spells.filter(spell => 
        spell.name.toLowerCase().includes(lowerSearch) ||
        spell.description.toLowerCase().includes(lowerSearch) ||
        spell.school?.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (selectedLevel !== 'all') {
      spells = spells.filter(spell => spell.level === selectedLevel);
    }
    
    return spells;
  }, [availableSpells, searchTerm, selectedLevel]);

  const toggleSpell = (spell: Spell) => {
    const isSelected = selectedSpells.some(s => s.id === spell.id);
    
    if (isSelected) {
      updateCurrentCharacter({
        spells: selectedSpells.filter(s => s.id !== spell.id)
      });
    } else {
      updateCurrentCharacter({
        spells: [...selectedSpells, spell]
      });
    }
  };

  const isSpellSelected = (spell: Spell): boolean => {
    return selectedSpells.some(s => s.id === spell.id);
  };

  const getSpellLevelLabel = (level: number): string => {
    if (level === 0) return 'Cantrip';
    if (level === 1) return '1st Level';
    if (level === 2) return '2nd Level';
    if (level === 3) return '3rd Level';
    return `${level}th Level`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Select Spells</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Selected spells: <span className="font-bold">{selectedSpells.length}</span>
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Spells
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, description, or school..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spell Level
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Levels</option>
            {Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b)).map(level => (
              <option key={level} value={level}>
                {getSpellLevelLabel(parseInt(level))} ({spellsByLevel[parseInt(level)].length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Spell List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSpells.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No spells found. Try adjusting your search filters.
          </p>
        ) : (
          filteredSpells.map(spell => (
            <div
              key={spell.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                isSpellSelected(spell)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleSpell(spell)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {spell.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {getSpellLevelLabel(spell.level)} 
                    {spell.school && ` • ${spell.school}`}
                  </p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                    {spell.description}
                  </p>
                  {spell.castingTime && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-medium">Casting Time:</span> {spell.castingTime}
                    </p>
                  )}
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={isSpellSelected(spell)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};