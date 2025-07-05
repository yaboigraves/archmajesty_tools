import { create } from 'zustand';

interface Character {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level: number;
  attributes?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints?: {
    current: number;
    max: number;
  };
  spells?: string[]; // Spell IDs
  equipment?: string[]; // Equipment IDs
}

interface AppState {
  // Game Data Status
  dataLoaded: boolean;
  setDataLoaded: (loaded: boolean) => void;
  
  // View State
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  selectedFilters: {
    color?: string;
    type?: string;
    rarity?: string;
    set?: string;
  };
  setSelectedFilters: (filters: AppState['selectedFilters']) => void;
  
  // Character Builder
  currentCharacter: Partial<Character> | null;
  setCurrentCharacter: (character: Partial<Character> | null) => void;
  updateCurrentCharacter: (updates: Partial<Character>) => void;
  
  // UI State
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  dataLoaded: true, // Since we're using local data
  searchTerm: '',
  selectedFilters: {},
  currentCharacter: null,
  isLoading: false,
  
  // Actions
  setDataLoaded: (loaded) => set({ dataLoaded: loaded }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSelectedFilters: (filters) => set({ selectedFilters: filters }),
  setCurrentCharacter: (character) => set({ currentCharacter: character }),
  updateCurrentCharacter: (updates) => 
    set((state) => ({
      currentCharacter: state.currentCharacter 
        ? { ...state.currentCharacter, ...updates }
        : updates
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));