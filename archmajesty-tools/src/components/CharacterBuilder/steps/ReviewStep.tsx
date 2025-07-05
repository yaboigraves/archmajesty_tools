import React from 'react';
import { useStore } from '../../../services/store';

interface ReviewStepProps {
  onPrevious: () => void;
  onComplete: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ onPrevious, onComplete }) => {
  const { currentCharacter } = useStore();

  if (!currentCharacter) {
    return <div>No character data available.</div>;
  }

  const calculateModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Character</h2>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Basic Information</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-600">Name:</dt>
            <dd className="font-medium">{currentCharacter.name}</dd>
            <dt className="text-gray-600">Race:</dt>
            <dd className="font-medium">{currentCharacter.race}</dd>
            <dt className="text-gray-600">Class:</dt>
            <dd className="font-medium">{currentCharacter.class}</dd>
            <dt className="text-gray-600">Background:</dt>
            <dd className="font-medium">{currentCharacter.background || 'None'}</dd>
            <dt className="text-gray-600">Level:</dt>
            <dd className="font-medium">{currentCharacter.level || 1}</dd>
          </dl>
        </div>

        {/* Attributes */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Attributes</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {currentCharacter.attributes && Object.entries(currentCharacter.attributes).map(([attr, value]) => (
              <div key={attr} className="text-center">
                <div className="font-medium uppercase text-xs text-gray-600">{attr.slice(0, 3)}</div>
                <div className="font-bold">{value}</div>
                <div className="text-xs text-gray-500">({calculateModifier(value || 10)})</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm">
              <span className="text-gray-600">Hit Points:</span>
              <span className="ml-2 font-medium">
                {currentCharacter.hitPoints?.current}/{currentCharacter.hitPoints?.max}
              </span>
            </div>
          </div>
        </div>

        {/* Spells */}
        {currentCharacter.spells && currentCharacter.spells.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Spells ({currentCharacter.spells.length})</h3>
            <div className="space-y-1 text-sm">
              {currentCharacter.spells.map(spell => (
                <div key={spell.id} className="flex justify-between">
                  <span>{spell.name}</span>
                  <span className="text-gray-600">
                    Level {spell.level}
                    {spell.school && ` • ${spell.school}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {currentCharacter.equipment && currentCharacter.equipment.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Equipment</h3>
            <div className="space-y-1 text-sm">
              {currentCharacter.equipment.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="text-gray-600">
                    {item.quantity > 1 && `x${item.quantity} • `}
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Previous
        </button>
        <div className="space-x-3">
          <button
            onClick={() => {
              const json = JSON.stringify(currentCharacter, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${currentCharacter.name || 'character'}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-6 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600"
          >
            Export JSON
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};