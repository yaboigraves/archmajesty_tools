import React, { useState } from 'react';
import { useStore } from './store';
import { dataService } from './services/dataService';
import { CardDatabase } from './components/CardDatabase';
import { ArcmajestyCharacterBuilder } from './components/ArcmajestyCharacterBuilder';

function App() {
  const [view, setView] = useState<'home' | 'cards' | 'character'>('home');
  const { dataLoaded } = useStore();

  // Get some stats for the home page
  // Get stats from Archmajesty data
  const cardCount = 210; // Total spell cards in the game
  const styleCount = 15; // Major styles with ✦
  const deckSize = 21; // Minimum deck size

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Archmajesty Tools
            </h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setView('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'home'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setView('cards')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'cards'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Card Database
              </button>
              <button
                onClick={() => setView('character')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  view === 'character'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Character Builder
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'home' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to Archmajesty Tools!</h2>
            <p className="text-gray-600 mb-6">
              Your companion app for the Archmajesty tabletop game. Search cards, build characters, and manage your game.
            </p>
            
            {/* Game Data Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">📊 Game Database</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Spell Cards:</span>
                  <span className="ml-2 font-medium">{cardCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Major Styles:</span>
                  <span className="ml-2 font-medium">{styleCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Deck Size:</span>
                  <span className="ml-2 font-medium">{deckSize}+</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">📚 Card Database</h3>
                <p className="text-sm text-gray-600">
                  Browse and search through all {cardCount} spell cards. Filter by type and cost.
                </p>
                <button
                  onClick={() => setView('cards')}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Browse Cards →
                </button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">⚔️ Character Builder</h3>
                <p className="text-sm text-gray-600">
                  Create mages with our 5-step wizard. Choose from {styleCount} major fighting styles.
                </p>
                <button
                  onClick={() => setView('character')}
                  className="mt-3 text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Create Character →
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium mb-2 text-yellow-800">📝 Note</h3>
              <p className="text-sm text-yellow-700">
                This tool uses game data from the Archmajesty PDFs:
                • B-COR: Core Rulebook
                • B-COM: Arcane Compendium (210 spell cards)
                • B-CHS: Character Sheet format
              </p>
            </div>
          </div>
        )}

        {view === 'cards' && <CardDatabase />}

        {view === 'character' && <ArcmajestyCharacterBuilder />}
      </main>
    </div>
  );
}

export default App;