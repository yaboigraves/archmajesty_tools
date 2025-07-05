// Type definitions based on actual Archmajesty game data

// Spell card structure from the Arcane Compendium
export interface SpellCard {
  id: string; // Format: #001, #002, etc.
  name: string;
  types: string[]; // e.g., ["Physical", "Stone", "Metal"]
  primaryCost: number; // First cost value
  secondaryCost: number; // Second cost value
  requirements?: string; // e.g., "You must be airborne"
  range: string; // e.g., "Melee", "2 squares", "Melee Weapon"
  attack?: string; // e.g., "D20 + MT", "D20 + AG"
  damage?: string; // e.g., "10 + MT", "15 + AG"
  effect: string; // Main card effect description
  pitchEffect?: string; // Effect when pitched, e.g., "Gain 2 Swift counters"
  onHit?: string; // Additional effect on hit
  onBash?: string; // Additional effect on bash (critical hit)
}

// Character attributes from the character sheet
export interface CharacterAttributes {
  might: number; // MT - Physical strength
  agility: number; // AG - Speed and dexterity
  will: number; // WL - Mental power
  defence: number; // Base defense value
}

// Secondary character stats
export interface CharacterStats {
  health: {
    current: number;
    max: number;
  };
  movementPoints: number;
  equipmentSlots: number;
  abilitySlots: number;
  commandCapacity: number;
}

// Major style (character class/archetype)
export interface MajorStyle {
  id: string;
  name: string; // e.g., "Earthsteel Warrior", "Trickgale Aerialist"
  symbol?: string; // ✦ or ✧
  cardList: string[]; // List of card names included in this style
  description?: string;
  cost: number; // Style points cost (major = 2, minor = 1)
}

// Character creation choices
export interface CharacterBonus {
  type: 'health' | 'equipment' | 'ability' | 'command';
  value: number;
}

// Complete character data
export interface Character {
  id: string;
  name: string;
  title?: string;
  ancestry?: string;
  
  // Core attributes (8 points to distribute, max 3 per attribute)
  attributes: CharacterAttributes;
  
  // Derived stats
  stats: CharacterStats;
  
  // Character choices
  chosenBonus?: CharacterBonus;
  styles: string[]; // Style IDs (6 points worth)
  
  // Deck and equipment
  deck: string[]; // Card IDs (minimum 21 cards, max 3 of same)
  equipment: Equipment[];
  artefacts: Artefact[];
  
  // Movement abilities (always present)
  movementAbilities: MovementAbility[];
  
  // Combat state
  position?: 'earthbound' | 'airborne';
  counters?: {
    [key: string]: number; // e.g., Swift: 2, Empower: 1
  };
}

// Equipment from the game
export interface Equipment {
  id: string;
  name: string;
  slots: number;
  type: 'weapon' | 'armor' | 'gear';
  weaponRange?: string; // For weapons
  effect?: string;
}

// Artefact (magical item)
export interface Artefact {
  id: string;
  name: string;
  cost: number; // Artefact points
  abilityType: 'Active' | 'Passive' | 'Hybrid';
  effects: string[];
}

// Movement abilities (standard for all characters)
export interface MovementAbility {
  name: string;
  type: string; // e.g., "Active [Movement]"
  cost?: number; // Movement points
  effect: string;
}

// Game constants based on the PDFs
export const GAME_CONSTANTS = {
  DECK_SIZE: 21,
  MAX_COPIES_PER_CARD: 3,
  STARTING_ATTRIBUTE_POINTS: 8,
  MAX_ATTRIBUTE_ALLOCATION: 3,
  STARTING_STYLE_POINTS: 6,
  MAJOR_STYLE_COST: 2,
  MINOR_STYLE_COST: 1,
  STARTING_ARTEFACT_POINTS: 2,
  BASE_HEALTH: 50,
  BASE_DEFENCE: 10,
  BASE_MOVEMENT: 6,
  BASE_EQUIPMENT_SLOTS: 5,
  BASE_ABILITY_SLOTS: 5,
  BASE_COMMAND_CAPACITY: 10
};

// Counter types found in the game
export type CounterType = 'Swift' | 'Empower' | 'Weaken' | 'Shield' | 'Burn';

// Attribute abbreviations used in cards
export type AttributeAbbrev = 'MT' | 'AG' | 'WL';