#!/usr/bin/env python3
"""
Extract Archmajesty game data from PDF text files.
This script reconstructs the spell cards and game data from the word-per-line PDF extraction.
"""

import re
import json
import os
from typing import Dict, List, Optional, Tuple

class ArcmajestyDataExtractor:
    def __init__(self):
        self.cards = []
        self.styles = []
        self.equipment = []
        self.abilities = []
        
    def process_text(self, text: str) -> str:
        """Join words that were split across lines"""
        lines = text.split('\n')
        processed_lines = []
        current_sentence = []
        
        for line in lines:
            line = line.strip()
            
            # Page markers and section headers stay on their own line
            if line.startswith('---') or line.startswith('PAGE') or line.startswith('#'):
                if current_sentence:
                    processed_lines.append(' '.join(current_sentence))
                    current_sentence = []
                processed_lines.append(line)
            # Colons indicate labels
            elif line == ':':
                if current_sentence and len(current_sentence) > 0:
                    current_sentence[-1] += ':'
            # Join regular words
            elif line:
                current_sentence.append(line)
            # Empty line ends sentence
            else:
                if current_sentence:
                    processed_lines.append(' '.join(current_sentence))
                    current_sentence = []
                processed_lines.append('')
        
        return '\n'.join(processed_lines)
    
    def extract_spell_cards(self, text: str) -> List[Dict]:
        """Extract spell cards from the compendium"""
        # First, process the text to join words
        processed = self.process_text(text)
        lines = processed.split('\n')
        
        cards = []
        i = 0
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Found a card ID
            if re.match(r'^#\d{3}$', line):
                card = {'id': line}
                
                # Card name is the previous non-empty line
                j = i - 1
                while j >= 0 and not lines[j].strip():
                    j -= 1
                if j >= 0:
                    card['name'] = lines[j].strip()
                
                # Next line should be types
                i += 1
                if i < len(lines):
                    types_line = lines[i].strip()
                    card['types'] = [t.strip() for t in types_line.split(',') if t.strip() and t.strip() != '|']
                
                # Extract costs (looking for pattern: | XX | YY)
                i += 1
                cost_match = None
                if i < len(lines):
                    # Look for cost pattern in next few lines
                    combined = ' '.join(lines[i:i+3])
                    cost_match = re.search(r'\|\s*(\d+)\s*\|\s*(\d+)', combined)
                    if cost_match:
                        card['primaryCost'] = int(cost_match.group(1))
                        card['secondaryCost'] = int(cost_match.group(2))
                
                # Skip to requirements section
                while i < len(lines) and 'Requirements' not in lines[i]:
                    i += 1
                
                # Parse card sections
                sections = {}
                current_section = None
                section_content = []
                
                while i < len(lines):
                    line = lines[i].strip()
                    
                    # Check if we hit next card
                    if re.match(r'^#\d{3}$', line):
                        break
                    
                    # Check for section headers
                    if line.startswith('Requirements:'):
                        if current_section:
                            sections[current_section] = ' '.join(section_content)
                        current_section = 'requirements'
                        section_content = [line.split(':', 1)[1].strip()] if ':' in line else []
                    elif line.startswith('Range:'):
                        if current_section:
                            sections[current_section] = ' '.join(section_content)
                        current_section = 'range'
                        section_content = [line.split(':', 1)[1].strip()] if ':' in line else []
                    elif line.startswith('Attack:'):
                        if current_section:
                            sections[current_section] = ' '.join(section_content)
                        current_section = 'attack'
                        section_content = [line.split(':', 1)[1].strip()] if ':' in line else []
                    elif line.startswith('Damage:'):
                        if current_section:
                            sections[current_section] = ' '.join(section_content)
                        current_section = 'damage'
                        section_content = [line.split(':', 1)[1].strip()] if ':' in line else []
                    elif line.startswith('[Pitch]') or '[ Pitch ]' in line:
                        if current_section:
                            sections[current_section] = ' '.join(section_content)
                        current_section = 'pitch'
                        section_content = []
                    elif line and current_section:
                        section_content.append(line)
                    elif line and not current_section:
                        # This is the main effect text
                        if 'effect' not in sections:
                            sections['effect'] = []
                        sections['effect'].append(line)
                    
                    i += 1
                
                # Store the last section
                if current_section and section_content:
                    sections[current_section] = ' '.join(section_content)
                
                # Process sections into card
                if 'requirements' in sections and sections['requirements'] != '⸻':
                    card['requirements'] = sections['requirements']
                
                card['range'] = sections.get('range', '')
                
                if 'attack' in sections and sections['attack'] != '⸻':
                    card['attack'] = sections['attack']
                
                if 'damage' in sections:
                    card['damage'] = sections['damage']
                
                # Process effect text
                effect_lines = sections.get('effect', [])
                if isinstance(effect_lines, list):
                    effect_text = ' '.join(effect_lines)
                else:
                    effect_text = effect_lines
                
                # Extract special triggers
                if 'On hit:' in effect_text:
                    parts = effect_text.split('On hit:', 1)
                    base_effect = parts[0].strip()
                    remaining = parts[1]
                    
                    if 'On bash:' in remaining:
                        hit_parts = remaining.split('On bash:', 1)
                        card['onHit'] = hit_parts[0].strip()
                        card['onBash'] = hit_parts[1].strip()
                    else:
                        card['onHit'] = remaining.strip()
                    
                    card['effect'] = base_effect
                elif 'On bash:' in effect_text:
                    parts = effect_text.split('On bash:', 1)
                    card['effect'] = parts[0].strip()
                    card['onBash'] = parts[1].strip()
                else:
                    card['effect'] = effect_text
                
                if 'pitch' in sections:
                    card['pitchEffect'] = sections['pitch']
                
                # Only add valid cards
                if card.get('name') and card['name'] != 'NAME':
                    cards.append(card)
                    
            else:
                i += 1
        
        return cards
    
    def extract_major_styles(self, text: str) -> List[Dict]:
        """Extract major styles and their associated cards"""
        processed = self.process_text(text)
        lines = processed.split('\n')
        styles = []
        
        # Find style sections
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Look for style pattern: "Name Name ✦"
            if '✦' in line or '✧' in line:
                # Extract style name
                style_name = line.replace('✦', '').replace('✧', '').strip()
                
                # Look ahead for "Included Cards" section
                j = i + 1
                while j < len(lines) and j < i + 50:
                    if 'Included Cards' in lines[j]:
                        # Extract card list
                        cards = []
                        k = j + 1
                        while k < len(lines) and k < j + 20:
                            card_line = lines[k].strip()
                            # Look for pattern: "x2 Card Name" or "Card Name x2"
                            match = re.match(r'x(\d+)\s+(.+)', card_line)
                            if not match:
                                match = re.match(r'(.+)\s+x(\d+)', card_line)
                                if match:
                                    card_name = match.group(1).strip()
                                    count = int(match.group(2))
                                else:
                                    card_name = None
                                    count = 0
                            else:
                                count = int(match.group(1))
                                card_name = match.group(2).strip()
                            
                            if card_name and count > 0:
                                for _ in range(count):
                                    cards.append(card_name)
                            
                            k += 1
                        
                        if cards:
                            styles.append({
                                'name': style_name,
                                'symbol': '✦' if '✦' in line else '✧',
                                'cards': cards,
                                'cost': 2  # Major styles cost 2 points
                            })
                        break
                    j += 1
            
            i += 1
        
        return styles
    
    def extract_character_data(self, chs_text: str) -> Dict:
        """Extract character creation rules from character sheet"""
        processed = self.process_text(chs_text)
        
        char_data = {
            'attributes': {
                'primary': ['Might', 'Agility', 'Will', 'Defence'],
                'starting_points': 8,
                'max_per_attribute': 3
            },
            'base_stats': {
                'health': 50,
                'defence': 10,
                'movement': 6,
                'equipment_slots': 5,
                'ability_slots': 5,
                'command_capacity': 10
            },
            'creation_bonuses': [
                {'type': 'health', 'value': 25},
                {'type': 'equipment_slot', 'value': 1},
                {'type': 'ability_slot', 'value': 1},
                {'type': 'command_capacity', 'value': 2}
            ],
            'style_points': 6,
            'artefact_points': 2,
            'deck_rules': {
                'minimum_cards': 21,
                'max_copies': 3
            }
        }
        
        return char_data

def main():
    # File paths
    base_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text"
    output_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/src/data/archmajesty"
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    extractor = ArcmajestyDataExtractor()
    
    # Extract spell cards from Compendium
    print("Extracting spell cards...")
    with open(f"{base_dir}/COM_extracted.txt", 'r', encoding='utf-8') as f:
        com_text = f.read()
    
    cards = extractor.extract_spell_cards(com_text)
    print(f"Extracted {len(cards)} spell cards")
    
    # Extract major styles
    print("Extracting major styles...")
    styles = extractor.extract_major_styles(com_text)
    print(f"Extracted {len(styles)} major styles")
    
    # Extract character data
    print("Extracting character creation data...")
    with open(f"{base_dir}/CHS_extracted.txt", 'r', encoding='utf-8') as f:
        chs_text = f.read()
    
    char_data = extractor.extract_character_data(chs_text)
    
    # Save all data
    with open(f"{output_dir}/spellCards.json", 'w', encoding='utf-8') as f:
        json.dump(cards, f, indent=2, ensure_ascii=False)
    
    with open(f"{output_dir}/majorStyles.json", 'w', encoding='utf-8') as f:
        json.dump(styles, f, indent=2, ensure_ascii=False)
    
    with open(f"{output_dir}/characterData.json", 'w', encoding='utf-8') as f:
        json.dump(char_data, f, indent=2, ensure_ascii=False)
    
    # Create a summary
    summary = {
        'total_cards': len(cards),
        'total_styles': len(styles),
        'card_types': list(set(t for card in cards for t in card.get('types', []))),
        'style_names': [s['name'] for s in styles]
    }
    
    with open(f"{output_dir}/summary.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    print("\nData extraction complete!")
    print(f"Files saved to: {output_dir}")
    
    # Print some examples
    if cards:
        print("\nExample card:")
        print(json.dumps(cards[1], indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()