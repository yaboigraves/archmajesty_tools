import type { SpellCard, MajorStyle, Character, Equipment } from '../../types/archmajesty';
import { GAME_CONSTANTS } from '../../types/archmajesty';
import spellCardsData from './spellCards.json';

// Import all spell cards from the extracted JSON data
export const spellCards: SpellCard[] = spellCardsData as SpellCard[];

// Debug log
console.log('Loaded spell cards from JSON:', spellCards.length);
console.log('First few cards:', spellCards.slice(0, 3));

// Major Styles (character archetypes)
export const majorStyles: MajorStyle[] = [
  {
    id: 'earthsteel-warrior',
    name: 'Earthsteel Warrior',
    symbol: '✦',
    cost: 2,
    description: 'Masters of earth and metal, focusing on powerful melee attacks and battlefield control.',
    cardList: [
      'Earthsteel Bash', 'Earthsteel Bash', // x2
      'Steelroot Grasp',
      'Earthsteel Rush', 'Earthsteel Rush', // x2
      'Anvilshatter Swing',
      'Pommel Pummel',
      'Stonerumble Cascade',
      'Earthsteel Fracture',
      'Earthsteel Aegis'
    ]
  },
  {
    id: 'trickgale-aerialist',
    name: 'Trickgale Aerialist',
    symbol: '✦',
    cost: 2,
    description: 'Wind dancers who excel at aerial combat and swift movements.',
    cardList: [
      'Ars Aeria', 'Ars Aeria', // x2
      'Cloudstep Rush',
      'Dragonhawk Dive', 'Dragonhawk Dive', // x2
      'Swiftwind Spiral',
      'Jetstream Blitz',
      'Ars Tempestas',
      'Swiftwind Cyclone',
      'Trickgale Crescendo'
    ]
  },
  {
    id: 'starseeker-spellsword',
    name: 'Starseeker Spellsword',
    symbol: '✦',
    cost: 2,
    description: 'Cosmic warriors who blend swordplay with stellar magic.',
    cardList: [
      "Starseeker's Surge", "Starseeker's Surge", // x2
      'Glimmering Rays',
      "Horizon's Edge", "Horizon's Edge", // x2
      'Anticomet Ascent',
      'Glimmerstep Strike',
      'Wishing Star',
      'Nebula Burst',
      'Starlight Sleight'
    ]
  },
  // More styles would be listed here
  // The game mentions 15 major styles with ✦ symbol
];

// Base equipment available to all characters
export const equipment: Equipment[] = [
  {
    id: 'sword',
    name: 'Sword',
    type: 'weapon',
    slots: 1,
    weaponRange: 'Melee, 1 square',
    effect: 'Channeled attacks gain a +1/+1 bonus.'
  },
  {
    id: 'staff',
    name: 'Staff',
    type: 'weapon',
    slots: 1,
    weaponRange: 'Melee, 1 square',
    effect: 'Channeled spells gain increased range.'
  },
  {
    id: 'bow',
    name: 'Bow',
    type: 'weapon',
    slots: 2,
    weaponRange: 'Ranged, 5 squares',
    effect: 'Can attack airborne enemies.'
  }
];

// Game constants from the rulebooks
export const gameConstants = GAME_CONSTANTS;

// Character creation data from character sheet
export const characterCreation = {
  steps: [
    {
      step: 1,
      description: 'Divide 8 points among Might, Agility, Will, and Defence (max 3 per attribute)'
    },
    {
      step: 2,
      description: 'Choose one permanent bonus: +25 Health, +1 Equipment Slot, +1 Ability Slot, or +2 Command Capacity'
    },
    {
      step: 3,
      description: 'Spend 6 style points (Major styles cost 2, minor styles cost 1)'
    },
    {
      step: 4,
      description: 'Equip mundane items and spend 2 points on Artefacts'
    },
    {
      step: 5,
      description: 'Construct a deck with at least 21 cards (max 3 copies of each)'
    }
  ],
  baseMovementAbilities: [
    {
      name: 'Run',
      type: 'Active [Movement]',
      cost: 1,
      effect: 'During your turn while earthbound, you may spend 1 movement point to move 1 square.'
    },
    {
      name: 'Jump',
      type: 'Active [Movement]',
      cost: 3,
      effect: 'During your turn while earthbound, you may spend 3 movement points to become airborne and move 1 square.'
    },
    {
      name: 'Fall',
      type: 'Active [Movement]',
      cost: 3,
      effect: 'During your turn you may spend 3 movement points to become earthbound and move 1 square.'
    }
  ]
};