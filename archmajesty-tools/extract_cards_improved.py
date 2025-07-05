#!/usr/bin/env python3
import re
import json
import os
from typing import Dict, List, Optional, Tuple

class ImprovedCardExtractor:
    def __init__(self):
        self.cards = []
        self.styles = []
        
    def join_words(self, lines: List[str], start: int, end: int) -> str:
        """Join single-word lines back into sentences"""
        words = []
        for i in range(start, end):
            word = lines[i].strip()
            if word:
                words.append(word)
        return ' '.join(words)
    
    def find_next_section(self, lines: List[str], start: int, markers: List[str]) -> Tuple[int, str]:
        """Find the next section marker"""
        for i in range(start, len(lines)):
            line = lines[i].strip()
            for marker in markers:
                if line.lower() == marker.lower() or line.lower().startswith(marker.lower()):
                    return i, marker
        return -1, ""
    
    def extract_cards(self, text: str) -> List[Dict]:
        """Extract all spell cards with improved parsing"""
        lines = text.split('\n')
        i = 0
        
        while i < len(lines):
            if re.match(r'^#\d{3}$', lines[i].strip()):
                card = self._extract_card_improved(lines, i)
                if card and card.get('name') and 'SPELL NAME' not in card['name']:
                    self.cards.append(card)
            i += 1
            
        return self.cards
    
    def _extract_card_improved(self, lines: List[str], id_index: int) -> Dict:
        """Extract a single card with better text joining"""
        card = {
            'id': lines[id_index].strip()
        }
        
        # Find card name - work backwards from ID
        name_words = []
        j = id_index - 1
        
        # Skip empty lines
        while j >= 0 and not lines[j].strip():
            j -= 1
        
        # Collect name words (usually 2-3 words)
        word_count = 0
        while j >= 0 and word_count < 4:
            word = lines[j].strip()
            if word and word[0].isupper() and not any(x in word for x in [':', '|', '+', '.']):
                name_words.insert(0, word)
                word_count += 1
                j -= 1
            else:
                break
        
        card['name'] = ' '.join(name_words)
        
        # Parse card details
        i = id_index + 1
        
        # Skip empty lines
        while i < len(lines) and not lines[i].strip():
            i += 1
        
        # Get types (comma-separated)
        types = []
        while i < len(lines):
            word = lines[i].strip()
            if word == '|':  # Hit cost separator
                break
            if word and word not in [',']:
                if word.endswith(','):
                    types.append(word[:-1])
                else:
                    types.append(word)
            i += 1
        
        card['types'] = types
        
        # Skip to first cost
        while i < len(lines) and lines[i].strip() != '|':
            i += 1
        i += 1  # Skip the |
        
        # Get primary cost
        while i < len(lines) and not lines[i].strip():
            i += 1
        if i < len(lines) and lines[i].strip().isdigit():
            card['primaryCost'] = int(lines[i].strip())
            i += 1
        
        # Skip to second cost
        while i < len(lines) and lines[i].strip() != '|':
            i += 1
        i += 1  # Skip the |
        
        # Get secondary cost
        while i < len(lines) and not lines[i].strip():
            i += 1
        if i < len(lines) and lines[i].strip().isdigit():
            card['secondaryCost'] = int(lines[i].strip())
            i += 1
        
        # Now parse the card text sections
        sections = {
            'requirements': [],
            'range': [],
            'attack': [],
            'damage': [],
            'effect': [],
            'pitch': []
        }
        
        current_section = 'effect'
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Check if we've hit the next card
            if re.match(r'^#\d{3}$', line) or (i > id_index + 100):  # Safety limit
                break
            
            # Section markers
            if line.lower() == 'requirements':
                current_section = 'requirements'
                i += 1
                if i < len(lines) and lines[i].strip() == ':':
                    i += 1
                continue
            elif line.lower() == 'range':
                current_section = 'range'
                i += 1
                if i < len(lines) and lines[i].strip() == ':':
                    i += 1
                continue
            elif line.lower() == 'attack':
                current_section = 'attack'
                i += 1
                if i < len(lines) and lines[i].strip() == ':':
                    i += 1
                continue
            elif line.lower() == 'damage':
                current_section = 'damage'
                i += 1
                if i < len(lines) and lines[i].strip() == ':':
                    i += 1
                continue
            elif line == '[' and i + 1 < len(lines) and 'Pitch' in lines[i + 1]:
                current_section = 'pitch'
                i += 2  # Skip [ and Pitch
                if i < len(lines) and lines[i].strip() == ']':
                    i += 1
                continue
            
            # Add content to current section
            if line and line not in ['|', ':', '⸻']:
                sections[current_section].append(line)
            
            i += 1
        
        # Process sections
        requirements_text = ' '.join(sections['requirements'])
        if requirements_text and requirements_text != '⸻':
            card['requirements'] = requirements_text
            
        card['range'] = ' '.join(sections['range'])
        
        attack_text = ' '.join(sections['attack'])
        if attack_text and attack_text != '⸻':
            card['attack'] = attack_text
            
        damage_text = ' '.join(sections['damage'])
        if damage_text and damage_text != '⸻':
            card['damage'] = damage_text
        
        # Process effect text
        effect_text = ' '.join(sections['effect'])
        
        # Extract special effects
        on_hit_match = re.search(r'On hit : (.*?)(?:On bash :|$)', effect_text)
        on_bash_match = re.search(r'On bash : (.*?)$', effect_text)
        
        if on_hit_match:
            card['onHit'] = on_hit_match.group(1).strip()
            effect_text = effect_text[:on_hit_match.start()].strip()
            
        if on_bash_match:
            card['onBash'] = on_bash_match.group(1).strip()
            if not on_hit_match:
                effect_text = effect_text[:on_bash_match.start()].strip()
        
        card['effect'] = effect_text
        
        if sections['pitch']:
            card['pitchEffect'] = ' '.join(sections['pitch'])
        
        return card
    
    def extract_styles(self, text: str) -> List[Dict]:
        """Extract major styles and their card lists"""
        styles = []
        
        # Find the major styles section
        lines = text.split('\n')
        
        # Look for style definitions
        style_pattern = r'^([A-Z][a-z]+)\s+([A-Z][a-z]+)\s*$'
        
        i = 0
        while i < len(lines):
            # Look for "Included Cards" sections
            if 'Included Cards' in lines[i]:
                # Work backwards to find the style name
                j = i - 1
                style_name = None
                
                while j >= 0 and j > i - 20:  # Look back up to 20 lines
                    # Check for style name pattern followed by ✦
                    if j + 1 < len(lines) and '✦' in lines[j + 1]:
                        # Join the two words before the symbol
                        if j >= 1:
                            potential_name = f"{lines[j-1].strip()} {lines[j].strip()}"
                            if re.match(r'^[A-Z][a-z]+\s+[A-Z][a-z]+$', potential_name):
                                style_name = potential_name
                                break
                    j -= 1
                
                if style_name:
                    # Extract card list
                    cards = []
                    k = i + 1
                    while k < len(lines) and k < i + 30:  # Limit search
                        line = lines[k].strip()
                        # Look for "x[number]" pattern
                        if re.match(r'^x\d+$', line):
                            # Previous lines should be the card name
                            card_words = []
                            m = k - 1
                            while m >= i and len(card_words) < 3:
                                word = lines[m].strip()
                                if word and word != 'Cards' and not word.startswith('x'):
                                    card_words.insert(0, word)
                                m -= 1
                            
                            if card_words:
                                card_name = ' '.join(card_words)
                                count = int(line[1:])
                                for _ in range(count):
                                    cards.append(card_name)
                        k += 1
                    
                    if cards:
                        styles.append({
                            'name': style_name,
                            'cards': cards,
                            'cost': 2  # Major styles cost 2
                        })
            
            i += 1
        
        return styles

def main():
    # Read the extracted text
    com_file = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text/COM_extracted.txt"
    
    with open(com_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    extractor = ImprovedCardExtractor()
    
    # Extract cards
    print("Extracting spell cards...")
    cards = extractor.extract_cards(text)
    print(f"Extracted {len(cards)} cards")
    
    # Extract styles
    print("\nExtracting major styles...")
    styles = extractor.extract_styles(text)
    print(f"Extracted {len(styles)} styles")
    
    # Create output directory
    output_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/game_data_final"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save cards
    with open(f"{output_dir}/spell_cards.json", 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)
    
    # Save styles
    with open(f"{output_dir}/major_styles.json", 'w', encoding='utf-8') as f:
        json.dump(styles, f, indent=2, ensure_ascii=False)
    
    # Print sample cards
    print("\nSample cards:")
    for i in range(min(3, len(cards))):
        print(f"\n{cards[i]['name']} ({cards[i]['id']}):")
        print(json.dumps(cards[i], indent=2, ensure_ascii=False))
    
    # Print styles summary
    if styles:
        print("\nMajor Styles found:")
        for style in styles:
            print(f"- {style['name']}: {len(style['cards'])} cards")

if __name__ == "__main__":
    main()