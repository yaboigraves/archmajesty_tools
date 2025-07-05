import type { CharacterOptions, Equipment } from '../../types';

export class CharacterOptionsExtractor {
  extractCharacterOptions(pdfText: string): CharacterOptions {
    const options: CharacterOptions = {
      races: [],
      classes: [],
      backgrounds: [],
      startingEquipment: [],
      classFeatures: {}
    };
    
    // Extract races
    options.races = this.extractSection(pdfText, [
      /races?\s*(?:options?)?/i,
      /playable\s*races?/i,
      /character\s*races?/i
    ]);
    
    // Extract classes
    options.classes = this.extractSection(pdfText, [
      /classes?\s*(?:options?)?/i,
      /playable\s*classes?/i,
      /character\s*classes?/i
    ]);
    
    // Extract backgrounds
    options.backgrounds = this.extractSection(pdfText, [
      /backgrounds?\s*(?:options?)?/i,
      /character\s*backgrounds?/i,
      /starting\s*backgrounds?/i
    ]);
    
    // Extract starting equipment
    const equipmentText = this.extractSectionText(pdfText, [
      /starting\s*equipment/i,
      /initial\s*equipment/i,
      /basic\s*equipment/i
    ]);
    
    if (equipmentText) {
      options.startingEquipment = this.parseEquipment(equipmentText);
    }
    
    // Extract class features
    for (const className of options.classes) {
      const features = this.extractClassFeatures(pdfText, className);
      if (features.length > 0) {
        options.classFeatures[className] = features;
      }
    }
    
    return options;
  }
  
  private extractSection(text: string, patterns: RegExp[]): string[] {
    const items: string[] = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line matches any of our section patterns
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          // Look for list items in the following lines
          for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
            const itemLine = lines[j].trim();
            
            // Stop if we hit another section
            if (/^[A-Z][A-Z\s]+$/.test(itemLine) || itemLine.includes(':')) {
              break;
            }
            
            // Check for list items (bullets, numbers, or just capitalized words)
            const itemMatch = itemLine.match(/^(?:[•·\-*]\s*)?(?:\d+\.\s*)?([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*)/);
            if (itemMatch) {
              const item = itemMatch[1].trim();
              if (item.length > 2 && !items.includes(item)) {
                items.push(item);
              }
            }
          }
          break;
        }
      }
    }
    
    return items;
  }
  
  private extractSectionText(text: string, patterns: RegExp[]): string | null {
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          // Collect text from the following lines until we hit another section
          let sectionText = '';
          for (let j = i + 1; j < Math.min(i + 50, lines.length); j++) {
            const nextLine = lines[j];
            
            // Stop if we hit another major section
            if (/^[A-Z][A-Z\s]+:/.test(nextLine) || /^(CHAPTER|SECTION|PART)\s+/i.test(nextLine)) {
              break;
            }
            
            sectionText += nextLine + '\n';
          }
          return sectionText;
        }
      }
    }
    
    return null;
  }
  
  private parseEquipment(text: string): Equipment[] {
    const equipment: Equipment[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Parse equipment entries
      // Format examples: "Sword (1)", "Rope, 50 feet", "Backpack x1"
      const patterns = [
        /^([A-Za-z\s]+)\s*\((\d+)\)/, // Item (quantity)
        /^([A-Za-z\s]+)\s*x\s*(\d+)/, // Item x quantity
        /^(\d+)\s*x?\s*([A-Za-z\s]+)/, // quantity x Item
        /^([A-Za-z\s,]+)$/ // Just item name
      ];
      
      for (const pattern of patterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          let name: string;
          let quantity = 1;
          
          if (match[2]) {
            // Has quantity
            if (/^\d/.test(match[1])) {
              // Quantity first
              quantity = parseInt(match[1]);
              name = match[2].trim();
            } else {
              // Name first
              name = match[1].trim();
              quantity = parseInt(match[2]);
            }
          } else {
            // No quantity specified
            name = match[1].trim();
          }
          
          if (name && name.length > 2) {
            equipment.push({
              id: name.toLowerCase().replace(/\s+/g, '-'),
              name,
              type: this.inferEquipmentType(name),
              quantity
            });
          }
          break;
        }
      }
    }
    
    return equipment;
  }
  
  private inferEquipmentType(name: string): string {
    const lowerName = name.toLowerCase();
    
    if (/sword|axe|bow|dagger|mace|spear|staff/.test(lowerName)) {
      return 'weapon';
    } else if (/armor|shield|helm|boots|gloves/.test(lowerName)) {
      return 'armor';
    } else if (/potion|scroll|wand|ring|amulet/.test(lowerName)) {
      return 'magic';
    } else if (/torch|rope|rations|bedroll|tent/.test(lowerName)) {
      return 'adventuring';
    } else {
      return 'misc';
    }
  }
  
  private extractClassFeatures(text: string, className: string): string[] {
    const features: string[] = [];
    const classPattern = new RegExp(`${className}\\s*(?:features?|abilities?)?`, 'i');
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (classPattern.test(lines[i])) {
        // Look for features in the following lines
        for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
          const line = lines[j].trim();
          
          // Stop if we hit another class or major section
          if (/^(class|race|background|equipment|spells?)/i.test(line)) {
            break;
          }
          
          // Look for feature patterns
          const featureMatch = line.match(/^(?:[•·\-*]\s*)?(?:Level\s*\d+:?\s*)?([A-Z][a-z]+(?:\s+[A-Za-z]+)*)/);
          if (featureMatch) {
            const feature = featureMatch[1].trim();
            if (feature.length > 3 && !features.includes(feature)) {
              features.push(feature);
            }
          }
        }
        break;
      }
    }
    
    return features;
  }
}