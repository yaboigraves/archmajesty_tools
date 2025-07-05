import React, { useState, useEffect } from 'react';
import { useStore } from '../../../services/store';
import { pdfProcessingService } from '../../../services/pdfProcessingService';

interface BasicInfoStepProps {
  onNext: () => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ onNext }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();
  const [characterOptions, setCharacterOptions] = useState({
    races: [] as string[],
    classes: [] as string[],
    backgrounds: [] as string[]
  });

  useEffect(() => {
    loadCharacterOptions();
  }, []);

  const loadCharacterOptions = async () => {
    try {
      const options = await pdfProcessingService.getCharacterOptions();
      setCharacterOptions({
        races: options.races || [],
        classes: options.classes || [],
        backgrounds: options.backgrounds || []
      });
    } catch (error) {
      console.error('Error loading character options:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    updateCurrentCharacter({ [field]: value });
  };

  const canProceed = () => {
    return currentCharacter?.name && currentCharacter?.race && currentCharacter?.class;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
      
      <div className="space-y-4">
        {/* Character Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Character Name
          </label>
          <input
            type="text"
            value={currentCharacter?.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter character name"
          />
        </div>

        {/* Race */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Race
          </label>
          {characterOptions.races.length > 0 ? (
            <select
              value={currentCharacter?.race || ''}
              onChange={(e) => handleInputChange('race', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a race</option>
              {characterOptions.races.map(race => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={currentCharacter?.race || ''}
              onChange={(e) => handleInputChange('race', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter race"
            />
          )}
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          {characterOptions.classes.length > 0 ? (
            <select
              value={currentCharacter?.class || ''}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              {characterOptions.classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={currentCharacter?.class || ''}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter class"
            />
          )}
        </div>

        {/* Background */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background
          </label>
          {characterOptions.backgrounds.length > 0 ? (
            <select
              value={currentCharacter?.background || ''}
              onChange={(e) => handleInputChange('background', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a background</option>
              {characterOptions.backgrounds.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={currentCharacter?.background || ''}
              onChange={(e) => handleInputChange('background', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter background (optional)"
            />
          )}
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={currentCharacter?.level || 1}
            onChange={(e) => handleInputChange('level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed()}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canProceed()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};