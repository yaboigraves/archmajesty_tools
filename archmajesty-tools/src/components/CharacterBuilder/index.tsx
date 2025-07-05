import React, { useEffect } from 'react';
import { useStore } from '../../services/store';
import { BuilderWizard } from './BuilderWizard';

export const CharacterBuilder: React.FC = () => {
  const { setCurrentCharacter } = useStore();

  useEffect(() => {
    // Initialize a new character when component mounts
    setCurrentCharacter({
      id: `char-${Date.now()}`,
      name: '',
      level: 1,
      attributes: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      hitPoints: {
        current: 10,
        max: 10
      },
      spells: [],
      equipment: []
    });
  }, [setCurrentCharacter]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Character Builder</h2>
      <BuilderWizard />
    </div>
  );
};