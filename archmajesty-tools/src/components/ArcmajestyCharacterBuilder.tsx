import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { useStore } from '../store';
import type { CharacterAttributes, CharacterBonus, MajorStyle } from '../types/archmajesty';
import { GAME_CONSTANTS } from '../types/archmajesty';
import { spellCards, majorStyles } from '../data/archmajesty/gameData';

type Step = 'name' | 'attributes' | 'bonus' | 'styles' | 'equipment' | 'deck' | 'review';

export const ArcmajestyCharacterBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [character, setCharacter] = useState({
    name: '',
    title: '',
    attributes: { might: 0, agility: 0, will: 0, defence: 0 },
    chosenBonus: null as CharacterBonus | null,
    styles: [] as string[],
    stylePoints: GAME_CONSTANTS.STARTING_STYLE_POINTS,
    equipment: [] as string[],
    deck: [] as string[],
    artefactPoints: GAME_CONSTANTS.STARTING_ARTEFACT_POINTS
  });

  const steps: { id: Step; label: string }[] = [
    { id: 'name', label: 'Name & Title' },
    { id: 'attributes', label: 'Step 1: Attributes' },
    { id: 'bonus', label: 'Step 2: Choose Bonus' },
    { id: 'styles', label: 'Step 3: Fighting Styles' },
    { id: 'equipment', label: 'Step 4: Equipment' },
    { id: 'deck', label: 'Step 5: Build Deck' },
    { id: 'review', label: 'Review Character' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const goToStep = (step: Step) => setCurrentStep(step);
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
      <h2 className="text-2xl font-bold mb-6">Archmajesty Character Builder</h2>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-purple-500 text-white'
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
                  index < currentStepIndex ? 'bg-purple-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {currentStep === 'name' && <NameStep character={character} setCharacter={setCharacter} onNext={nextStep} />}
        {currentStep === 'attributes' && <AttributesStep character={character} setCharacter={setCharacter} onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'bonus' && <BonusStep character={character} setCharacter={setCharacter} onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'styles' && <StylesStep character={character} setCharacter={setCharacter} onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'equipment' && <EquipmentStep character={character} setCharacter={setCharacter} onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'deck' && <DeckStep character={character} setCharacter={setCharacter} onNext={nextStep} onPrev={prevStep} />}
        {currentStep === 'review' && <ReviewStep character={character} onPrev={prevStep} />}
      </div>
    </div>
  );
};

// Step Components
const NameStep: React.FC<{ character: any; setCharacter: any; onNext: () => void }> = ({ character, setCharacter, onNext }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Character Name & Title</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Character Name
          </label>
          <input
            type="text"
            value={character.name}
            onChange={(e) => setCharacter({ ...character, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter character name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (Optional)
          </label>
          <input
            type="text"
            value={character.title}
            onChange={(e) => setCharacter({ ...character, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., The Bold, Storm Walker"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!character.name}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            character.name
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const AttributesStep: React.FC<{ character: any; setCharacter: any; onNext: () => void; onPrev: () => void }> = ({ character, setCharacter, onNext, onPrev }) => {
  const totalPoints = Object.values(character.attributes).reduce((sum: number, val: any) => sum + val, 0);
  const remainingPoints = GAME_CONSTANTS.STARTING_ATTRIBUTE_POINTS - totalPoints;

  const adjustAttribute = (attr: keyof CharacterAttributes, delta: number) => {
    const newValue = character.attributes[attr] + delta;
    if (newValue >= 0 && newValue <= GAME_CONSTANTS.MAX_ATTRIBUTE_ALLOCATION && remainingPoints - delta >= 0) {
      setCharacter({
        ...character,
        attributes: { ...character.attributes, [attr]: newValue }
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Step 1: Distribute Attribute Points</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-gray-700">
          Divide <strong>8 points</strong> among your attributes. Maximum 3 points per attribute.
        </p>
        <p className="text-lg font-medium mt-2">
          Remaining Points: <span className={remainingPoints === 0 ? 'text-green-600' : 'text-purple-600'}>{remainingPoints}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(['might', 'agility', 'will', 'defence'] as const).map(attr => (
          <div key={attr} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium capitalize mb-2">{attr}</h4>
            <div className="flex items-center justify-between">
              <button
                onClick={() => adjustAttribute(attr, -1)}
                disabled={character.attributes[attr] === 0}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                -
              </button>
              <span className="text-2xl font-bold">{character.attributes[attr]}</span>
              <button
                onClick={() => adjustAttribute(attr, 1)}
                disabled={character.attributes[attr] >= GAME_CONSTANTS.MAX_ATTRIBUTE_ALLOCATION || remainingPoints === 0}
                className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {attr === 'might' && 'Physical strength (MT)'}
              {attr === 'agility' && 'Speed and dexterity (AG)'}
              {attr === 'will' && 'Mental power (WL)'}
              {attr === 'defence' && 'Base defense value'}
            </p>
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
          disabled={remainingPoints !== 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            remainingPoints === 0
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const BonusStep: React.FC<{ character: any; setCharacter: any; onNext: () => void; onPrev: () => void }> = ({ character, setCharacter, onNext, onPrev }) => {
  const bonuses: CharacterBonus[] = [
    { type: 'health', value: 25 },
    { type: 'equipment', value: 1 },
    { type: 'ability', value: 1 },
    { type: 'command', value: 2 }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Step 2: Choose Permanent Bonus</h3>
      
      <div className="space-y-3">
        {bonuses.map((bonus) => (
          <label key={bonus.type} className="block">
            <div className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              character.chosenBonus?.type === bonus.type
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300'
            }`}>
              <input
                type="radio"
                className="sr-only"
                checked={character.chosenBonus?.type === bonus.type}
                onChange={() => setCharacter({ ...character, chosenBonus: bonus })}
              />
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="font-medium">
                    {bonus.type === 'health' && `+${bonus.value} Health Points`}
                    {bonus.type === 'equipment' && `+${bonus.value} Equipment Slot`}
                    {bonus.type === 'ability' && `+${bonus.value} Ability Slot`}
                    {bonus.type === 'command' && `+${bonus.value} Command Capacity`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bonus.type === 'health' && 'Increases your maximum health from 50 to 75'}
                    {bonus.type === 'equipment' && 'Carry one additional piece of equipment'}
                    {bonus.type === 'ability' && 'Equip one additional ability'}
                    {bonus.type === 'command' && 'Lead more allies in battle'}
                  </p>
                </div>
              </div>
            </div>
          </label>
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
          disabled={!character.chosenBonus}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            character.chosenBonus
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const StylesStep: React.FC<{ character: any; setCharacter: any; onNext: () => void; onPrev: () => void }> = ({ character, setCharacter, onNext, onPrev }) => {
  const remainingPoints = character.stylePoints - character.styles.reduce((sum: number, styleId: string) => {
    const style = majorStyles.find(s => s.id === styleId);
    return sum + (style?.cost || 0);
  }, 0);

  const toggleStyle = (styleId: string) => {
    const style = majorStyles.find(s => s.id === styleId);
    if (!style) return;

    if (character.styles.includes(styleId)) {
      setCharacter({
        ...character,
        styles: character.styles.filter((id: string) => id !== styleId)
      });
    } else if (remainingPoints >= style.cost) {
      setCharacter({
        ...character,
        styles: [...character.styles, styleId]
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Step 3: Choose Fighting Styles</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-gray-700">
          You have <strong>6 style points</strong> to spend. Major styles (✦) cost 2 points each.
        </p>
        <p className="text-lg font-medium mt-2">
          Remaining Points: <span className={remainingPoints === 0 ? 'text-green-600' : 'text-purple-600'}>{remainingPoints}</span>
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {(majorStyles || []).map((style) => {
          const isSelected = character.styles.includes(style.id);
          const canAfford = remainingPoints >= style.cost;
          
          return (
            <div
              key={style.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : canAfford
                  ? 'border-gray-300 hover:border-purple-300'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => (isSelected || canAfford) && toggleStyle(style.id)}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{style.name} {style.symbol}</h4>
                  <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Includes {style.cardList.length} cards • Cost: {style.cost} points
                  </p>
                </div>
              </div>
            </div>
          );
        })}
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
          disabled={remainingPoints > 0}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            remainingPoints === 0
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const EquipmentStep: React.FC<{ character: any; setCharacter: any; onNext: () => void; onPrev: () => void }> = ({ character, setCharacter, onNext, onPrev }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Step 4: Equipment & Artefacts</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-gray-700">
          You can equip as many mundane items as you want. You have <strong>2 artefact points</strong> to spend on magical items.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Mundane Equipment</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Sword (1 slot) - Melee weapon</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Staff (1 slot) - Increases spell range</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Bow (2 slots) - Ranged weapon</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Artefacts (2 points remaining)</h4>
          <p className="text-sm text-gray-600">Artefact selection coming soon...</p>
        </div>
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
          className="px-6 py-2 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const DeckStep: React.FC<{ character: any; setCharacter: any; onNext: () => void; onPrev: () => void }> = ({ character, setCharacter, onNext, onPrev }) => {
  // Get all cards from selected styles
  const availableCards = character.styles.flatMap((styleId: string) => {
    const style = majorStyles?.find(s => s.id === styleId);
    return style?.cardList || [];
  });

  const uniqueCards = [...new Set(availableCards)];
  const deckSize = character.deck.length;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Step 5: Build Your Deck</h3>
      
      <div className="mb-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-gray-700">
          Build a deck with at least <strong>21 cards</strong>. You can have up to 3 copies of each card.
        </p>
        <p className="text-lg font-medium mt-2">
          Current Deck Size: <span className={deckSize >= 21 ? 'text-green-600' : 'text-purple-600'}>{deckSize}</span> / 21
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Available Cards</h4>
          <div className="border rounded-lg p-2 h-96 overflow-y-auto">
            {uniqueCards.map(cardName => {
              const count = character.deck.filter((c: string) => c === cardName).length;
              return (
                <div key={cardName} className="p-2 hover:bg-gray-50 flex justify-between items-center">
                  <span className="text-sm">{cardName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{count}/3</span>
                    <button
                      onClick={() => {
                        if (count < 3) {
                          setCharacter({ ...character, deck: [...character.deck, cardName] });
                        }
                      }}
                      disabled={count >= 3}
                      className="px-2 py-1 text-xs bg-purple-500 text-white rounded disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Your Deck</h4>
          <div className="border rounded-lg p-2 h-96 overflow-y-auto">
            {character.deck.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-4">No cards in deck yet</p>
            ) : (
              <div className="space-y-1">
                {character.deck.map((card: string, index: number) => (
                  <div key={index} className="p-2 hover:bg-gray-50 flex justify-between items-center">
                    <span className="text-sm">{card}</span>
                    <button
                      onClick={() => {
                        const newDeck = [...character.deck];
                        newDeck.splice(index, 1);
                        setCharacter({ ...character, deck: newDeck });
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
          disabled={deckSize < 21}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            deckSize >= 21
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<{ character: any; onPrev: () => void }> = ({ character, onPrev }) => {
  const selectedStyles = character.styles.map((id: string) => 
    majorStyles?.find(s => s.id === id)
  ).filter(Boolean);

  const exportCharacter = () => {
    const data = JSON.stringify(character, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}_archmajesty.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Review Your Character</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Basic Information</h4>
          <p><strong>Name:</strong> {character.name} {character.title && `, ${character.title}`}</p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Attributes</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>Might: <strong>{character.attributes.might}</strong></div>
            <div>Agility: <strong>{character.attributes.agility}</strong></div>
            <div>Will: <strong>{character.attributes.will}</strong></div>
            <div>Defence: <strong>{character.attributes.defence}</strong></div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Chosen Bonus</h4>
          <p>
            {character.chosenBonus?.type === 'health' && '+25 Health Points'}
            {character.chosenBonus?.type === 'equipment' && '+1 Equipment Slot'}
            {character.chosenBonus?.type === 'ability' && '+1 Ability Slot'}
            {character.chosenBonus?.type === 'command' && '+2 Command Capacity'}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Fighting Styles</h4>
          {selectedStyles.map((style: any) => (
            <p key={style.id}>{style.name} {style.symbol}</p>
          ))}
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Deck ({character.deck.length} cards)</h4>
          <p className="text-sm text-gray-600">
            {[...new Set(character.deck)].map((card: string) => {
              const count = character.deck.filter((c: string) => c === card).length;
              return `${card}${count > 1 ? ` x${count}` : ''}`;
            }).join(', ')}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={exportCharacter}
          className="px-6 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600"
        >
          Export Character
        </button>
      </div>
    </div>
  );
};