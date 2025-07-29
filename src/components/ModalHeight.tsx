import React, { useState } from 'react';

interface ModalHeightProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalHeight: React.FC<ModalHeightProps> = ({ isOpen, onClose }) => {
    const [height, setHeight] = useState<string>('');

    const handleSave = () => {
        const heightValue = height.trim() === '' ? '1.7' : height;
        localStorage.setItem('userHeight', heightValue);
        onClose();
    };

    const handleClose = () => {
        const heightValue = height.trim() === '' ? '1.7' : height;
        localStorage.setItem('userHeight', heightValue);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 max-w-md">
                <h2 className="text-xl font-bold mb-4 text-black text-center">Personalize sua experiência</h2>

                <div className="mb-4">
                    <label htmlFor="height" className="block text-sm font-medium mb-2 text-black">
                        Altura (metros)
                    </label>
                    <input
                        type="number"
                        id="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="1.7"
                        step="0.01"
                        min="0.5"
                        max="3.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Salvar
                    </button>
                    <button
                        onClick={handleClose}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalHeight;