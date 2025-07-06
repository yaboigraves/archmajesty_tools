import React from 'react';
import { GameDatabase } from './components/GameDatabase';

function App() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header>
        <div className="header-content">
          <h1 className="header-title">ARCHMAJESTY REFERENCE</h1>
          <p className="header-subtitle">Quick Reference for Spells, Equipment & Items</p>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <GameDatabase />
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>Reference data from Archmajesty Core Rulebook & Arcane Compendium</p>
          <p>210 Spell Cards • Equipment • Items • Artefacts</p>
        </div>
      </footer>
    </div>
  );
}

export default App;