import React, { useState, useEffect } from 'react';
import { useStore } from '../../../services/store';
import { Equipment } from '../types';
import { pdfProcessingService } from '../../../services/pdfProcessingService';

interface EquipmentStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export const EquipmentStep: React.FC<EquipmentStepProps> = ({ onNext, onPrevious }) => {
  const { currentCharacter, updateCurrentCharacter } = useStore();
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [customItem, setCustomItem] = useState({ name: '', quantity: 1, type: 'misc' });

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const options = await pdfProcessingService.getCharacterOptions();
      setAvailableEquipment(options.startingEquipment || []);
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  };

  const currentEquipment = currentCharacter?.equipment || [];

  const addEquipment = (item: Equipment) => {
    const existingIndex = currentEquipment.findIndex(e => e.id === item.id);
    
    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...currentEquipment];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: (updated[existingIndex].quantity || 1) + 1
      };
      updateCurrentCharacter({ equipment: updated });
    } else {
      // Add new item
      updateCurrentCharacter({
        equipment: [...currentEquipment, { ...item, quantity: item.quantity || 1 }]
      });
    }
  };

  const removeEquipment = (itemId: string) => {
    updateCurrentCharacter({
      equipment: currentEquipment.filter(e => e.id !== itemId)
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeEquipment(itemId);
    } else {
      const updated = currentEquipment.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      updateCurrentCharacter({ equipment: updated });
    }
  };

  const addCustomItem = () => {
    if (customItem.name.trim()) {
      const newItem: Equipment = {
        id: `custom-${Date.now()}`,
        name: customItem.name,
        type: customItem.type,
        quantity: customItem.quantity
      };
      addEquipment(newItem);
      setCustomItem({ name: '', quantity: 1, type: 'misc' });
    }
  };

  const getTypeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      weapon: '⚔️',
      armor: '🛡️',
      magic: '✨',
      adventuring: '🎒',
      misc: '📦'
    };
    return icons[type] || '📦';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Equipment</h2>

      {/* Current Equipment */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Your Equipment</h3>
        {currentEquipment.length === 0 ? (
          <p className="text-gray-500 italic">No equipment selected yet.</p>
        ) : (
          <div className="space-y-2">
            {currentEquipment.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getTypeIcon(item.type)}</span>
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.type})</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{item.quantity || 1}</span>
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeEquipment(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Starting Equipment */}
      {availableEquipment.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Starting Equipment</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableEquipment.map(item => (
              <button
                key={item.id}
                onClick={() => addEquipment(item)}
                className="text-left p-2 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="mr-1">{getTypeIcon(item.type)}</span>
                <span className="text-sm">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Item */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Add Custom Item</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={customItem.name}
            onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
            placeholder="Item name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={customItem.type}
            onChange={(e) => setCustomItem({ ...customItem, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="magic">Magic</option>
            <option value="adventuring">Adventuring</option>
            <option value="misc">Misc</option>
          </select>
          <input
            type="number"
            min="1"
            value={customItem.quantity}
            onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value) || 1 })}
            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addCustomItem}
            disabled={!customItem.name.trim()}
            className={`px-4 py-2 rounded-md font-medium ${
              customItem.name.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};