#!/usr/bin/env python3
"""
Final card extraction script based on manual card analysis
"""

import re
import json
from pathlib import Path

def read_text_file(file_path):
    """Read text file and join words that were split across lines"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Join consecutive non-empty lines into word groups
    word_groups = []
    current_group = []
    
    for line in lines:
        line = line.strip()
        if line:
            current_group.append(line)
        else:
            if current_group:
                word_groups.append(' '.join(current_group))
                current_group = []
    
    # Join remaining group
    if current_group:
        word_groups.append(' '.join(current_group))
    
    # Join all groups into a single text
    text = ' '.join(word_groups)
    return text

def extract_spell_cards(text):
    """Extract spell cards from the text"""
    cards = []
    
    # Split by card IDs
    card_splits = re.split(r'(#\d{3})', text)
    
    for i in range(1, len(card_splits), 2):
        if i+1 < len(card_splits):
            card_id = card_splits[i]
            card_text = card_splits[i+1]
            
            # Extract card name (appears before the card ID in the previous split)
            name_text = card_splits[i-1] if i > 0 else ""
            # Get the last few words before the card ID as the name
            name_words = name_text.split()[-10:]  # Get last 10 words to search for name
            
            # Find the card name pattern (usually 2-3 capitalized words)
            potential_names = []
            for j in range(len(name_words)):
                for k in range(j+1, min(j+4, len(name_words)+1)):
                    candidate = ' '.join(name_words[j:k])
                    if all(w[0].isupper() for w in candidate.split() if w):
                        potential_names.append(candidate)
            
            # Use the longest valid name
            name = potential_names[-1] if potential_names else "Unknown"
            
            # Extract types (appear after card ID, before |)
            types_match = re.search(r'^([^|]+)\|', card_text)
            types_text = types_match.group(1) if types_match else ""
            types = [t.strip() for t in re.split(r'[,\s]+', types_text) if t.strip() and t.strip() not in ['and', '⸻']]
            # Filter valid types
            valid_types = ['Physical', 'Magical', 'Stone', 'Metal', 'Wind', 'Fire', 'Water', 'Light', 'Shadow', 'Nature']
            types = [t for t in types if t in valid_types]
            
            # Extract costs
            costs_match = re.search(r'\|\s*(\d+)\s*\|\s*(\d+)', card_text)
            primary_cost = int(costs_match.group(1)) if costs_match else 10
            secondary_cost = int(costs_match.group(2)) if costs_match else 10
            
            # Extract requirements
            req_match = re.search(r'Requirements?\s*:\s*([^:]+?)(?:Range|$)', card_text)
            requirements = req_match.group(1).strip() if req_match else None
            if requirements == '⸻':
                requirements = None
            
            # Extract range
            range_match = re.search(r'Range\s*:\s*([^:]+?)(?:Attack|$)', card_text)
            range_text = range_match.group(1).strip() if range_match else "Melee"
            
            # Extract attack
            attack_match = re.search(r'Attack\s*:\s*([^:|]+?)(?:\||Damage|$)', card_text)
            attack = attack_match.group(1).strip() if attack_match else None
            if attack == '⸻':
                attack = None
            
            # Extract damage
            damage_match = re.search(r'Damage\s*:\s*([^:|]+?)(?:[A-Z]|\[|$)', card_text)
            damage = damage_match.group(1).strip() if damage_match else "10"
            
            # Extract main effect (text after damage, before special effects)
            effect_start = card_text.find('Damage')
            if effect_start > 0:
                effect_text = card_text[effect_start:]
                # Remove the damage line
                effect_text = re.sub(r'^Damage\s*:\s*[^A-Z\[]+', '', effect_text)
                
                # Extract main effect (before On hit/On bash/Pitch)
                effect_match = re.search(r'^(.*?)(?:On hit|On bash|\[Pitch\]|$)', effect_text)
                effect = effect_match.group(1).strip() if effect_match else ""
                
                # Extract on hit
                on_hit_match = re.search(r'On hit\s*:\s*([^.]+\.)', effect_text)
                on_hit = on_hit_match.group(1).strip() if on_hit_match else None
                
                # Extract on bash
                on_bash_match = re.search(r'On bash\s*:\s*([^.]+\.)', effect_text)
                on_bash = on_bash_match.group(1).strip() if on_bash_match else None
                
                # Extract pitch effect
                pitch_match = re.search(r'\[Pitch\]\s*([^.]+\.)', effect_text)
                pitch_effect = pitch_match.group(1).strip() if pitch_match else None
            else:
                effect = ""
                on_hit = None
                on_bash = None
                pitch_effect = None
            
            # Create card object matching TypeScript interface
            card = {
                "id": card_id,
                "name": name,
                "types": types,
                "primaryCost": primary_cost,
                "secondaryCost": secondary_cost,
                "requirements": requirements,
                "range": range_text,
                "attack": attack,
                "damage": damage,
                "effect": effect.strip() if effect else "",
                "onHit": on_hit,
                "onBash": on_bash,
                "pitchEffect": pitch_effect
            }
            
            cards.append(card)
    
    return cards

def main():
    # Read the extracted text
    text_file = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text/COM_extracted.txt')
    text = read_text_file(text_file)
    
    # Extract cards
    cards = extract_spell_cards(text)
    
    # Filter out obviously broken cards
    valid_cards = []
    for card in cards:
        if card['name'] != "Unknown" and len(card['name']) > 2:
            valid_cards.append(card)
    
    print(f"Extracted {len(valid_cards)} spell cards")
    
    # Save to JSON
    output_path = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/src/data/archmajesty/spellCards_fixed.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(valid_cards, f, indent=2, ensure_ascii=False)
    
    # Print first few cards for verification
    print("\nFirst 5 cards:")
    for card in valid_cards[:5]:
        print(f"\n{card['name']} ({card['id']})")
        print(f"  Types: {', '.join(card['types'])}")
        print(f"  Cost: {card['primaryCost']} | {card['secondaryCost']}")
        print(f"  Effect: {card['effect'][:100]}...")

if __name__ == "__main__":
    main()