import { create } from 'zustand';
import { Card } from '../types';
import { Character, Spell } from '../types';
import { PDFData } from '../types';

interface AppState {
  // PDF Management
  pdfs: PDFData[];
  isLoading: boolean;
  
  // Card Database
  cards: Card[];
  filteredCards: Card[];
  
  // Character Builder
  currentCharacter: Partial<Character> | null;
  availableSpells: Spell[];
  
  // Actions
  setPDFs: (pdfs: PDFData[]) => void;
  setLoading: (loading: boolean) => void;
  setCards: (cards: Card[]) => void;
  setFilteredCards: (cards: Card[]) => void;
  setCurrentCharacter: (character: Partial<Character> | null) => void;
  setAvailableSpells: (spells: Spell[]) => void;
  updateCurrentCharacter: (updates: Partial<Character>) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  pdfs: [],
  isLoading: false,
  cards: [],
  filteredCards: [],
  currentCharacter: null,
  availableSpells: [],
  
  // Actions
  setPDFs: (pdfs) => set({ pdfs }),
  setLoading: (loading) => set({ isLoading: loading }),
  setCards: (cards) => set({ cards, filteredCards: cards }),
  setFilteredCards: (filteredCards) => set({ filteredCards }),
  setCurrentCharacter: (character) => set({ currentCharacter: character }),
  setAvailableSpells: (spells) => set({ availableSpells: spells }),
  updateCurrentCharacter: (updates) => 
    set((state) => ({
      currentCharacter: state.currentCharacter 
        ? { ...state.currentCharacter, ...updates }
        : updates
    })),
}));