#!/bin/bash
# Open PDFs in Preview for manual screenshot

echo "Opening Archmajesty PDFs in Preview..."
echo "Please take screenshots of:"
echo "1. A spell card page from B-COM (Arcane Compendium)"
echo "2. The cover or a style page from B-COR (Core Rulebook)"
echo "3. Any page showing the design aesthetic"
echo ""

# Open the PDFs
open -a Preview "/Users/graves/repos/archmajesty_tools/archmajesty-tools/public/books/B-COM (AM25).pdf"
open -a Preview "/Users/graves/repos/archmajesty_tools/archmajesty-tools/public/books/B-COR (AM25).pdf"

echo "PDFs opened. Please:"
echo "1. Take screenshots (Cmd+Shift+4)"
echo "2. Save them to the archmajesty-tools directory"
echo "3. Let me know when you're done!"