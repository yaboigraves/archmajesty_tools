import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { useStore } from '../store';
import type { Race, CharacterClass, Spell } from '../data/gameData';

type Step = 'attributes' | 'bonus' | 'styles' | 'equipment' | 'deck' | 'review';

export const CharacterBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const { currentCharacter, updateCurrentCharacter } = useStore();

  // Initialize character if needed
  React.useEffect(() => {
    if (!currentCharacter) {
      updateCurrentCharacter({
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
    }
  }, [currentCharacter, updateCurrentCharacter]);

  const steps: { id: Step; label: string }[] = [
    { id: 'attributes', label: 'Attributes' },
    { id: 'bonus', label: 'Choose Bonus' },
    { id: 'styles', label: 'Fighting Styles' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'deck', label: 'Build Deck' },
    { id: 'review', label: 'Review' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const goToStep = (step: Step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Character Builder</h2>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
              <div className="ml-2 mr-4">
                <p className={`text-sm font-medium ${
                  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {currentStep === 'attributes' && <AttributesStep onNext={nextStep} />}
        {currentStep === 'bonus' && <BonusStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'styles' && <StylesStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'equipment' && <EquipmentStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'deck' && <DeckStep onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'review' && <ReviewStep onPrev={prevStep} />}
      </div>
    </div>
  );
};

// Step Components
const BasicsStep: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();
  const races = dataService.getAllRaces();
  const classes = dataService.getAllClasses();

  const handleInputChange = (field: string, value: any) => {
    updateCurrentCharacter({ [field]: value });
  };

  const canProceed = currentCharacter?.name && currentCharacter?.race && currentCharacter?.class;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      
      <div className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Race
            </label>
            <select
              value={currentCharacter?.race || ''}
              onChange={(e) => handleInputChange('race', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a race</option>
              {races.map(race => (
                <option key={race.id} value={race.id}>{race.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={currentCharacter?.class || ''}
              onChange={(e) => handleInputChange('class', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <input
            type="number"
            min="1"
            max="20"
            value={currentCharacter?.level || 1}
            onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Show selected race/class details */}
        {currentCharacter?.race && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Race: {races.find(r => r.id === currentCharacter.race)?.name}</h4>
            <p className="text-sm text-gray-600">
              {races.find(r => r.id === currentCharacter.race)?.description}
            </p>
            {races.find(r => r.id === currentCharacter.race)?.abilities && (
              <div className="mt-2">
                <p className="text-sm font-medium">Abilities:</p>
                <ul className="text-sm text-gray-600">
                  {races.find(r => r.id === currentCharacter.race)?.abilities?.map((ability, idx) => (
                    <li key={idx}>• {ability}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {currentCharacter?.class && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium mb-2">Class: {classes.find(c => c.id === currentCharacter.class)?.name}</h4>
            <p className="text-sm text-gray-600">
              {classes.find(c => c.id === currentCharacter.class)?.description}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Hit Dice: {classes.find(c => c.id === currentCharacter.class)?.hitDice}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canProceed
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

const AttributesStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();
  const attributes = dataService.getAttributes();
  
  const race = dataService.getRaceById(currentCharacter?.race || '');
  const characterClass = dataService.getClassById(currentCharacter?.class || '');

  const handleAttributeChange = (attr: string, value: number) => {
    updateCurrentCharacter({
      attributes: {
        ...currentCharacter?.attributes,
        [attr.toLowerCase()]: value
      }
    });
  };

  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const getTotalScore = (attr: string): number => {
    const base = currentCharacter?.attributes?.[attr.toLowerCase() as keyof typeof currentCharacter.attributes] || 10;
    const raceBonus = race?.attributeModifiers?.[attr.toLowerCase() as keyof typeof race.attributeModifiers] || 0;
    return base + raceBonus;
  };

  // Calculate HP based on class and constitution
  React.useEffect(() => {
    const conMod = Math.floor((getTotalScore('Constitution') - 10) / 2);
    const baseHP = 10; // Should be based on class hit dice
    const maxHP = baseHP + conMod + ((currentCharacter?.level || 1) - 1) * (6 + conMod);
    
    updateCurrentCharacter({
      hitPoints: {
        max: maxHP,
        current: maxHP
      }
    });
  }, [currentCharacter?.attributes?.constitution, currentCharacter?.level]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Attributes</h3>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Assign your attribute scores. Standard array: 15, 14, 13, 12, 10, 8
        </p>
        {race && race.attributeModifiers && (
          <p className="text-sm text-blue-600 mt-2">
            {race.name} bonuses are automatically applied.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {attributes.map(attr => (
          <div key={attr} className="p-4 bg-white border rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {attr}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="20"
                value={currentCharacter?.attributes?.[attr.toLowerCase() as keyof typeof currentCharacter.attributes] || 10}
                onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value) || 10)}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
              />
              {race?.attributeModifiers?.[attr.toLowerCase() as keyof typeof race.attributeModifiers] ? (
                <span className="text-sm text-blue-600">
                  +{race.attributeModifiers[attr.toLowerCase() as keyof typeof race.attributeModifiers]}
                </span>
              ) : (
                <span className="text-sm text-gray-400">+0</span>
              )}
              <span className="text-sm font-medium">
                = {getTotalScore(attr)} ({getModifier(getTotalScore(attr))})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Show Hit Points */}
      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <h4 className="font-medium mb-2">Hit Points</h4>
        <p className="text-sm text-gray-600">
          Based on your {characterClass?.name} class ({characterClass?.hitDice}) and Constitution modifier
        </p>
        <p className="text-lg font-medium mt-2">
          Max HP: {currentCharacter?.hitPoints?.max}
        </p>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
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

const SpellsStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();
  const characterClass = dataService.getClassById(currentCharacter?.class || '');
  const allSpells = dataService.getAllSpells();
  
  // Filter spells by class
  const availableSpells = characterClass?.name 
    ? dataService.getSpellsByClass(characterClass.name)
    : allSpells;

  const [selectedSpells, setSelectedSpells] = useState<string[]>(
    currentCharacter?.spells || []
  );

  const toggleSpell = (spellId: string) => {
    const newSpells = selectedSpells.includes(spellId)
      ? selectedSpells.filter(id => id !== spellId)
      : [...selectedSpells, spellId];
    
    setSelectedSpells(newSpells);
    updateCurrentCharacter({ spells: newSpells });
  };

  const spellsByLevel = availableSpells.reduce((acc, spell) => {
    const level = spell.level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, Spell[]>);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Select Spells</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Choose spells for your {characterClass?.name || 'character'}. 
          The number of spells you can prepare depends on your class and level.
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(spellsByLevel).sort(([a], [b]) => Number(a) - Number(b)).map(([level, spells]) => (
          <div key={level}>
            <h4 className="font-medium mb-2">
              {level === '0' ? 'Cantrips' : `Level ${level} Spells`}
            </h4>
            <div className="space-y-2">
              {spells.map(spell => (
                <label key={spell.id} className="flex items-start p-3 hover:bg-gray-50 rounded border">
                  <input
                    type="checkbox"
                    checked={selectedSpells.includes(spell.id)}
                    onChange={() => toggleSpell(spell.id)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{spell.name}</div>
                    <div className="text-sm text-gray-600">
                      {spell.school && <span className="mr-2">{spell.school}</span>}
                      {spell.castingTime && <span className="mr-2">• {spell.castingTime}</span>}
                      {spell.range && <span>• {spell.range}</span>}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{spell.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedSpells.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            Selected {selectedSpells.length} spell{selectedSpells.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
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

const EquipmentStep: React.FC<{ onNext: () => void; onPrev: () => void }> = ({ onNext, onPrev }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();
  const characterClass = dataService.getClassById(currentCharacter?.class || '');
  const allEquipment = dataService.getAllEquipment();

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    currentCharacter?.equipment || []
  );

  const toggleEquipment = (equipmentId: string) => {
    const newEquipment = selectedEquipment.includes(equipmentId)
      ? selectedEquipment.filter(id => id !== equipmentId)
      : [...selectedEquipment, equipmentId];
    
    setSelectedEquipment(newEquipment);
    updateCurrentCharacter({ equipment: newEquipment });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Equipment</h3>
      
      {characterClass?.startingEquipment && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Starting Equipment for {characterClass.name}</h4>
          <ul className="text-sm text-gray-600">
            {characterClass.startingEquipment.map((item, index) => (
              <li key={index}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="font-medium mb-2">Available Equipment</h4>
        {['weapon', 'armor', 'gear'].map(type => (
          <div key={type} className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2 capitalize">{type}s</h5>
            <div className="space-y-1">
              {allEquipment
                .filter(eq => eq.type === type)
                .map(equipment => (
                  <label key={equipment.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={selectedEquipment.includes(equipment.id)}
                      onChange={() => toggleEquipment(equipment.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{equipment.name}</span>
                      {equipment.cost && <span className="text-sm text-gray-500 ml-2">({equipment.cost})</span>}
                      {equipment.description && (
                        <p className="text-sm text-gray-600">{equipment.description}</p>
                      )}
                    </div>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
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

const ReviewStep: React.FC<{ onPrev: () => void }> = ({ onPrev }) => {
  const { currentCharacter } = useStore();
  const race = dataService.getRaceById(currentCharacter?.race || '');
  const characterClass = dataService.getClassById(currentCharacter?.class || '');
  const equipment = dataService.getAllEquipment().filter(eq => 
    currentCharacter?.equipment?.includes(eq.id)
  );
  const spells = dataService.getAllSpells().filter(spell =>
    currentCharacter?.spells?.includes(spell.id)
  );

  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const exportCharacter = () => {
    const exportData = {
      ...currentCharacter,
      // Include full data for easier reading
      raceData: race,
      classData: characterClass,
      equipmentData: equipment,
      spellData: spells,
      exportDate: new Date().toISOString()
    };
    
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter?.name || 'character'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printCharacterSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${currentCharacter?.name} - Character Sheet</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          .section { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .attribute { text-align: center; padding: 10px; border: 1px solid #ddd; }
          .spell { margin-bottom: 5px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>${currentCharacter?.name}</h1>
        
        <div class="section">
          <h2>Basic Information</h2>
          <p><strong>Race:</strong> ${race?.name}</p>
          <p><strong>Class:</strong> ${characterClass?.name}</p>
          <p><strong>Level:</strong> ${currentCharacter?.level}</p>
          <p><strong>Hit Points:</strong> ${currentCharacter?.hitPoints?.max}</p>
        </div>

        <div class="section">
          <h2>Attributes</h2>
          <div class="grid">
            ${Object.entries(currentCharacter?.attributes || {}).map(([attr, value]) => `
              <div class="attribute">
                <strong>${attr.toUpperCase()}</strong><br>
                ${value} (${getModifier(value)})
              </div>
            `).join('')}
          </div>
        </div>

        ${spells.length > 0 ? `
          <div class="section">
            <h2>Spells</h2>
            ${spells.map(spell => `
              <div class="spell">
                <strong>${spell.name}</strong> (Level ${spell.level})
                <br><em>${spell.description}</em>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${equipment.length > 0 ? `
          <div class="section">
            <h2>Equipment</h2>
            <ul>
              ${equipment.map(eq => `<li>${eq.name}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Review Your Character</h3>
      
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Basic Information</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-600">Name:</dt>
            <dd className="font-medium">{currentCharacter?.name}</dd>
            <dt className="text-gray-600">Race:</dt>
            <dd className="font-medium">{race?.name}</dd>
            <dt className="text-gray-600">Class:</dt>
            <dd className="font-medium">{characterClass?.name}</dd>
            <dt className="text-gray-600">Level:</dt>
            <dd className="font-medium">{currentCharacter?.level}</dd>
            <dt className="text-gray-600">Hit Points:</dt>
            <dd className="font-medium">{currentCharacter?.hitPoints?.max}</dd>
          </dl>
        </div>

        {/* Attributes */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Attributes</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {Object.entries(currentCharacter?.attributes || {}).map(([attr, value]) => (
              <div key={attr} className="text-center">
                <div className="font-medium capitalize">{attr}</div>
                <div>{value} ({getModifier(value)})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Spells */}
        {spells.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Spells ({spells.length})</h4>
            <ul className="text-sm space-y-1">
              {spells.map(spell => (
                <li key={spell.id}>
                  • <span className="font-medium">{spell.name}</span>
                  <span className="text-gray-600"> (Level {spell.level})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment */}
        {equipment.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Equipment</h4>
            <ul className="text-sm space-y-1">
              {equipment.map(eq => (
                <li key={eq.id}>• {eq.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Previous
        </button>
        <div className="space-x-3">
          <button
            onClick={printCharacterSheet}
            className="px-6 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600"
          >
            Print Sheet
          </button>
          <button
            onClick={exportCharacter}
            className="px-6 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};