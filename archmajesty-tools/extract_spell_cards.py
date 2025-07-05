#!/usr/bin/env python3
import re
import json
import os
from typing import Dict, List, Optional

class SpellCardExtractor:
    def __init__(self):
        self.cards = []
        self.styles = []
        
    def extract_card_data(self, text: str) -> List[Dict]:
        """Extract all spell cards from the text"""
        lines = text.split('\n')
        i = 0
        
        while i < len(lines):
            # Look for card ID pattern
            if re.match(r'^#\d{3}$', lines[i].strip()):
                card = self._extract_single_card(lines, i)
                if card and card.get('name'):  # Only add if we got a valid name
                    self.cards.append(card)
            i += 1
            
        return self.cards
    
    def _extract_single_card(self, lines: List[str], id_index: int) -> Dict:
        """Extract a single card starting from its ID line"""
        card = {
            'id': lines[id_index].strip()
        }
        
        # Get card name (look backwards for non-empty lines)
        name_parts = []
        j = id_index - 1
        while j >= 0:
            line = lines[j].strip()
            if not line:
                j -= 1
                continue
            # Stop if we hit a card effect description or another ID
            if any(keyword in line for keyword in ['damage', 'counters', 'squares', 'attack', '#']):
                break
            # Check if this looks like a card name (title case words)
            if line and line[0].isupper():
                name_parts.insert(0, line)
                j -= 1
            else:
                break
        
        card['name'] = ' '.join(name_parts)
        
        # Extract card properties
        i = id_index + 1
        
        # Get types (next non-empty line after ID)
        while i < len(lines) and not lines[i].strip():
            i += 1
        if i < len(lines):
            types_line = lines[i].strip()
            if types_line and not types_line.isdigit():
                card['types'] = [t.strip() for t in types_line.split(',')]
                i += 1
        
        # Look for cost values (two numbers separated by |)
        cost_pattern = []
        while i < len(lines) and len(cost_pattern) < 2:
            line = lines[i].strip()
            if line.isdigit():
                cost_pattern.append(int(line))
            elif line == '|':
                pass  # Skip separator
            elif line and line not in ['|', '']:
                break  # Hit non-cost content
            i += 1
        
        if len(cost_pattern) >= 2:
            card['primaryCost'] = cost_pattern[0]
            card['secondaryCost'] = cost_pattern[1]
        
        # Extract card text sections
        sections = {
            'requirements': '',
            'range': '',
            'attack': '',
            'damage': '',
            'effect': [],
            'pitch_effect': ''
        }
        
        current_section = None
        effect_lines = []
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Check if we've hit the next card
            if re.match(r'^#\d{3}$', line):
                break
                
            # Check for section headers
            if line.lower().startswith('requirements'):
                current_section = 'requirements'
                if ':' in line:
                    sections['requirements'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('range'):
                current_section = 'range'
                if ':' in line:
                    sections['range'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('attack'):
                current_section = 'attack'
                if ':' in line:
                    sections['attack'] = line.split(':', 1)[1].strip()
            elif line.lower().startswith('damage'):
                current_section = 'damage'
                if ':' in line:
                    sections['damage'] = line.split(':', 1)[1].strip()
            elif '[' in line and 'Pitch' in line and ']' in line:
                # Pitch effect
                pitch_start = i
                pitch_lines = []
                i += 1
                while i < len(lines) and not re.match(r'^#\d{3}$', lines[i].strip()):
                    if lines[i].strip():
                        pitch_lines.append(lines[i].strip())
                    if '.' in lines[i]:  # End of sentence
                        break
                    i += 1
                sections['pitch_effect'] = ' '.join(pitch_lines)
                continue
            elif line and current_section in ['requirements', 'range', 'attack', 'damage']:
                # Continuation of current section
                sections[current_section] += ' ' + line
            elif line:
                # Main effect text
                effect_lines.append(line)
            
            i += 1
        
        # Process collected data
        if sections['requirements'] and sections['requirements'] != '⸻':
            card['requirements'] = sections['requirements']
        
        card['range'] = sections['range']
        
        if sections['attack'] and sections['attack'] != '⸻':
            card['attack'] = sections['attack']
            
        if sections['damage'] and sections['damage'] != '⸻':
            card['damage'] = sections['damage']
        
        # Combine effect lines
        effect_text = ' '.join(effect_lines)
        
        # Extract on hit/bash effects
        on_hit_match = re.search(r'On hit:(.*?)(?:On bash:|$)', effect_text, re.IGNORECASE | re.DOTALL)
        on_bash_match = re.search(r'On bash:(.*?)$', effect_text, re.IGNORECASE | re.DOTALL)
        
        if on_hit_match:
            card['onHit'] = on_hit_match.group(1).strip()
            effect_text = effect_text[:on_hit_match.start()].strip()
            
        if on_bash_match:
            card['onBash'] = on_bash_match.group(1).strip()
            if not on_hit_match:
                effect_text = effect_text[:on_bash_match.start()].strip()
        
        card['effect'] = effect_text
        
        if sections['pitch_effect']:
            card['pitchEffect'] = sections['pitch_effect']
        
        return card
    
    def extract_styles(self, text: str) -> List[Dict]:
        """Extract major styles and their card lists"""
        styles = []
        
        # Pattern for major styles (Name Name ✦)
        style_pattern = r'([A-Z][a-z]+)\s+([A-Z][a-z]+)\s+[✦✧]'
        
        # Find table of contents section to get all styles
        if 'TABLE OF CONTENTS' in text:
            toc_start = text.index('TABLE OF CONTENTS')
            toc_section = text[toc_start:toc_start + 3000]  # Get a chunk of TOC
            
            style_matches = re.finditer(style_pattern, toc_section)
            for match in style_matches:
                style_name = f"{match.group(1)} {match.group(2)}"
                styles.append({
                    'name': style_name,
                    'cards': []
                })
        
        # Now find card lists for each style
        for style in styles:
            # Look for the style's card list section
            style_section_pattern = style['name'] + r'.*?Cards.*?x\d+'
            matches = re.finditer(style_section_pattern, text, re.DOTALL)
            
            for match in matches:
                # Extract cards from this section
                section = text[match.start():match.start() + 1000]
                card_pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+x(\d+)'
                card_matches = re.finditer(card_pattern, section)
                
                for card_match in card_matches:
                    card_name = card_match.group(1)
                    count = int(card_match.group(2))
                    # Skip if it's another style name
                    if not any(s['name'] in card_name for s in styles):
                        for _ in range(count):
                            style['cards'].append(card_name)
                            
                if style['cards']:  # Only need first match with cards
                    break
        
        return styles

def main():
    # Read the extracted Compendium text
    com_file = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text/COM_extracted.txt"
    
    with open(com_file, 'r', encoding='utf-8') as f:
        text = f.read()
    
    extractor = SpellCardExtractor()
    
    # Extract cards
    print("Extracting spell cards...")
    cards = extractor.extract_card_data(text)
    print(f"Extracted {len(cards)} cards")
    
    # Extract styles  
    print("\nExtracting major styles...")
    styles = extractor.extract_styles(text)
    print(f"Extracted {len(styles)} styles")
    
    # Save results
    output_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/game_data_extracted"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save cards
    with open(f"{output_dir}/spell_cards.json", 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)
    
    # Save styles
    with open(f"{output_dir}/major_styles.json", 'w', encoding='utf-8') as f:
        json.dump(styles, f, indent=2, ensure_ascii=False)
    
    # Print sample card for verification
    if cards:
        print("\nSample card:")
        print(json.dumps(cards[0], indent=2, ensure_ascii=False))
    
    # Print card name list
    print("\nAll card names:")
    for i, card in enumerate(cards):
        if card.get('name'):
            print(f"{card['id']}: {card['name']}")

if __name__ == "__main__":
    main()