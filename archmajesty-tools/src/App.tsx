import React from 'react';
import { GameDatabase } from './components/GameDatabase';

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-purple-700 shadow-xl border-b-2 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-4xl font-bold text-white tracking-wider">
              ARCHMAJESTY REFERENCE
            </h1>
            <p className="text-purple-200 mt-1">Quick Reference for Spells, Equipment & Items</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GameDatabase />
      </main>

      {/* Footer */}
      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Reference data from Archmajesty Core Rulebook & Arcane Compendium</p>
            <p className="mt-1">210 Spell Cards • Equipment • Items • Artefacts</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;