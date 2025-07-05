import jsPDF from 'jspdf';
import { Character } from '../types';

export class CharacterPDFExporter {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private lineHeight: number = 7;
  private currentY: number = 20;

  constructor() {
    this.pdf = new jsPDF();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  exportCharacter(character: Character): void {
    this.drawHeader(character);
    this.drawBasicInfo(character);
    this.drawAttributes(character);
    this.drawSpells(character);
    this.drawEquipment(character);
    this.drawNotes(character);

    // Save the PDF
    this.pdf.save(`${character.name || 'character'}_sheet.pdf`);
  }

  private drawHeader(character: Character): void {
    // Title
    this.pdf.setFontSize(24);
    this.pdf.text('Character Sheet', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Character name
    this.pdf.setFontSize(18);
    this.pdf.text(character.name || 'Unnamed Character', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 15;

    // Horizontal line
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private drawBasicInfo(character: Character): void {
    this.pdf.setFontSize(12);
    
    // Draw in two columns
    const col1X = this.margin;
    const col2X = this.pageWidth / 2;
    const startY = this.currentY;

    // Left column
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Race:', col1X, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(character.race || 'Unknown', col1X + 20, this.currentY);
    this.currentY += this.lineHeight;

    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Class:', col1X, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(character.class || 'Unknown', col1X + 20, this.currentY);
    this.currentY += this.lineHeight;

    // Right column
    this.currentY = startY;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Level:', col2X, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(String(character.level || 1), col2X + 20, this.currentY);
    this.currentY += this.lineHeight;

    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Background:', col2X, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(character.background || 'None', col2X + 35, this.currentY);
    this.currentY += this.lineHeight * 2;
  }

  private drawAttributes(character: Character): void {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Attributes', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.pdf.setFontSize(10);
    const attributes = character.attributes || {};
    const attrNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const boxWidth = (this.pageWidth - 2 * this.margin) / 6;
    
    attrNames.forEach((attr, index) => {
      const x = this.margin + index * boxWidth;
      const value = attributes[attr as keyof typeof attributes] || 10;
      const modifier = Math.floor((value - 10) / 2);
      const modString = modifier >= 0 ? `+${modifier}` : `${modifier}`;

      // Draw box
      this.pdf.rect(x, this.currentY, boxWidth - 2, 20);
      
      // Attribute name
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(attr.slice(0, 3).toUpperCase(), x + boxWidth/2 - 1, this.currentY + 5, { align: 'center' });
      
      // Value
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(String(value), x + boxWidth/2 - 1, this.currentY + 12, { align: 'center' });
      
      // Modifier
      this.pdf.setFontSize(9);
      this.pdf.text(`(${modString})`, x + boxWidth/2 - 1, this.currentY + 18, { align: 'center' });
    });

    this.currentY += 25;

    // Hit Points
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Hit Points:', this.margin, this.currentY);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(
      `${character.hitPoints?.current || 0} / ${character.hitPoints?.max || 0}`,
      this.margin + 30,
      this.currentY
    );
    this.currentY += this.lineHeight * 2;
  }

  private drawSpells(character: Character): void {
    if (!character.spells || character.spells.length === 0) return;

    this.checkNewPage();
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Spells', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    // Group spells by level
    const spellsByLevel: { [level: number]: typeof character.spells } = {};
    character.spells.forEach(spell => {
      const level = spell.level || 0;
      if (!spellsByLevel[level]) spellsByLevel[level] = [];
      spellsByLevel[level].push(spell);
    });

    // Draw spells by level
    Object.keys(spellsByLevel).sort((a, b) => Number(a) - Number(b)).forEach(level => {
      this.checkNewPage();
      
      const levelNum = Number(level);
      const levelText = levelNum === 0 ? 'Cantrips' : `Level ${levelNum}`;
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(levelText, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight - 2;
      
      this.pdf.setFont('helvetica', 'normal');
      spellsByLevel[levelNum].forEach(spell => {
        this.checkNewPage();
        
        let spellText = `• ${spell.name}`;
        if (spell.school) spellText += ` (${spell.school})`;
        
        this.pdf.text(spellText, this.margin + 10, this.currentY);
        this.currentY += this.lineHeight - 1;
      });
      
      this.currentY += 2;
    });

    this.currentY += this.lineHeight;
  }

  private drawEquipment(character: Character): void {
    if (!character.equipment || character.equipment.length === 0) return;

    this.checkNewPage();
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Equipment', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    character.equipment.forEach(item => {
      this.checkNewPage();
      
      let itemText = `• ${item.name}`;
      if (item.quantity && item.quantity > 1) {
        itemText += ` (x${item.quantity})`;
      }
      
      this.pdf.text(itemText, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight - 1;
    });

    this.currentY += this.lineHeight;
  }

  private drawNotes(character: Character): void {
    if (!character.notes) return;

    this.checkNewPage();
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Notes', this.margin, this.currentY);
    this.currentY += this.lineHeight;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    // Split notes into lines that fit on the page
    const lines = this.pdf.splitTextToSize(character.notes, this.pageWidth - 2 * this.margin);
    lines.forEach(line => {
      this.checkNewPage();
      this.pdf.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight - 1;
    });
  }

  private checkNewPage(): void {
    if (this.currentY > this.pageHeight - this.margin - 20) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }
}

export const generateCharacterPDF = (character: Character): void => {
  const exporter = new CharacterPDFExporter();
  exporter.exportCharacter(character);
};