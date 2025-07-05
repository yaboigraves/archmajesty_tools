import type { Card } from '../../types';

export class CardExtractor {
  private parseCardBlock(text: string): Card | null {
    // Common patterns for card parsing
    const namePattern = /^([A-Z][A-Za-z\s]+)$/m;
    const costPattern = /(?:Cost|Mana|Energy):\s*(\d+|[A-Z]+)/i;
    const typePattern = /(?:Type|Card Type):\s*([A-Za-z\s]+)/i;
    const colorPattern = /(?:Color|Faction):\s*([A-Za-z]+)/i;
    const powerToughnessPattern = /(\d+)\/(\d+)/;
    const textStartPattern = /(?:Text|Effect|Ability):/i;
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let card: Partial<Card> = {
      id: '',
      rawText: text
    };
    
    // Extract name (usually first non-empty line)
    const nameMatch = lines[0]?.match(namePattern);
    if (nameMatch) {
      card.name = nameMatch[1].trim();
      card.id = card.name.toLowerCase().replace(/\s+/g, '-');
    } else {
      return null; // No valid name found
    }
    
    // Extract other properties
    for (const line of lines) {
      // Cost
      const costMatch = line.match(costPattern);
      if (costMatch) {
        card.cost = costMatch[1];
      }
      
      // Type
      const typeMatch = line.match(typePattern);
      if (typeMatch) {
        card.type = typeMatch[1].trim();
      }
      
      // Color
      const colorMatch = line.match(colorPattern);
      if (colorMatch) {
        card.color = colorMatch[1].trim();
      }
      
      // Power/Toughness
      const ptMatch = line.match(powerToughnessPattern);
      if (ptMatch) {
        card.power = ptMatch[1];
        card.toughness = ptMatch[2];
      }
    }
    
    // Extract card text (everything after "Text:" or similar)
    const textStartIndex = lines.findIndex(line => textStartPattern.test(line));
    if (textStartIndex !== -1) {
      const textLines = lines.slice(textStartIndex + 1);
      card.text = textLines.join(' ').trim();
    }
    
    // Extract keywords (common game keywords)
    const keywords = [];
    const keywordPatterns = [
      /flying/i, /trample/i, /haste/i, /first strike/i,
      /vigilance/i, /lifelink/i, /deathtouch/i,
      /hexproof/i, /indestructible/i, /reach/i
    ];
    
    const fullText = lines.join(' ').toLowerCase();
    for (const pattern of keywordPatterns) {
      if (pattern.test(fullText)) {
        keywords.push(pattern.source.replace(/\\/g, ''));
      }
    }
    
    if (keywords.length > 0) {
      card.keywords = keywords;
    }
    
    return card as Card;
  }
  
  extractCards(pdfText: string): Card[] {
    const cards: Card[] = [];
    
    // Split text into potential card blocks
    // This assumes cards are separated by certain patterns
    const cardSeparatorPatterns = [
      /={3,}/g,  // Three or more equals signs
      /\*{3,}/g, // Three or more asterisks
      /-{3,}/g,  // Three or more hyphens
      /_{3,}/g,  // Three or more underscores
      /\n{3,}/g  // Three or more newlines
    ];
    
    let blocks = [pdfText];
    for (const pattern of cardSeparatorPatterns) {
      const newBlocks: string[] = [];
      for (const block of blocks) {
        newBlocks.push(...block.split(pattern));
      }
      blocks = newBlocks;
    }
    
    // Process each block
    for (const block of blocks) {
      const trimmedBlock = block.trim();
      if (trimmedBlock.length < 10) continue; // Skip very short blocks
      
      const card = this.parseCardBlock(trimmedBlock);
      if (card && card.name) {
        cards.push(card);
      }
    }
    
    // If no cards found with separators, try to find cards by patterns
    if (cards.length === 0) {
      const lines = pdfText.split('\n');
      let currentBlock = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line looks like a card name (all caps or title case)
        if (line && /^[A-Z][A-Za-z\s]+$/.test(line) && currentBlock) {
          // Process previous block
          const card = this.parseCardBlock(currentBlock);
          if (card && card.name) {
            cards.push(card);
          }
          currentBlock = line + '\n';
        } else {
          currentBlock += line + '\n';
        }
      }
      
      // Process last block
      if (currentBlock) {
        const card = this.parseCardBlock(currentBlock);
        if (card && card.name) {
          cards.push(card);
        }
      }
    }
    
    return cards;
  }
}