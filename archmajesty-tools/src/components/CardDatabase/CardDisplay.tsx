import React, { useState } from 'react';
import { Card } from '../types';

interface CardDisplayProps {
  card: Card;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({ card }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getColorClass = (color?: string) => {
    if (!color) return 'bg-gray-100 border-gray-300';
    
    const colorMap: { [key: string]: string } = {
      'red': 'bg-red-50 border-red-300',
      'blue': 'bg-blue-50 border-blue-300',
      'green': 'bg-green-50 border-green-300',
      'white': 'bg-gray-50 border-gray-300',
      'black': 'bg-gray-800 border-gray-600 text-white',
      'gold': 'bg-yellow-50 border-yellow-300',
      'purple': 'bg-purple-50 border-purple-300',
    };
    
    return colorMap[color.toLowerCase()] || 'bg-gray-100 border-gray-300';
  };

  return (
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${getColorClass(card.color)}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg">{card.name}</h3>
        {card.cost && (
          <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-medium">
            {card.cost}
          </span>
        )}
      </div>

      {/* Card Type and Keywords */}
      <div className="text-sm text-gray-600 mb-2">
        {card.type && <span className="font-medium">{card.type}</span>}
        {card.keywords && card.keywords.length > 0 && (
          <div className="mt-1">
            {card.keywords.map((keyword, index) => (
              <span 
                key={index} 
                className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs mr-1 mb-1"
              >
                {keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Power/Toughness */}
      {(card.power !== undefined || card.toughness !== undefined) && (
        <div className="text-right text-sm font-bold text-gray-700 mb-2">
          {card.power}/{card.toughness}
        </div>
      )}

      {/* Card Text */}
      <div className={`text-sm ${card.color?.toLowerCase() === 'black' ? 'text-gray-200' : 'text-gray-700'}`}>
        {isExpanded ? (
          <div>
            {card.text || 'No card text available.'}
            {card.rawText && card.rawText !== card.text && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <span className="font-medium">Raw text:</span>
                <pre className="whitespace-pre-wrap text-xs mt-1 font-mono">
                  {card.rawText}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="line-clamp-2">
            {card.text || 'No card text available.'}
          </div>
        )}
      </div>

      {/* Expand/Collapse Indicator */}
      <div className="text-center mt-2">
        <span className="text-xs text-gray-500">
          {isExpanded ? '▲ Click to collapse' : '▼ Click to expand'}
        </span>
      </div>
    </div>
  );
};