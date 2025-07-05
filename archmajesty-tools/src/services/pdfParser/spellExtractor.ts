import type { Spell } from '../../types';

export class SpellExtractor {
  private parseSpellBlock(text: string): Spell | null {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let spell: Partial<Spell> = {
      id: '',
      description: ''
    };
    
    // Common spell patterns
    const namePattern = /^([A-Z][A-Za-z\s]+)$/;
    const levelPattern = /(?:Level|Spell Level|Circle):\s*(\d+|Cantrip)/i;
    const schoolPattern = /(?:School|Type):\s*([A-Za-z]+)/i;
    const castingTimePattern = /(?:Casting Time|Cast):\s*([A-Za-z0-9\s]+)/i;
    const rangePattern = /(?:Range):\s*([A-Za-z0-9\s]+)/i;
    const componentsPattern = /(?:Components?):\s*([VSM\s,]+)/i;
    const durationPattern = /(?:Duration):\s*([A-Za-z0-9\s]+)/i;
    
    // Extract name (usually first line)
    const nameMatch = lines[0]?.match(namePattern);
    if (nameMatch) {
      spell.name = nameMatch[1].trim();
      spell.id = spell.name.toLowerCase().replace(/\s+/g, '-');
    } else {
      return null;
    }
    
    // Extract spell properties
    let descriptionStartIndex = 1;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Level
      const levelMatch = line.match(levelPattern);
      if (levelMatch) {
        spell.level = levelMatch[1].toLowerCase() === 'cantrip' ? 0 : parseInt(levelMatch[1]);
        descriptionStartIndex = i + 1;
        continue;
      }
      
      // School
      const schoolMatch = line.match(schoolPattern);
      if (schoolMatch) {
        spell.school = schoolMatch[1].trim();
        descriptionStartIndex = i + 1;
        continue;
      }
      
      // Casting Time
      const castingMatch = line.match(castingTimePattern);
      if (castingMatch) {
        spell.castingTime = castingMatch[1].trim();
        descriptionStartIndex = i + 1;
        continue;
      }
      
      // Range
      const rangeMatch = line.match(rangePattern);
      if (rangeMatch) {
        spell.range = rangeMatch[1].trim();
        descriptionStartIndex = i + 1;
        continue;
      }
      
      // Components
      const componentsMatch = line.match(componentsPattern);
      if (componentsMatch) {
        spell.components = componentsMatch[1].trim();
        descriptionStartIndex = i + 1;
        continue;
      }
      
      // Duration
      const durationMatch = line.match(durationPattern);
      if (durationMatch) {
        spell.duration = durationMatch[1].trim();
        descriptionStartIndex = i + 1;
        continue;
      }
      
      // If we hit a line that doesn't match any pattern, assume description starts
      if (!line.includes(':')) {
        break;
      }
    }
    
    // Everything else is description
    spell.description = lines.slice(descriptionStartIndex).join(' ').trim();
    
    // Set default level if not found
    if (spell.level === undefined) {
      spell.level = 1;
    }
    
    return spell as Spell;
  }
  
  extractSpells(pdfText: string): Spell[] {
    const spells: Spell[] = [];
    
    // Split into spell blocks - spells are often separated by headers or patterns
    const spellSeparatorPatterns = [
      /(?=^[A-Z][A-Za-z\s]+$)/gm,  // Lines that look like spell names
      /\n{2,}(?=[A-Z])/g,          // Double newline before capital letter
      /={2,}/g,                     // Multiple equals signs
      /-{2,}/g                      // Multiple hyphens
    ];
    
    // Try to identify spell sections
    const spellSectionPatterns = [
      /spell\s*list/i,
      /spells?\s*by\s*level/i,
      /cantrips?/i,
      /1st\s*level\s*spells?/i,
      /2nd\s*level\s*spells?/i,
      /3rd\s*level\s*spells?/i,
      /\d+(?:st|nd|rd|th)\s*level/i
    ];
    
    // Find spell sections
    const lines = pdfText.split('\n');
    const spellSections: string[] = [];
    let inSpellSection = false;
    let currentSection = '';
    
    for (const line of lines) {
      // Check if we're entering a spell section
      for (const pattern of spellSectionPatterns) {
        if (pattern.test(line)) {
          if (currentSection) {
            spellSections.push(currentSection);
          }
          inSpellSection = true;
          currentSection = '';
          break;
        }
      }
      
      if (inSpellSection) {
        currentSection += line + '\n';
        
        // Check if we're leaving the spell section
        if (/^(equipment|items|features|traits|class\s*features)/i.test(line)) {
          inSpellSection = false;
          spellSections.push(currentSection);
          currentSection = '';
        }
      }
    }
    
    if (currentSection) {
      spellSections.push(currentSection);
    }
    
    // Process each spell section
    for (const section of spellSections) {
      // Split section into individual spells
      const spellBlocks = section.split(/\n{2,}/).filter(block => block.trim());
      
      for (const block of spellBlocks) {
        const spell = this.parseSpellBlock(block);
        if (spell && spell.name && spell.description) {
          spells.push(spell);
        }
      }
    }
    
    // If no spell sections found, try parsing the entire text
    if (spells.length === 0) {
      const blocks = pdfText.split(/\n{2,}/);
      for (const block of blocks) {
        if (block.length > 20) { // Skip very short blocks
          const spell = this.parseSpellBlock(block);
          if (spell && spell.name && spell.description) {
            spells.push(spell);
          }
        }
      }
    }
    
    return spells;
  }
}