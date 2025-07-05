# Archmajesty Data Format Documentation

This document describes the data structures and extraction process for Archmajesty game content.

## Game Overview
- **Archmajesty** is a deck-building tactical RPG
- Players build **21-card decks** from **210 different spell cards**
- Combat is grid-based with earthbound/airborne positioning
- 1 GM + 1-3 players

## PDF Files
1. **B-COR (AM25).pdf** - Core Rulebook (37 pages)
   - Game rules and mechanics
   - Combat system

2. **B-COM (AM25).pdf** - Arcane Compendium (59 pages)
   - All 210 spell cards
   - 15 Major Styles (marked with ✦)
   - Artefacts and special equipment

3. **B-CHS (AM25).pdf** - Character Sheet (2 pages)
   - Character attributes and stats
   - 5-step character creation process

## Data Structures

### Spell Cards
Each card in the Compendium follows this format:
```
Card Name
#XXX
Type1, Type2, Type3 | PC | SC

Requirements: [text or ⸻ for none]
Range: [Melee/X squares/etc]
Attack: [D20 + MT/AG/WL or ⸻ for auto-hit]
Damage: [Base + Attribute]

[Main effect text]
On hit: [Effect]
On bash: [Critical effect]
[Pitch] [Pitch effect]
```

Key fields:
- **ID**: #001-#210
- **Types**: Physical, Stone, Metal, Wind, Fire, etc.
- **Costs**: Primary Cost (PC) and Secondary Cost (SC)
- **Attributes**: MT (Might), AG (Agility), WL (Will)

### Major Styles
Each style includes:
- Name + Symbol (✦ or ✧)
- 2 unique abilities
- Card list (5 standard, 2 starters, 2 finishers, 1 bonus)
- Cost: 2 style points

Format in PDF:
```
Style Name ✦
Included Abilities
x1 Ability Name
x1 Other Ability

Included Cards
x2 Card Name
x1 Another Card
[etc...]
```

### Character Creation
From the character sheet:

**Base Stats:**
- Health: 50
- Defence: 10
- Movement Points: 6
- Equipment Slots: 5
- Ability Slots: 5
- Command Capacity: 10

**Creation Process:**
1. Allocate 8 points among attributes (max 3 per)
2. Choose one bonus (+25 HP, +1 Equipment, +1 Ability, +2 Command)
3. Spend 6 style points
4. Equip items and spend 2 artefact points
5. Build 21+ card deck (max 3 copies per card)

## Extraction Process

### Current Approach
1. Use PyPDF2 to extract text from PDFs
2. Text comes out with each word on a separate line
3. Reconstruct sentences by joining words
4. Parse structured data using patterns

### Key Patterns
- Card IDs: `^#\d{3}$`
- Costs: `| \d+ | \d+`
- Sections: `Requirements:`, `Range:`, `Attack:`, `Damage:`
- Effects: `On hit:`, `On bash:`, `[Pitch]`

### Known Issues
- PDF extraction splits words across lines
- Some formatting is lost (tables, columns)
- Special characters (✦, ⸻) need UTF-8 handling

## Future Updates
When PDFs are updated:
1. Re-run `extract_pdfs.py` to get raw text
2. Update extraction scripts if format changes
3. Manually verify a few cards match expected format
4. Generate new JSON data files
5. Update TypeScript types if new fields added

## Data Files Location
- Raw PDF text: `/extracted_text/`
- Processed JSON: `/src/data/archmajesty/`
- Type definitions: `/src/types/archmajesty.ts`