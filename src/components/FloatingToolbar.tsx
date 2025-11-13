'use client'

import { useEffect, useState, useRef } from 'react'
import ColorPicker from './ColorPicker'
import LinkModal from './LinkModal'

interface FloatingToolbarProps {
  onFormat: (format: string, value?: string) => void
}

interface ToolbarButton {
  id: string
  icon: React.ReactNode
  label: string
  action: string
  value?: string
}

export default function FloatingToolbar({ onFormat }: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState('')
  const [savedRange, setSavedRange] = useState<Range | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorPickerPosition, setColorPickerPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkModalPosition, setLinkModalPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [modalOpenTime, setModalOpenTime] = useState<number>(0)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const colorButtonRef = useRef<HTMLButtonElement>(null)
  const linkButtonRef = useRef<HTMLButtonElement>(null)

  const buttons: ToolbarButton[] = [
    {
      id: 'comment',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.565-.374l-4.78 1.426a1.06 1.06 0 01-1.344-.67l1.426-4.78A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
        </svg>
      ),
      label: 'Comment',
      action: 'comment'
    },
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
      id: 'formula',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9m12 0v6m0 6v-6m0 0L9 5" />
        </svg>
      ),
      label: 'Formula',
      action: 'formula'
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
      icon: <span className="text-sm font-medium">A</span>,
      label: 'Text Color',
      action: 'color'
    }
  ]

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleSelectionChange = () => {
      // Pequeno delay para garantir que a seleção está estável
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        // Se há modais abertos ou foram abertos recentemente, não interferir
        const timeSinceModalOpen = Date.now() - modalOpenTime
        if ((showColorPicker || showLinkModal) || timeSinceModalOpen < 500) {
          return
        }

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) {
          setIsVisible(false)
          return
        }

        const range = selection.getRangeAt(0)
        const text = selection.toString().trim()

        if (text.length === 0) {
          setIsVisible(false)
          return
        }

        // Verificar se a seleção está dentro de um elemento editável
        const container = range.commonAncestorContainer
        const parentElement = container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : container as Element

        // Verificar se está em elementos que não devem ter toolbar
        const forbiddenElements = parentElement?.closest('input[type="text"], input[type="password"], input[type="email"], textarea:not([contenteditable]), select, button:not([contenteditable]), [role="button"], .no-floating-toolbar')

        if (forbiddenElements) {
          console.log('FloatingToolbar: Blocked by forbidden element:', forbiddenElements.tagName)
          setIsVisible(false)
          return
        }

        // Ser permissivo - permitir FloatingToolbar em qualquer texto selecionado, exceto elementos proibidos
        console.log('FloatingToolbar: Allowing text selection in:', {
          tagName: parentElement?.tagName,
          className: parentElement?.className,
          contentEditable: parentElement?.getAttribute('contenteditable')
        })

        setSelectedText(text)


        // Salvar o range atual para usar posteriormente
        setSavedRange(range.cloneRange())

        // Calcular posição do toolbar
        const rect = range.getBoundingClientRect()


        // Dimensões do toolbar
        const toolbarWidth = 340
        const toolbarHeight = 44
        const margin = 10

        // Posição horizontal centrada na seleção
        let x = rect.left + (rect.width / 2)

        // Ajustar se sair da tela horizontalmente
        const halfToolbarWidth = toolbarWidth / 2
        if (x - halfToolbarWidth < margin) {
          x = margin + halfToolbarWidth
        } else if (x + halfToolbarWidth > window.innerWidth - margin) {
          x = window.innerWidth - margin - halfToolbarWidth
        }

        // Posição vertical - tentar colocar acima da seleção
        let y = rect.top - toolbarHeight - 10

        // Se não caber acima da viewport visível, colocar abaixo
        if (y < margin) {
          y = rect.bottom + 10
        }

        // Se ainda sair da tela por baixo, forçar para cima (mas nunca acima do viewport)
        if (y + toolbarHeight > window.innerHeight - margin) {
          y = Math.max(margin, rect.top - toolbarHeight - 10)
        }

        // Garantir que nunca fique fora da viewport
        y = Math.max(margin, Math.min(y, window.innerHeight - toolbarHeight - margin))


        setPosition({ x, y })

        setIsVisible(true)
      }, 50) // 50ms delay para estabilizar
    }

    const handleMouseUp = (event: MouseEvent) => {
      // Se há modais abertos ou foram abertos recentemente, não fazer NADA
      const timeSinceModalOpen = Date.now() - modalOpenTime
      if ((showColorPicker || showLinkModal) || timeSinceModalOpen < 500) {
        return
      }

      // Se clicou no toolbar, não fazer nada (manter toolbar visível)
      if (toolbarRef.current && toolbarRef.current.contains(event.target as Node)) {
        return
      }

      // Se clicou fora do toolbar, verificar se deve esconder
      setTimeout(() => {
        // Verificar novamente se não há modais abertos ou foram abertos recentemente
        const timeSinceModalOpen = Date.now() - modalOpenTime
        if ((showColorPicker || showLinkModal) || timeSinceModalOpen < 500) {
          return
        }

        const selection = window.getSelection()
        if (!selection || selection.toString().trim() === '') {
          setIsVisible(false)
        } else {
          handleSelectionChange()
        }
      }, 100)
    }

    // Usar múltiplos eventos para capturar seleção de forma mais robusta
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('keyup', handleSelectionChange)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('keyup', handleSelectionChange)
    }
  }, [showColorPicker, showLinkModal, modalOpenTime])

  const handleButtonClick = (button: ToolbarButton) => {
    // Usar o range salvo se disponível, senão obter da seleção atual
    const selection = window.getSelection()
    let rangeToUse = savedRange

    if (!rangeToUse && selection && selection.rangeCount > 0) {
      rangeToUse = selection.getRangeAt(0).cloneRange()
    }

    if (!rangeToUse) {
      console.warn('Nenhum range disponível para formatação')
      return
    }

    const textToFormat = rangeToUse.toString()

    if (button.action === 'comment') {
      alert(`Comentar: "${textToFormat}"`)
      return
    }

    if (button.action === 'link') {
      if (toolbarRef.current) {
        const toolbarRect = toolbarRef.current.getBoundingClientRect()

        // Posicionar diretamente abaixo do toolbar, centralizado
        setLinkModalPosition({
          x: toolbarRect.left + toolbarRect.width / 2,
          y: toolbarRect.bottom + 5
        })
      }
      setModalOpenTime(Date.now())
      setShowLinkModal(true)
      return
    }

    if (button.action === 'color') {
      if (toolbarRef.current) {
        const toolbarRect = toolbarRef.current.getBoundingClientRect()

        // Posicionar diretamente abaixo do toolbar, centralizado
        setColorPickerPosition({
          x: toolbarRect.left + toolbarRect.width / 2,
          y: toolbarRect.bottom + 5
        })
      }
      setModalOpenTime(Date.now())
      setShowColorPicker(true)
      return
    }

    // Para formatações simples
    restoreSelectionAndFormat(rangeToUse, button.action)

    // Esconder toolbar após aplicar formatação
    setTimeout(() => setIsVisible(false), 150)
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

  const handleColorSelect = (color: string, type: 'text' | 'background') => {
    if (savedRange) {
      if (type === 'text') {
        restoreSelectionAndFormat(savedRange, 'color', color)
      } else {
        restoreSelectionAndFormat(savedRange, 'backgroundColor', color)
      }
    }
    setShowColorPicker(false)
    setTimeout(() => setIsVisible(false), 150)
  }

  const handleCloseColorPicker = () => {
    setShowColorPicker(false)
    setModalOpenTime(0) // Reset do tempo de modal
  }

  const handleLinkSubmit = (url: string) => {
    if (savedRange) {
      restoreSelectionAndFormat(savedRange, 'link', url)
    }
    setShowLinkModal(false)
    setTimeout(() => setIsVisible(false), 150)
  }

  const handleCloseLinkModal = () => {
    setShowLinkModal(false)
    setModalOpenTime(0) // Reset do tempo de modal
  }

  if (!isVisible) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 px-1 flex items-center gap-1 transition-opacity duration-200 animate-in slide-in-from-bottom-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
    >
      {buttons.map((button, index) => (
        <div key={button.id} className="flex items-center">
          <button
            ref={button.id === 'color' ? colorButtonRef : button.id === 'link' ? linkButtonRef : undefined}
            onClick={() => handleButtonClick(button)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
            title={button.label}
            type="button"
          >
            {button.icon}
          </button>
          {index < buttons.length - 1 && index === 0 && (
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
          )}
          {index < buttons.length - 1 && index === 6 && (
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
          )}
        </div>
      ))}

      <div className="ml-2 flex items-center gap-1">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
          title="Mais opções"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

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