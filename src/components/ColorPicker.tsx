'use client'

import { useState } from 'react'

interface ColorPickerProps {
  onColorSelect: (color: string, type: 'text' | 'background') => void
  onClose: () => void
  position?: { x: number; y: number }
}

const COLOR_PALETTE = [
  '#000000', '#1f2937', '#374151', '#6b7280', '#9ca3af',
  '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb', '#ffffff',
  '#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca',
  '#fed7d7', '#fee2e2', '#fef2f2', '#991b1b', '#7f1d1d',
  '#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa',
  '#ffedd5', '#fff7ed', '#9a3412', '#7c2d12', '#431407',
  '#ca8a04', '#eab308', '#facc15', '#fde047', '#fef08a',
  '#fefce8', '#fffbeb', '#a16207', '#78350f', '#451a03',
  '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0',
  '#dcfce7', '#f0fdf4', '#166534', '#14532d', '#052e16',
  '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a7f3d0',
  '#cffafe', '#ecfeff', '#155e75', '#0e7490', '#083344',
  '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
  '#dbeafe', '#eff6ff', '#1e40af', '#1e3a8a', '#172554',
  '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
  '#ede9fe', '#f5f3ff', '#6d28d9', '#5b21b6', '#2e1065',
  '#c026d3', '#d946ef', '#e879f9', '#f0abfc', '#f5d0fe',
  '#fae8ff', '#fdf4ff', '#a21caf', '#86198f', '#4a044e'
]

export default function ColorPicker({ onColorSelect, onClose, position }: ColorPickerProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'background'>('text')


  const handleColorClick = (color: string) => {
    onColorSelect(color, activeTab)
  }

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />

      {/* Color Picker Modal */}
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80"
        style={position ? {
          left: `${Math.max(10, Math.min(position.x - 160, window.innerWidth - 330))}px`,
          top: `${position.y}px`,
          transform: 'none'
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Selecionar Cor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'text'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔤 Cor do Texto
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === 'background'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎨 Cor de Fundo
          </button>
        </div>

        {/* Color Grid */}
        <div className="grid grid-cols-10 gap-1 mb-4">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              className="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Custom Color Input */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Cor Personalizada
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              onChange={(e) => handleColorClick(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              placeholder="#000000"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value
                  if (value && (value.startsWith('#') || value.match(/^[a-zA-Z]+$/))) {
                    handleColorClick(value)
                  }
                }
              }}
              className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use códigos hex (#ff0000) ou nomes de cores (red). Pressione Enter para aplicar.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleColorClick('transparent')}
              className="flex-1 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              🚫 Remover Cor
            </button>
            {activeTab === 'text' && (
              <button
                onClick={() => handleColorClick('#000000')}
                className="flex-1 px-3 py-2 text-xs text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                ⚫ Padrão
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}