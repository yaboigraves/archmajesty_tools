#!/usr/bin/env python3
import re
import json
import os

def analyze_cards(text):
    """Extract and analyze spell cards from the text"""
    cards = []
    
    # Pattern to match card entries
    # Cards seem to start with a name, followed by #XXX, then details
    card_pattern = r'([A-Za-z\s\']+)\n+#(\d{3})\n+([^\n]+)'
    
    # Find all card entries
    lines = text.split('\n')
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Check if this line contains a card ID
        if re.match(r'^#\d{3}$', line):
            # Extract card data
            card = {}
            
            # Get name (previous non-empty line)
            j = i - 1
            while j >= 0 and not lines[j].strip():
                j -= 1
            if j >= 0:
                # Sometimes name is split across multiple lines
                name_parts = []
                k = j
                while k >= 0 and lines[k].strip() and not lines[k].strip().startswith('#'):
                    name_parts.insert(0, lines[k].strip())
                    k -= 1
                card['name'] = ' '.join(name_parts)
            
            card['id'] = line
            
            # Get types (next line after ID)
            i += 1
            if i < len(lines):
                types_line = lines[i].strip()
                if types_line:
                    # Types are usually comma-separated
                    card['types'] = [t.strip() for t in types_line.split(',')]
            
            # Look for cost indicators (numbers with | separators)
            i += 1
            while i < len(lines) and lines[i].strip() in ['|', '']:
                i += 1
            
            if i < len(lines) and lines[i].strip().isdigit():
                card['cost1'] = lines[i].strip()
                i += 1
                
                # Skip separator
                while i < len(lines) and lines[i].strip() in ['|', '']:
                    i += 1
                    
                if i < len(lines) and lines[i].strip().isdigit():
                    card['cost2'] = lines[i].strip()
            
            # Extract other properties
            properties = {}
            while i < len(lines):
                line = lines[i].strip()
                
                # Stop if we hit another card
                if re.match(r'^#\d{3}$', line):
                    break
                    
                # Look for property patterns
                if ':' in line:
                    key, value = line.split(':', 1)
                    properties[key.strip()] = value.strip()
                
                # Check for next card name pattern (multiple capital words)
                if i + 1 < len(lines) and re.match(r'^#\d{3}$', lines[i + 1].strip()):
                    break
                    
                i += 1
            
            card['properties'] = properties
            cards.append(card)
        else:
            i += 1
    
    return cards

def analyze_character_sheet(text):
    """Extract character creation rules from character sheet"""
    char_data = {
        'attributes': [],
        'base_values': {},
        'creation_steps': [],
        'equipment_types': []
    }
    
    # Extract base attributes
    if 'Might' in text and 'Agility' in text and 'Will' in text:
        char_data['attributes'] = ['Might', 'Agility', 'Will', 'Defence']
        char_data['base_values'] = {
            'Health': '50',
            'Defence': '10',
            'Movement Points': '6',
            'Equipment Slots': '5',
            'Ability Slots': '5',
            'Command Capacity': '10'
        }
    
    # Extract character creation steps
    step_pattern = r'Step\s+(\d+)\s*:\s*([^Step]+)'
    steps = re.findall(step_pattern, text, re.IGNORECASE)
    char_data['creation_steps'] = [(num, desc.strip()) for num, desc in steps]
    
    return char_data

def analyze_styles(text):
    """Extract major and minor styles from the text"""
    styles = {
        'major': [],
        'minor': []
    }
    
    # Look for major styles (they seem to be marked with ✦ or ✧)
    major_style_pattern = r'([A-Za-z]+)\s+([A-Za-z]+)\s+[✦✧]'
    major_matches = re.findall(major_style_pattern, text)
    
    for match in major_matches:
        style_name = f"{match[0]} {match[1]}"
        if style_name not in styles['major']:
            styles['major'].append(style_name)
    
    return styles

def main():
    output_dir = "/Users/graves/repos/archmajesty_tools/archmajesty-tools/game_analysis"
    os.makedirs(output_dir, exist_ok=True)
    
    # Analyze each extracted file
    files = {
        'COR': 'COR_extracted.txt',
        'COM': 'COM_extracted.txt',
        'CHS': 'CHS_extracted.txt'
    }
    
    analysis = {}
    
    for key, filename in files.items():
        filepath = f"/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text/{filename}"
        
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
            
            if key == 'COM':
                # Compendium - extract cards and styles
                cards = analyze_cards(text)
                styles = analyze_styles(text)
                analysis[key] = {
                    'total_cards': len(cards),
                    'sample_cards': cards[:10],  # First 10 cards as examples
                    'styles': styles
                }
                
                # Save full card list
                with open(f"{output_dir}/all_cards.json", 'w') as f:
                    json.dump(cards, f, indent=2)
                    
            elif key == 'CHS':
                # Character sheet - extract character creation data
                char_data = analyze_character_sheet(text)
                analysis[key] = char_data
                
            elif key == 'COR':
                # Core rules - extract game mechanics
                analysis[key] = {
                    'description': 'Core rulebook containing game mechanics and rules'
                }
    
    # Save analysis
    with open(f"{output_dir}/game_analysis.json", 'w') as f:
        json.dump(analysis, f, indent=2)
    
    print(f"Analysis complete. Results saved to {output_dir}")
    
    # Print summary
    print("\n=== GAME ANALYSIS SUMMARY ===")
    print(f"\nCards found: {analysis.get('COM', {}).get('total_cards', 0)}")
    print(f"Major styles: {len(analysis.get('COM', {}).get('styles', {}).get('major', []))}")
    print("\nSample card structure:")
    if analysis.get('COM', {}).get('sample_cards'):
        print(json.dumps(analysis['COM']['sample_cards'][0], indent=2))

if __name__ == "__main__":
    main()