import React from 'react';
import { useStore } from '../../../services/store';

interface AttributesStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const attributes = [
  { key: 'strength', label: 'Strength', abbr: 'STR' },
  { key: 'dexterity', label: 'Dexterity', abbr: 'DEX' },
  { key: 'constitution', label: 'Constitution', abbr: 'CON' },
  { key: 'intelligence', label: 'Intelligence', abbr: 'INT' },
  { key: 'wisdom', label: 'Wisdom', abbr: 'WIS' },
  { key: 'charisma', label: 'Charisma', abbr: 'CHA' }
];

export const AttributesStep: React.FC<AttributesStepProps> = ({ onNext, onPrevious }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();

  const handleAttributeChange = (attribute: string, value: string) => {
    const numValue = parseInt(value) || 0;
    updateCurrentCharacter({
      attributes: {
        ...currentCharacter?.attributes,
        [attribute]: numValue
      }
    });
  };

  const calculateModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getTotalPoints = (): number => {
    const attrs = currentCharacter?.attributes || {};
    return Object.values(attrs).reduce((sum, val) => sum + (val || 0), 0);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Attributes</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Assign your attribute scores. Standard array: 15, 14, 13, 12, 10, 8
        </p>
        <p className="text-sm text-blue-800 mt-1">
          Total points used: <span className="font-bold">{getTotalPoints()}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {attributes.map(attr => (
          <div key={attr.key} className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {attr.label} ({attr.abbr})
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="20"
                value={currentCharacter?.attributes?.[attr.key as keyof typeof currentCharacter.attributes] || 10}
                onChange={(e) => handleAttributeChange(attr.key, e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              />
              <span className="text-sm font-medium text-gray-600">
                Mod: {calculateModifier(currentCharacter?.attributes?.[attr.key as keyof typeof currentCharacter.attributes] || 10)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hit Points */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Hit Points</h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum HP
            </label>
            <input
              type="number"
              min="1"
              value={currentCharacter?.hitPoints?.max || 10}
              onChange={(e) => updateCurrentCharacter({
                hitPoints: {
                  current: currentCharacter?.hitPoints?.current || parseInt(e.target.value),
                  max: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current HP
            </label>
            <input
              type="number"
              min="0"
              max={currentCharacter?.hitPoints?.max || 10}
              value={currentCharacter?.hitPoints?.current || currentCharacter?.hitPoints?.max || 10}
              onChange={(e) => updateCurrentCharacter({
                hitPoints: {
                  current: parseInt(e.target.value),
                  max: currentCharacter?.hitPoints?.max || 10
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
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