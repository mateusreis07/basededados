'use client'

import { useState } from 'react'

interface LinkModalProps {
  onSubmit: (url: string, text?: string) => void
  onClose: () => void
  selectedText?: string
  position?: { x: number; y: number }
}

export default function LinkModal({ onSubmit, onClose, selectedText, position }: LinkModalProps) {
  const [url, setUrl] = useState('')
  const [linkText, setLinkText] = useState(selectedText || '')
  const [showAdvanced, setShowAdvanced] = useState(false)


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      alert('URL é obrigatória')
      return
    }

    // Adicionar https:// se não tiver protocolo
    let finalUrl = url.trim()
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = `https://${finalUrl}`
    }

    onSubmit(finalUrl, linkText.trim() || selectedText)
    onClose()
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUrl(value)

    // Auto-preencher texto do link se estiver vazio e a URL for válida
    if (!linkText && value) {
      try {
        const urlObj = new URL(value.includes('://') ? value : `https://${value}`)
        setLinkText(urlObj.hostname.replace('www.', ''))
      } catch {
        // Se não conseguir fazer parse, usar o domínio simples
        const domain = value.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
        setLinkText(domain)
      }
    }
  }

  const quickLinks = [
    { name: 'Google', url: 'https://google.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
    { name: 'MDN Docs', url: 'https://developer.mozilla.org' }
  ]

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-96"
        style={position ? {
          left: `${Math.max(10, Math.min(position.x - 192, window.innerWidth - 394))}px`,
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
          <h3 className="text-lg font-medium text-gray-900">🔗 Adicionar Link</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://exemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Protocolo https:// será adicionado automaticamente se necessário
            </p>
          </div>

          {/* Link Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Link
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder={selectedText || "Texto que aparecerá como link"}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {selectedText && (
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio para usar o texto selecionado: "{selectedText}"
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className={`w-4 h-4 mr-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Links Rápidos
            </button>

            {showAdvanced && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => {
                      setUrl(link.url)
                      setLinkText(link.name)
                    }}
                    className="px-3 py-2 text-sm text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Adicionar Link
            </button>
          </div>
        </form>

        {/* Preview */}
        {url && linkText && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs text-gray-600 mb-1">Preview:</p>
            <a
              href={url.includes('://') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
              onClick={(e) => e.preventDefault()}
            >
              {linkText}
            </a>
          </div>
        )}
      </div>
    </>
  )
}