#!/usr/bin/env python3
"""
Manual card parser to understand the exact format and create proper extraction patterns
"""

import re
import json

# Sample cards manually transcribed from the PDF
manual_cards = [
    {
        "id": "#001",
        "name": "Earthsteel Bash",
        "types": ["Physical", "Stone", "Metal"],
        "primaryCost": 10,
        "secondaryCost": 10,
        "requirements": None,  # ⸻ means none
        "range": "Melee or Melee Weapon",
        "attack": "D20 + MT",
        "damage": "10 + MT",
        "effect": "Attack a single enemy.",
        "onHit": "Push them 0-2 squares away.",
        "onBash": "They suffer an additional 5 + MT damage."
    },
    {
        "id": "#002", 
        "name": "Earthsteel Rush",
        "types": ["Physical", "Stone", "Metal"],
        "primaryCost": 10,
        "secondaryCost": 10,
        "requirements": None,
        "range": "Melee or Melee Weapon",
        "attack": "D20 + MT",
        "damage": "10 + MT",
        "effect": "Shift 0-3 squares, then attack a single enemy.",
        "onHit": "Carry them 0-3 squares.",
        "onBash": "They gain 2 Weaken counters and you gain 2 Empower counters."
    },
    {
        "id": "#003",
        "name": "Pommel Pummel",
        "types": ["Physical", "Stone", "Metal"],
        "primaryCost": 10,
        "secondaryCost": 10,
        "requirements": None,
        "range": "Melee or Melee Weapon",
        "attack": None,  # ⸻ means auto-hit
        "damage": "7 + MT",
        "effect": "Automatically hit a single enemy.",
        "onHit": "They gain a Stun counter.",
        "onBash": None
    },
    {
        "id": "#004",
        "name": "Earthsteel Fracture",
        "types": ["Physical", "Stone", "Metal"],
        "primaryCost": 15,
        "secondaryCost": 5,
        "requirements": None,
        "range": "Melee or Melee Weapon",
        "attack": None,  # auto-hit
        "damage": "7 + MT",
        "effect": "[Piercing] Place three Boulder objects within 5 squares, then for each Boulder within 5 squares, automatically hit a different enemy next to that Boulder from any range.",
        "onHit": None,
        "onBash": None
    },
    {
        "id": "#010",
        "name": "Cloudstep Rush",
        "types": ["Physical", "Wind"],
        "primaryCost": 15,
        "secondaryCost": 5,
        "requirements": None,
        "range": "Melee or Melee Weapon",
        "attack": "D20 + AG",
        "damage": "10 + AG",
        "effect": "Shift 1-6 squares, then attack a single enemy.",
        "onHit": None,
        "onBash": None,
        "pitchEffect": "Gain 2 Swift counters."
    },
    {
        "id": "#011",
        "name": "Dragonhawk Dive",
        "types": ["Physical", "Wind"],
        "primaryCost": 15,
        "secondaryCost": 5,
        "requirements": "You must be airborne",
        "range": "2 squares or Melee Weapon (+1sq)",
        "attack": "D20 + AG",
        "damage": "15 + AG",
        "effect": "Shift 0-4 squares, then attack a single earthbound enemy.",
        "onHit": None,
        "onBash": None,
        "pitchEffect": "Gain 2 Swift counters."
    }
]

# Analyze the raw text to understand patterns
def analyze_raw_text():
    with open('/Users/graves/repos/archmajesty_tools/archmajesty-tools/sample_cards_raw.txt', 'r') as f:
        lines = f.readlines()
    
    # Join every N lines to see patterns
    print("=== ANALYZING RAW TEXT PATTERNS ===")
    print("\nFirst 50 lines:")
    for i, line in enumerate(lines[:50]):
        print(f"{i:3d}: {repr(line.strip())}")
    
    # Try joining consecutive non-empty lines
    print("\n=== WORD GROUPS ===")
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
    
    for i, group in enumerate(word_groups[:20]):
        print(f"{i:3d}: {group}")

def create_extraction_pattern():
    """Create a regex pattern based on manual card analysis"""
    
    # Pattern observations:
    # 1. Card name appears before #XXX
    # 2. Types appear after #XXX, comma-separated
    # 3. Costs appear as: | XX | YY
    # 4. Sections: Requirements:, Range:, Attack:, Damage:
    # 5. Effect text follows
    # 6. Special: On hit:, On bash:, [Pitch]
    
    pattern = {
        "card_id": r"#\d{3}",
        "costs": r"\|\s*(\d+)\s*\|\s*(\d+)",
        "section_headers": ["Requirements:", "Range:", "Attack:", "Damage:"],
        "special_effects": ["On hit:", "On bash:", "[Pitch]"],
        "auto_hit": "⸻"
    }
    
    return pattern

def main():
    print("=== MANUAL CARD ANALYSIS ===\n")
    
    # Save manual cards for reference
    with open('/Users/graves/repos/archmajesty_tools/archmajesty-tools/manual_cards_reference.json', 'w') as f:
        json.dump(manual_cards, f, indent=2)
    
    print(f"Saved {len(manual_cards)} manually transcribed cards")
    
    # Analyze raw text
    analyze_raw_text()
    
    # Create extraction patterns
    patterns = create_extraction_pattern()
    print("\n=== EXTRACTION PATTERNS ===")
    print(json.dumps(patterns, indent=2))
    
    # Test pattern ideas
    print("\n=== CARD STRUCTURE ===")
    for card in manual_cards[:2]:
        print(f"\n{card['name']} ({card['id']}):")
        print(f"  Types: {', '.join(card['types'])}")
        print(f"  Cost: {card['primaryCost']} | {card['secondaryCost']}")
        print(f"  Range: {card['range']}")
        if card['attack']:
            print(f"  Attack: {card['attack']}")
        print(f"  Damage: {card['damage']}")
        print(f"  Effect: {card['effect']}")
        if card['onHit']:
            print(f"  On hit: {card['onHit']}")
        if card['onBash']:
            print(f"  On bash: {card['onBash']}")

if __name__ == "__main__":
    main()