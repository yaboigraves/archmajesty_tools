import { PDFParser } from './pdfParser';
import { CardExtractor } from './pdfParser/cardExtractor';
import { SpellExtractor } from './pdfParser/spellExtractor';
import { CharacterOptionsExtractor } from './pdfParser/characterOptionsExtractor';
import { pdfStorage } from './storage/pdfStorage';
import { PDFData } from '../types';
import { Card } from '../types';
import { Spell } from '../types';

export class PDFProcessingService {
  private pdfParser = new PDFParser();
  private cardExtractor = new CardExtractor();
  private spellExtractor = new SpellExtractor();
  private characterOptionsExtractor = new CharacterOptionsExtractor();

  async processPDF(fileName: string, arrayBuffer: ArrayBuffer): Promise<PDFData> {
    try {
      // Load the PDF
      await this.pdfParser.loadPDF(arrayBuffer);
      
      // Extract all text
      const fullText = await this.pdfParser.extractAllText();
      
      // Extract structured data based on file name
      let cards: Card[] = [];
      let spells: Spell[] = [];
      let characterOptions = {
        races: [],
        classes: [],
        backgrounds: [],
        startingEquipment: [],
        classFeatures: {}
      };
      
      const lowerFileName = fileName.toLowerCase();
      
      // Determine what to extract based on file name
      if (lowerFileName.includes('cor') || lowerFileName.includes('core')) {
        // Core rulebook - extract character options and basic spells
        characterOptions = this.characterOptionsExtractor.extractCharacterOptions(fullText);
        spells = this.spellExtractor.extractSpells(fullText);
      } else if (lowerFileName.includes('com') || lowerFileName.includes('compendium')) {
        // Compendium - likely contains cards
        cards = this.cardExtractor.extractCards(fullText);
      } else if (lowerFileName.includes('chs') || lowerFileName.includes('character')) {
        // Character sheets - extract character options and equipment
        characterOptions = this.characterOptionsExtractor.extractCharacterOptions(fullText);
      } else {
        // Unknown file - try to extract everything
        cards = this.cardExtractor.extractCards(fullText);
        spells = this.spellExtractor.extractSpells(fullText);
        characterOptions = this.characterOptionsExtractor.extractCharacterOptions(fullText);
      }
      
      const pdfData: PDFData = {
        fileName,
        uploadDate: new Date(),
        extractedData: {
          cards,
          spells,
          characterOptions,
          raw: fullText
        }
      };
      
      // Store the extracted data
      await pdfStorage.storeExtractedData(fileName, pdfData.extractedData);
      
      return pdfData;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  }

  async processAllStoredPDFs(): Promise<PDFData[]> {
    const storedPDFs = await pdfStorage.getAllPDFs();
    const results: PDFData[] = [];
    
    for (const pdf of storedPDFs) {
      try {
        const result = await this.processPDF(pdf.name, pdf.data);
        results.push(result);
      } catch (error) {
        console.error(`Error processing ${pdf.name}:`, error);
      }
    }
    
    return results;
  }

  async getAllCards(): Promise<Card[]> {
    const allCards: Card[] = [];
    const storedPDFs = await pdfStorage.getAllPDFs();
    
    for (const pdf of storedPDFs) {
      const extractedData = await pdfStorage.getExtractedData(pdf.name);
      if (extractedData?.cards) {
        allCards.push(...extractedData.cards);
      }
    }
    
    // Remove duplicates based on card name
    const uniqueCards = Array.from(
      new Map(allCards.map(card => [card.name, card])).values()
    );
    
    return uniqueCards;
  }

  async getAllSpells(): Promise<Spell[]> {
    const allSpells: Spell[] = [];
    const storedPDFs = await pdfStorage.getAllPDFs();
    
    for (const pdf of storedPDFs) {
      const extractedData = await pdfStorage.getExtractedData(pdf.name);
      if (extractedData?.spells) {
        allSpells.push(...extractedData.spells);
      }
    }
    
    // Remove duplicates based on spell name
    const uniqueSpells = Array.from(
      new Map(allSpells.map(spell => [spell.name, spell])).values()
    );
    
    return uniqueSpells;
  }

  async getCharacterOptions() {
    const storedPDFs = await pdfStorage.getAllPDFs();
    const mergedOptions = {
      races: new Set<string>(),
      classes: new Set<string>(),
      backgrounds: new Set<string>(),
      startingEquipment: [],
      classFeatures: {}
    };
    
    for (const pdf of storedPDFs) {
      const extractedData = await pdfStorage.getExtractedData(pdf.name);
      if (extractedData?.characterOptions) {
        const options = extractedData.characterOptions;
        
        options.races?.forEach(race => mergedOptions.races.add(race));
        options.classes?.forEach(cls => mergedOptions.classes.add(cls));
        options.backgrounds?.forEach(bg => mergedOptions.backgrounds.add(bg));
        
        if (options.startingEquipment) {
          mergedOptions.startingEquipment.push(...options.startingEquipment);
        }
        
        if (options.classFeatures) {
          Object.assign(mergedOptions.classFeatures, options.classFeatures);
        }
      }
    }
    
    return {
      races: Array.from(mergedOptions.races),
      classes: Array.from(mergedOptions.classes),
      backgrounds: Array.from(mergedOptions.backgrounds),
      startingEquipment: mergedOptions.startingEquipment,
      classFeatures: mergedOptions.classFeatures
    };
  }
}

export const pdfProcessingService = new PDFProcessingService();