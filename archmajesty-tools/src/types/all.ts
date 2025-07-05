// Card types
export interface Card {
  id: string;
  name: string;
  color?: string;
  type?: string;
  cost?: string | number;
  text?: string;
  power?: string | number;
  toughness?: string | number;
  keywords?: string[];
  rarity?: string;
  set?: string;
  rawText?: string;
}

export interface CardFilter {
  searchTerm?: string;
  colors?: string[];
  types?: string[];
  keywords?: string[];
  costRange?: { min: number; max: number };
}

// Character types
export interface Equipment {
  id: string;
  name: string;
  type: string;
  quantity?: number;
  description?: string;
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  race?: string;
  class?: string;
  background?: string;
  level?: number;
  attributes?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };
  hitPoints?: {
    current: number;
    max: number;
  };
  spells?: Spell[];
  equipment?: Equipment[];
  features?: string[];
  notes?: string;
}

// PDF types
export interface CharacterOptions {
  races?: string[];
  classes?: string[];
  backgrounds?: string[];
  startingEquipment?: Equipment[];
  classFeatures?: { [className: string]: string[] };
}

export interface PDFData {
  fileName: string;
  uploadDate: Date;
  extractedData: {
    cards?: Card[];
    spells?: Spell[];
    characterOptions?: CharacterOptions;
    raw?: string;
  };
}