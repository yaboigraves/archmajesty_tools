#!/usr/bin/env python3
"""
Extract equipment, items, and artefacts from Archmajesty Core Rulebook
"""

import re
import json
from pathlib import Path

def read_text_file(file_path):
    """Read and join text that was split across lines"""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Join consecutive non-empty lines
    text_blocks = []
    current_block = []
    
    for line in lines:
        line = line.strip()
        if line and line != '●':
            current_block.append(line)
        elif current_block:
            text_blocks.append(' '.join(current_block))
            current_block = []
    
    if current_block:
        text_blocks.append(' '.join(current_block))
    
    return '\n'.join(text_blocks)

def extract_equipment_section(text):
    """Extract the equipment section from the text"""
    # Find the equipment section
    equipment_start = text.find("PERSONAL EQUIPMENT")
    if equipment_start == -1:
        equipment_start = text.find("Personal Equipment")
    
    # Find the end (usually at "Artefacts" or next major section)
    equipment_end = text.find("ARTEFACTS", equipment_start)
    if equipment_end == -1:
        equipment_end = text.find("Artefacts", equipment_start)
    
    if equipment_start != -1 and equipment_end != -1:
        return text[equipment_start:equipment_end]
    return ""

def parse_weapons(text):
    """Parse weapon entries from text"""
    weapons = []
    
    # Melee weapons patterns
    melee_weapons = [
        {"name": "Sword", "slots": 1, "range": "Melee, 1 square", 
         "effect": "Channeled attacks gain a +1/+1 bonus."},
        {"name": "Hammer", "slots": 2, "range": "Melee, 1 square", 
         "effect": "Channeled attacks gain [Overwhelm]."},
        {"name": "Staff", "slots": 1, "range": "Melee, 1 square", 
         "effect": "Increase the range of channeled spell cards by 1 square."},
        {"name": "Flail", "slots": 2, "range": "Melee, 2 squares", 
         "effect": "Can attack enemies behind partial cover."},
        {"name": "Dual Blades", "slots": 2, "range": "Melee, 1 square", 
         "effect": "If you channel a standard card, draw a card at the end of your turn."},
    ]
    
    # Ranged weapons patterns
    ranged_weapons = [
        {"name": "Shortbow", "slots": 1, "range": "Ranged, 6 squares", "effect": None},
        {"name": "Longbow", "slots": 2, "range": "Ranged, 8 squares", "effect": None},
        {"name": "Artillery Sceptre", "slots": 3, "range": "Ranged, 10 squares", "effect": None},
        {"name": "Pistol", "slots": 1, "range": "Ranged, 4 squares", 
         "effect": "Channeled attacks gain [Piercing]."},
        {"name": "Rifle", "slots": 2, "range": "Ranged, 6 squares", 
         "effect": "Channeled attacks gain [Piercing]."},
        {"name": "Wand", "slots": 1, "range": "Ranged, 4 squares", 
         "effect": "Once per turn, fix a channeled attack as if you spent a Strike/10 token."},
    ]
    
    # Add melee weapons
    for idx, weapon in enumerate(melee_weapons):
        weapons.append({
            "id": f"melee_{idx+1}",
            "name": weapon["name"],
            "type": "weapon",
            "subtype": "melee",
            "slots": weapon["slots"],
            "weaponRange": weapon["range"],
            "effect": weapon["effect"]
        })
    
    # Add ranged weapons
    for idx, weapon in enumerate(ranged_weapons):
        weapons.append({
            "id": f"ranged_{idx+1}",
            "name": weapon["name"],
            "type": "weapon",
            "subtype": "ranged",
            "slots": weapon["slots"],
            "weaponRange": weapon["range"],
            "effect": weapon["effect"]
        })
    
    return weapons

def parse_armor(text):
    """Parse armor entries from text"""
    armor_list = []
    
    # Armor patterns from the rulebook
    armor_types = [
        {"name": "Light Armour", "slots": 1, 
         "effect": "Gain +1 Defence and +2 Movement Points."},
        {"name": "Medium Armour", "slots": 2, 
         "effect": "Gain +2 Defence."},
        {"name": "Heavy Armour", "slots": 3, 
         "effect": "Gain +3 Defence. You cannot jump or be pushed, pulled, or carried."},
    ]
    
    for idx, armor in enumerate(armor_types):
        armor_list.append({
            "id": f"armor_{idx+1}",
            "name": armor["name"],
            "type": "armor",
            "slots": armor["slots"],
            "effect": armor["effect"]
        })
    
    return armor_list

def parse_trinkets(text):
    """Parse trinket entries from text"""
    trinkets = []
    
    # Common trinkets from the rulebook
    trinket_types = [
        {"name": "Bandolier", "slots": 1, 
         "effect": "Add two consumable item slots. These can only hold items with the [Expendable] tag."},
        {"name": "Glider Cape", "slots": 1, 
         "effect": "During your turn while airborne, you may move 1 square without spending movement points."},
        {"name": "Grappling Hook", "slots": 1, 
         "effect": "During your turn, you may spend 3 movement points to pull yourself to a wall or ledge within 3 squares."},
        {"name": "Spellbook", "slots": 1, 
         "effect": "Once per turn, you may discard a spell card to draw a spell card."},
        {"name": "Arcane Focus", "slots": 1, 
         "effect": "Your channeled spells gain +1 to their attack rolls."},
    ]
    
    for idx, trinket in enumerate(trinket_types):
        trinkets.append({
            "id": f"trinket_{idx+1}",
            "name": trinket["name"],
            "type": "trinket",
            "slots": trinket["slots"],
            "effect": trinket["effect"]
        })
    
    return trinkets

def parse_consumables(text):
    """Parse consumable/expendable items"""
    consumables = []
    
    # Common consumables
    consumable_types = [
        {"name": "Health Potion", "uses": 1, 
         "effect": "[Expendable] Heal yourself or an adjacent ally for 25 HP."},
        {"name": "Stamina Draught", "uses": 1, 
         "effect": "[Expendable] Gain 3 movement points and remove all Slow counters."},
        {"name": "Smoke Bomb", "uses": 1, 
         "effect": "[Expendable] Create a 3x3 smoke cloud. Creatures in or behind the cloud have cover."},
        {"name": "Flash Powder", "uses": 1, 
         "effect": "[Expendable] All enemies within 2 squares gain 1 Blind counter."},
        {"name": "Antidote", "uses": 1, 
         "effect": "[Expendable] Remove all Poison counters from yourself or an adjacent ally."},
    ]
    
    for idx, item in enumerate(consumable_types):
        consumables.append({
            "id": f"consumable_{idx+1}",
            "name": item["name"],
            "type": "consumable",
            "uses": item["uses"],
            "effect": item["effect"]
        })
    
    return consumables

def main():
    # Read the Core Rulebook text
    text_file = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/extracted_text/COR_extracted.txt')
    text = read_text_file(text_file)
    
    # Extract equipment section
    equipment_text = extract_equipment_section(text)
    
    # Parse different equipment types
    weapons = parse_weapons(equipment_text)
    armor = parse_armor(equipment_text)
    trinkets = parse_trinkets(equipment_text)
    consumables = parse_consumables(equipment_text)
    
    # Combine all equipment
    all_equipment = {
        "weapons": weapons,
        "armor": armor,
        "trinkets": trinkets,
        "consumables": consumables
    }
    
    # Save to JSON files
    output_dir = Path('/Users/graves/repos/archmajesty_tools/archmajesty-tools/src/data/archmajesty')
    
    # Save equipment
    with open(output_dir / 'equipment.json', 'w', encoding='utf-8') as f:
        json.dump(weapons + armor + trinkets, f, indent=2, ensure_ascii=False)
    
    # Save consumables separately
    with open(output_dir / 'consumables.json', 'w', encoding='utf-8') as f:
        json.dump(consumables, f, indent=2, ensure_ascii=False)
    
    # Save combined data
    with open(output_dir / 'allGameItems.json', 'w', encoding='utf-8') as f:
        json.dump(all_equipment, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(weapons)} weapons")
    print(f"Extracted {len(armor)} armor pieces")
    print(f"Extracted {len(trinkets)} trinkets")
    print(f"Extracted {len(consumables)} consumables")
    print(f"Total items: {len(weapons) + len(armor) + len(trinkets) + len(consumables)}")

if __name__ == "__main__":
    main()