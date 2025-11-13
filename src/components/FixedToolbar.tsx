'use client'

import { useEffect, useState, useRef } from 'react'
import ColorPicker from './ColorPicker'
import LinkModal from './LinkModal'

interface FixedToolbarProps {
  onFormat: (format: string, value?: string) => void
}

interface ToolbarButton {
  id: string
  icon: React.ReactNode
  label: string
  action: string
  value?: string
}

export default function FixedToolbar({ onFormat }: FixedToolbarProps) {
  const [activeFormats, setActiveFormats] = useState<string[]>([])
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorPickerPosition, setColorPickerPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkModalPosition, setLinkModalPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [savedRange, setSavedRange] = useState<Range | null>(null)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const linkButtonRef = useRef<HTMLButtonElement>(null)

  // Verificar quais formatações estão ativas na seleção atual
  const checkActiveFormats = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setActiveFormats([])
      return
    }

    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    let element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element

    const active: string[] = []
    const formatTags: { [key: string]: string[] } = {
      'bold': ['STRONG', 'B'],
      'italic': ['EM', 'I'],
      'underline': ['U'],
      'strikethrough': ['S', 'STRIKE', 'DEL'],
      'code': ['CODE']
    }

    // Verificar se a seleção está dentro de elementos formatados
    while (element && element.closest('[contenteditable="true"]')) {
      Object.keys(formatTags).forEach(format => {
        if (element && formatTags[format].includes(element.tagName) && !active.includes(format)) {
          active.push(format)
        }
      })

      element = element.parentElement
      if (!element) break
    }

    setActiveFormats(active)
  }

  // Monitorar mudanças na seleção
  useEffect(() => {
    const handleSelectionChange = () => {
      setTimeout(checkActiveFormats, 10) // Pequeno delay para garantir que a seleção está atualizada
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('click', handleSelectionChange)
    document.addEventListener('keyup', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('click', handleSelectionChange)
      document.removeEventListener('keyup', handleSelectionChange)
    }
  }, [])

  const buttons: ToolbarButton[] = [
    {
      id: 'bold',
      icon: <span className="font-bold text-sm">B</span>,
      label: 'Bold',
      action: 'bold'
    },
    {
      id: 'italic',
      icon: <span className="italic font-medium text-sm">I</span>,
      label: 'Italic',
      action: 'italic'
    },
    {
      id: 'underline',
      icon: <span className="underline font-medium text-sm">U</span>,
      label: 'Underline',
      action: 'underline'
    },
    {
      id: 'strikethrough',
      icon: <span className="line-through font-medium text-sm">S</span>,
      label: 'Strikethrough',
      action: 'strikethrough'
    },
    {
      id: 'code',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      label: 'Code',
      action: 'code'
    },
    {
      id: 'link',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      label: 'Link',
      action: 'link'
    },
    {
      id: 'color',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9m12 0v6m0 6v-6m0 0L9 5" />
        </svg>
      ),
      label: 'Text Color',
      action: 'color'
    }
  ]

  const handleButtonClick = (button: ToolbarButton) => {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0 || selection.toString() === '') {
      alert('Selecione um texto primeiro para aplicar a formatação.')
      return
    }

    if (button.action === 'link') {
      setSelectedText(selection.toString())
      // Salvar o range da seleção atual
      setSavedRange(selection.getRangeAt(0).cloneRange())
      if (linkButtonRef.current) {
        const rect = linkButtonRef.current.getBoundingClientRect()
        setLinkModalPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10
        })
      }
      setShowLinkModal(true)
      return
    }

    if (button.action === 'color') {
      // Salvar o range da seleção atual para o ColorPicker também
      setSavedRange(selection.getRangeAt(0).cloneRange())
      if (colorButtonRef.current) {
        const rect = colorButtonRef.current.getBoundingClientRect()
        setColorPickerPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10
        })
      }
      setShowColorPicker(true)
      return
    }

    onFormat(button.action)
    // Após aplicar formatação, verificar novamente os formatos ativos
    setTimeout(checkActiveFormats, 50)
  }

  const handleColorSelect = (color: string, type: 'text' | 'background') => {
    if (!savedRange) {
      alert('Selecione um texto primeiro para aplicar a formatação.')
      setShowColorPicker(false)
      return
    }

    if (type === 'text') {
      restoreSelectionAndFormat(savedRange, 'color', color)
    } else {
      restoreSelectionAndFormat(savedRange, 'backgroundColor', color)
    }

    setShowColorPicker(false)
    setTimeout(checkActiveFormats, 50)
  }

  const handleCloseColorPicker = () => {
    setShowColorPicker(false)
  }

  const restoreSelectionAndFormat = (range: Range, format: string, value?: string) => {
    // Restaurar a seleção
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)

      // Aplicar formatação imediatamente
      onFormat(format, value)
    }
  }

  const handleLinkSubmit = (url: string) => {
    if (!savedRange) {
      alert('Selecione um texto primeiro para aplicar o link.')
      setShowLinkModal(false)
      return
    }

    restoreSelectionAndFormat(savedRange, 'link', url)
    setShowLinkModal(false)
    setTimeout(checkActiveFormats, 50)
  }

  const handleCloseLinkModal = () => {
    setShowLinkModal(false)
  }

  return (
    <div className="flex items-center gap-1 p-2 bg-white border-2 border-blue-500 border-b-0 rounded-t-lg">
      {buttons.map((button, index) => {
        const isActive = activeFormats.includes(button.action)
        return (
          <div key={button.id} className="flex items-center">
            <button
              ref={button.id === 'color' ? colorButtonRef : button.id === 'link' ? linkButtonRef : undefined}
              onClick={() => handleButtonClick(button)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title={`${button.label}${isActive ? ' (Ativo - clique para remover)' : ''}`}
              type="button"
            >
              {button.icon}
            </button>
            {/* Separadores visuais */}
            {(index === 3 || index === 4) && (
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
            )}
          </div>
        )
      })}

      {/* Color Picker */}
      {showColorPicker && (
        <ColorPicker
          onColorSelect={handleColorSelect}
          onClose={handleCloseColorPicker}
          position={colorPickerPosition}
        />
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <LinkModal
          onSubmit={handleLinkSubmit}
          onClose={handleCloseLinkModal}
          selectedText={selectedText}
          position={linkModalPosition}
        />
      )}
    </div>
  )
}