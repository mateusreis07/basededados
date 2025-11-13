'use client'

import { useCallback } from 'react'

export function useTextFormatting() {
  const applyFormatting = useCallback((format: string, value?: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString()

    if (!selectedText) return

    let formattedText = ''

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `<u>${selectedText}</u>`
        break
      case 'strikethrough':
        formattedText = `~~${selectedText}~~`
        break
      case 'code':
        formattedText = `\`${selectedText}\``
        break
      case 'link':
        formattedText = value ? `[${selectedText}](${value})` : `[${selectedText}]()`
        break
      case 'color':
        formattedText = value ? `<span style="color: ${value}">${selectedText}</span>` : selectedText
        break
      case 'backgroundColor':
        formattedText = value ? `<span style="background-color: ${value}; padding: 1px 2px; border-radius: 2px">${selectedText}</span>` : selectedText
        break
      default:
        formattedText = selectedText
    }

    // Substituir o texto selecionado pelo texto formatado
    try {
      range.deleteContents()
      const textNode = document.createTextNode(formattedText)
      range.insertNode(textNode)

      // Limpar seleção
      selection.removeAllRanges()

      // Disparar evento de mudança se necessário
      const event = new Event('input', { bubbles: true })
      const container = range.commonAncestorContainer
      const element = container.nodeType === Node.TEXT_NODE
        ? container.parentElement
        : container as Element

      element?.dispatchEvent(event)

    } catch (error) {
      console.error('Erro ao aplicar formatação:', error)

      // Fallback: usar execCommand se disponível
      try {
        switch (format) {
          case 'bold':
            document.execCommand('bold', false)
            break
          case 'italic':
            document.execCommand('italic', false)
            break
          case 'underline':
            document.execCommand('underline', false)
            break
          case 'strikethrough':
            document.execCommand('strikeThrough', false)
            break
          default:
            // Para outros formatos, copiar para clipboard
            navigator.clipboard?.writeText(formattedText)
        }
      } catch (execError) {
        console.error('Erro no fallback:', execError)
      }
    }
  }, [])

  // Função para verificar se o texto selecionado já tem uma formatação específica
  const isAlreadyFormatted = (range: Range, format: string): HTMLElement | null => {
    const container = range.commonAncestorContainer
    let element = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element

    // Mapeamento de formatos para tags HTML
    const formatTags: { [key: string]: string[] } = {
      'bold': ['STRONG', 'B'],
      'italic': ['EM', 'I'],
      'underline': ['U'],
      'strikethrough': ['S', 'STRIKE', 'DEL'],
      'code': ['CODE']
    }

    const tagsToCheck = formatTags[format] || []

    // Verificar se a seleção está dentro de uma tag do formato específico
    while (element && element !== range.commonAncestorContainer.parentElement?.closest('[contenteditable="true"]')) {
      if (tagsToCheck.includes(element.tagName)) {
        return element as HTMLElement
      }
      element = element.parentElement
    }

    return null
  }

  // Função para remover formatação específica
  const removeFormatting = (element: HTMLElement) => {
    // Substituir o elemento formatado apenas pelo seu conteúdo de texto
    const textContent = element.textContent || ''
    const textNode = document.createTextNode(textContent)
    element.parentNode?.replaceChild(textNode, element)
  }

  // Nova função para formatação rica (HTML direto)
  const applyRichFormatting = useCallback((format: string, value?: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      console.warn('Nenhuma seleção encontrada para formatação')
      return
    }

    const selectedText = selection.toString()
    if (!selectedText) {
      console.warn('Texto selecionado vazio')
      return
    }

    // Verificar se estamos em um elemento contentEditable
    const range = selection.getRangeAt(0)
    const container = range.commonAncestorContainer
    const editableElement = container.nodeType === Node.TEXT_NODE
      ? container.parentElement?.closest('[contenteditable="true"]')
      : (container as Element)?.closest('[contenteditable="true"]')

    if (!editableElement) {
      // Se não estiver em modo de edição, usar formatação markdown
      applyFormatting(format, value)
      return
    }

    try {
      // Verificar se já está formatado (apenas para formatos que podem ser toggled)
      const toggleableFormats = ['bold', 'italic', 'underline', 'strikethrough', 'code']

      if (toggleableFormats.includes(format)) {
        const existingElement = isAlreadyFormatted(range, format)

        if (existingElement) {
          // Se já está formatado, remover a formatação
          removeFormatting(existingElement)

          // Disparar evento de input para atualizar o estado do componente
          const inputEvent = new Event('input', { bubbles: true })
          editableElement.dispatchEvent(inputEvent)
          return
        }
      }

      // Se não está formatado ou é um formato que não pode ser toggled, aplicar formatação
      let htmlElement: HTMLElement | null = null

      switch (format) {
        case 'bold':
          htmlElement = document.createElement('strong')
          break
        case 'italic':
          htmlElement = document.createElement('em')
          break
        case 'underline':
          htmlElement = document.createElement('u')
          break
        case 'strikethrough':
          htmlElement = document.createElement('s')
          break
        case 'code':
          // Para código com quebras de linha, usar <pre><code>
          if (selectedText.includes('\n')) {
            htmlElement = document.createElement('pre')
            const codeElement = document.createElement('code')
            codeElement.className = 'font-mono text-sm'
            codeElement.textContent = selectedText
            htmlElement.appendChild(codeElement)
            htmlElement.className = 'bg-gray-100 p-3 rounded-lg border overflow-x-auto whitespace-pre'
          } else {
            // Para código inline, usar apenas <code>
            htmlElement = document.createElement('code')
            htmlElement.className = 'bg-gray-200 px-1 py-0.5 rounded text-sm font-mono'
          }
          break
        case 'link':
          if (value) {
            // Para links, usar formato Markdown para compatibilidade com renderFormattedContent
            const markdownLink = `[${selectedText}](${value})`
            const textNode = document.createTextNode(markdownLink)

            range.deleteContents()
            range.insertNode(textNode)

            // Colocar cursor após o link inserido
            const newRange = document.createRange()
            newRange.setStartAfter(textNode)
            newRange.setEndAfter(textNode)

            selection.removeAllRanges()
            selection.addRange(newRange)

            // Disparar evento de input para atualizar o estado do componente
            const inputEvent = new Event('input', { bubbles: true })
            editableElement.dispatchEvent(inputEvent)
            return // Sair aqui para não processar o HTML element padrão
          }
          break
        case 'color':
          if (value) {
            htmlElement = document.createElement('span')
            htmlElement.style.color = value
          }
          break
        case 'backgroundColor':
          if (value) {
            htmlElement = document.createElement('span')
            htmlElement.style.backgroundColor = value
            htmlElement.style.padding = '1px 2px'
            htmlElement.style.borderRadius = '2px'
          }
          break
        default:
          console.warn('Formato não reconhecido:', format)
          return
      }

      if (htmlElement) {
        // Para elementos que não são <pre> (que já tem o texto definido)
        if (htmlElement.tagName !== 'PRE') {
          htmlElement.textContent = selectedText
        }

        // Substituir conteúdo da seleção
        range.deleteContents()
        range.insertNode(htmlElement)

        // Colocar cursor após o elemento inserido
        const newRange = document.createRange()
        newRange.setStartAfter(htmlElement)
        newRange.setEndAfter(htmlElement)

        selection.removeAllRanges()
        selection.addRange(newRange)

        // Disparar evento de input para atualizar o estado do componente
        const inputEvent = new Event('input', { bubbles: true })
        editableElement.dispatchEvent(inputEvent)
      }

    } catch (error) {
      console.error('Erro ao aplicar formatação rica:', error)
      // Fallback para formatação markdown
      applyFormatting(format, value)
    }
  }, [applyFormatting])

  return { applyFormatting, applyRichFormatting }
}