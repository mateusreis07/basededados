'use client'

import { useState, useRef, useEffect } from 'react'
import { useTextFormatting } from '../hooks/useTextFormatting'
import FixedToolbar from './FixedToolbar'
import FloatingToolbar from './FloatingToolbar'

interface RichTextEditorProps {
  initialContent: string
  onSave: (content: string) => void
  isEditable?: boolean
  className?: string
  keepEditingAfterSave?: boolean
}

export default function RichTextEditor({
  initialContent,
  onSave,
  isEditable = false,
  className = '',
  keepEditingAfterSave = false
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [hasChanges, setHasChanges] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const { applyRichFormatting } = useTextFormatting()

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleEdit = (event?: React.MouseEvent) => {
    if (!isEditing) {
      // Salvar a posição do clique antes de entrar no modo de edição
      const clickPosition = event ? getClickPosition(event) : null
      setIsEditing(true)

      // Usar requestAnimationFrame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        if (editorRef.current && clickPosition !== null) {
          // Restaurar posição do cursor após definir conteúdo
          setCursorPosition(clickPosition)
        }
      })
    }
  }

  const getClickPosition = (event: React.MouseEvent): number => {
    if (!editorRef.current) return 0

    const range = document.caretRangeFromPoint(event.clientX, event.clientY)
    if (!range) return 0

    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    return preCaretRange.toString().length
  }

  const setCursorPosition = (position: number) => {
    if (!editorRef.current) return

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )

    let currentPosition = 0
    let node = walker.nextNode()

    while (node) {
      const nodeLength = node.textContent?.length || 0

      if (currentPosition + nodeLength >= position) {
        const range = document.createRange()
        const selection = window.getSelection()

        range.setStart(node, position - currentPosition)
        range.setEnd(node, position - currentPosition)

        selection?.removeAllRanges()
        selection?.addRange(range)
        break
      }

      currentPosition += nodeLength
      node = walker.nextNode()
    }
  }

  // UseEffect para definir conteúdo quando entrar em modo de edição
  useEffect(() => {
    if (isEditing && editorRef.current) {
      // Definir o conteúdo apenas quando entrar em modo de edição
      const formattedContent = renderFormattedContent(content)
      editorRef.current.innerHTML = formattedContent.__html
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      setHasChanges(false)

      // Só sair do modo de edição se keepEditingAfterSave for false
      if (!keepEditingAfterSave) {
        setIsEditing(false)
      }

      await onSave(newContent)
    }
  }

  const handleCancel = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content
    }
    setHasChanges(false)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  const handleInput = () => {
    setHasChanges(true)
  }

  const renderFormattedContent = (htmlContent: string) => {
    // Se conteúdo já tem HTML, usar diretamente
    if (htmlContent.includes('<') && htmlContent.includes('>')) {
      return { __html: htmlContent }
    }

    // Converter markdown para HTML
    let html = htmlContent

    // **bold** -> <strong>
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // *italic* -> <em>
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')

    // ~~strikethrough~~ -> <s>
    html = html.replace(/~~([^~]+)~~/g, '<s>$1</s>')

    // `code` -> <code> (preservar quebras de linha se existirem)
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      if (code.includes('\n')) {
        return `<pre class="bg-gray-100 p-3 rounded-lg border overflow-x-auto whitespace-pre"><code class="font-mono text-sm">${code}</code></pre>`
      } else {
        return `<code class="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">${code}</code>`
      }
    })

    // [link](url) -> <a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')

    // Com white-space: pre-wrap, não precisamos converter \n para <br>
    // O CSS já preserva as quebras de linha e espaços

    return { __html: html }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar fixa - só aparece quando editando */}
      {isEditing && (
        <FixedToolbar onFormat={applyRichFormatting} />
      )}

      <div
        ref={editorRef}
        className={`min-h-[100px] p-4 transition-all ${
          isEditing
            ? 'bg-white border-2 border-blue-500 focus:outline-none rounded-b-lg border-t-0'
            : 'bg-gray-50 hover:bg-gray-100 cursor-pointer rounded-lg'
        }`}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onClick={isEditable && !isEditing ? (e) => handleEdit(e) : undefined}
        {...(!isEditing && { dangerouslySetInnerHTML: renderFormattedContent(content) })}
        style={{
          outline: 'none',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      />

      {isEditable && !isEditing && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Editar conteúdo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}

      {isEditing && (
        <div className="flex gap-2 mt-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar (Esc)
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Salvar (Ctrl+Enter)
          </button>
        </div>
      )}

      {/* FloatingToolbar para seleção de texto */}
      <FloatingToolbar onFormat={applyRichFormatting} />
    </div>
  )
}