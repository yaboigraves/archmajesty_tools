// Re-export Archmajesty types for backward compatibility
export type { SpellCard as Card } from '../types/archmajesty';
export type { MajorStyle as CharacterClass } from '../types/archmajesty';
export type { Equipment } from '../types/archmajesty';

// Import actual game data
import { spellCards, majorStyles, equipment, characterCreation } from './archmajesty/gameData';

export interface GameData {
  cards: any[]; // Using any for now to maintain compatibility
  spells: any[];
  races: any[];
  classes: any[];
  equipment: Equipment[];
  rules: {
    attributes: string[];
    skills: string[];
    conditions: string[];
  };
}

// Archmajesty game data extracted from PDFs
export const sampleGameData: GameData = {
  // Note: Archmajesty uses spell cards, not traditional TCG cards
  // Converting spell cards to old card format for compatibility
  cards: spellCards?.map(card => ({
    id: card.id,
    name: card.name,
    set: 'COM', // All spell cards are from the Compendium
    type: card.types?.join(' ') || '',
    cost: `${card.primaryCost}/${card.secondaryCost}`,
    text: [card.effect, card.onHit && `On hit: ${card.onHit}`, card.onBash && `On bash: ${card.onBash}`].filter(Boolean).join(' '),
    keywords: card.types || []
  })) || [],
  // Archmajesty doesn't have traditional D&D spells - all magic is card-based
  spells: [],
  // Archmajesty doesn't have traditional races - characters are defined by their styles
  races: [],
  // Converting major styles to classes for compatibility
  classes: majorStyles?.map(style => ({
    id: style.id,
    name: style.name,
    description: style.description || '',
    primaryAbility: style.name.includes('Warrior') ? 'Might' : style.name.includes('Aerialist') ? 'Agility' : 'Will',
    startingEquipment: [],
    features: []
  })) || [],
  equipment: equipment || [],
  rules: {
    // Archmajesty uses different attributes
    attributes: ['Might', 'Agility', 'Will', 'Defence'],
    skills: [], // Skills are not used in Archmajesty
    conditions: ['Stun', 'Weaken', 'Empower', 'Swift', 'Shield', 'Burn'] // Counter types from the game
  }
};