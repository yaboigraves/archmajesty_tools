import type { GameData, Card, Spell, Race, CharacterClass, Equipment } from '../data/gameData';
import { sampleGameData } from '../data/gameData';

class DataService {
  private gameData: GameData;
  
  constructor() {
    // In production, this would load from JSON files or an API
    // For now, we use the sample data
    this.gameData = sampleGameData;
    
    // Store in localStorage for persistence
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const stored = localStorage.getItem('archmajesty-game-data');
    if (stored) {
      try {
        this.gameData = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load game data from localStorage', e);
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('archmajesty-game-data', JSON.stringify(this.gameData));
  }

  // Card methods
  getAllCards(): Card[] {
    return this.gameData.cards;
  }

  getCardsBySet(set: string): Card[] {
    return this.gameData.cards.filter(card => card.set === set);
  }

  searchCards(searchTerm: string): Card[] {
    const term = searchTerm.toLowerCase();
    return this.gameData.cards.filter(card => 
      card.name.toLowerCase().includes(term) ||
      card.text?.toLowerCase().includes(term) ||
      card.keywords?.some(k => k.toLowerCase().includes(term))
    );
  }

  filterCards(filters: {
    color?: string;
    type?: string;
    rarity?: string;
    set?: string;
  }): Card[] {
    let cards = this.gameData.cards;
    
    if (filters.color) {
      cards = cards.filter(c => c.color === filters.color);
    }
    if (filters.type) {
      cards = cards.filter(c => c.type === filters.type);
    }
    if (filters.rarity) {
      cards = cards.filter(c => c.rarity === filters.rarity);
    }
    if (filters.set) {
      cards = cards.filter(c => c.set === filters.set);
    }
    
    return cards;
  }

  // Spell methods
  getAllSpells(): Spell[] {
    return this.gameData.spells;
  }

  getSpellsByLevel(level: number): Spell[] {
    return this.gameData.spells.filter(spell => spell.level === level);
  }

  getSpellsByClass(className: string): Spell[] {
    return this.gameData.spells.filter(spell => 
      spell.classes?.includes(className)
    );
  }

  // Character creation methods
  getAllRaces(): Race[] {
    return this.gameData.races;
  }

  getAllClasses(): CharacterClass[] {
    return this.gameData.classes;
  }

  getClassById(id: string): CharacterClass | undefined {
    return this.gameData.classes.find(c => c.id === id);
  }

  getRaceById(id: string): Race | undefined {
    return this.gameData.races.find(r => r.id === id);
  }

  // Equipment methods
  getAllEquipment(): Equipment[] {
    return this.gameData.equipment;
  }

  getEquipmentByType(type: Equipment['type']): Equipment[] {
    return this.gameData.equipment.filter(e => e.type === type);
  }

  // Rules methods
  getAttributes(): string[] {
    return this.gameData.rules.attributes;
  }

  getSkills(): string[] {
    return this.gameData.rules.skills;
  }

  getConditions(): string[] {
    return this.gameData.rules.conditions;
  }

  // Admin method to update data (for future PDF parsing)
  updateGameData(newData: Partial<GameData>): void {
    this.gameData = {
      ...this.gameData,
      ...newData
    };
    this.saveToLocalStorage();
  }
}

// Export a singleton instance
export const dataService = new DataService();