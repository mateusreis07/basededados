'use client'

import { useState, useRef, useEffect } from 'react'

interface EmojiPickerProps {
  value?: string
  onChange: (emoji: string) => void
  placeholder?: string
}

const emojiCategories = {
  'Pessoas': [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
    '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒',
    '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
    '🤬', '🤯', '😳', '🥵', '🥶', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
    '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'
  ],
  'Objetos': [
    '📁', '📂', '📄', '📝', '📊', '📈', '📉', '📋', '📌', '📍', '🔗', '💼', '🎯', '🔧', '⚙️', '🛠️',
    '💡', '🔍', '🔎', '📱', '💻', '🖥️', '⌨️', '🖱️', '🖨️', '📺', '📷', '📹', '🎥', '📞', '☎️', '📠',
    '📧', '✉️', '📩', '📨', '📮', '🗂️', '🗃️', '🗄️', '🗒️', '🗓️', '📅', '📆', '🗑️', '🔒', '🔓', '🔑',
    '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '⭐', '🌟', '✨', '💎', '💍', '👑', '🎁', '🎉', '🎊', '🎈'
  ],
  'Natureza': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵',
    '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦢', '🦅', '🦉', '🦚', '🦜',
    '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🐢', '🐍',
    '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊'
  ],
  'Comida': [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝',
    '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',
    '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭',
    '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣'
  ],
  'Atividades': [
    '🎯', '🎮', '🕹️', '🎰', '🎲', '🧩', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢',
    '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱',
    '🩲', '🩳', '👙', '👚', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡',
    '🩰', '👢', '👑', '👒', '🎩', '🎓', '🧢', '⛑️', '🪖', '💄', '💍', '💎', '🔇', '🔈', '🔉', '🔊'
  ],
  'Símbolos': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈',
    '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️'
  ]
}

const recentEmojis = ['📁', '⭐', '📌', '🎨', '📊', '⚙️', '🔧', '📝']

// Mapeamento para busca por palavras-chave
const emojiKeywords: { [key: string]: string[] } = {
  '📁': ['pasta', 'arquivo', 'documento', 'folder', 'file'],
  '⭐': ['estrela', 'favorito', 'importante', 'star', 'favorite'],
  '📌': ['pin', 'fixo', 'importante', 'marcar', 'push'],
  '🎨': ['arte', 'design', 'criativo', 'personalizado', 'art'],
  '📊': ['gráfico', 'dados', 'relatório', 'estatística', 'chart'],
  '⚙️': ['configuração', 'config', 'ajuste', 'settings'],
  '🔧': ['ferramenta', 'manutenção', 'reparo', 'tool'],
  '📝': ['nota', 'texto', 'escrever', 'note', 'write'],
  '💼': ['trabalho', 'negócio', 'empresa', 'business'],
  '🏠': ['casa', 'home', 'início', 'principal'],
  '📖': ['livro', 'manual', 'guia', 'book', 'guide'],
  '🔍': ['buscar', 'procurar', 'pesquisa', 'search'],
  '💡': ['ideia', 'inovação', 'dica', 'luz', 'idea'],
  '🎯': ['objetivo', 'meta', 'foco', 'target', 'goal'],
  '🚀': ['lançamento', 'rápido', 'foguete', 'rocket'],
  '⚡': ['rápido', 'energia', 'poder', 'lightning'],
  '🔒': ['seguro', 'privado', 'protegido', 'lock'],
  '🌟': ['novo', 'especial', 'destaque', 'brilho'],
  '📚': ['biblioteca', 'coleção', 'livros', 'library'],
  '🏆': ['prêmio', 'sucesso', 'vitória', 'trophy'],
  '❤️': ['amor', 'coração', 'favorito', 'heart', 'love'],
  '🎉': ['celebração', 'festa', 'parabéns', 'party'],
  '🔥': ['quente', 'popular', 'trending', 'fire'],
  '💯': ['perfeito', 'completo', 'cem', 'percent'],
  '👑': ['rei', 'premium', 'especial', 'crown'],
  '🎭': ['teatro', 'arte', 'drama', 'mask'],
  '🎪': ['circo', 'diversão', 'entretenimento', 'circus'],
  '🎮': ['jogo', 'game', 'entretenimento', 'gaming'],
  '🎵': ['música', 'som', 'audio', 'music'],
  '📺': ['vídeo', 'tv', 'mídia', 'television'],
  '📷': ['foto', 'imagem', 'câmera', 'camera'],
  '🌍': ['mundo', 'global', 'internacional', 'world'],
  '⏰': ['tempo', 'hora', 'relógio', 'time', 'clock'],
  '📅': ['calendário', 'data', 'agenda', 'calendar'],
  '💰': ['dinheiro', 'pagamento', 'financeiro', 'money'],
  '🎁': ['presente', 'gift', 'surpresa', 'bonus'],
  '🏃': ['correr', 'rápido', 'ativo', 'running'],
  '🧠': ['cérebro', 'inteligente', 'pensar', 'brain'],
  '🔗': ['link', 'conexão', 'ligação', 'chain']
}

export default function EmojiPicker({ value, onChange, placeholder = "Escolha um emoji" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('Recentes')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji)
    setIsOpen(false)
    setSearchTerm('')
  }

  const getFilteredEmojis = () => {
    let baseEmojis: string[] = []

    if (activeCategory === 'Recentes') {
      baseEmojis = recentEmojis
    } else {
      baseEmojis = emojiCategories[activeCategory as keyof typeof emojiCategories] || []
    }

    if (!searchTerm) {
      return baseEmojis
    }

    // Se há busca, pesquisar em todas as categorias
    const allEmojis = activeCategory === 'Recentes'
      ? recentEmojis
      : [...recentEmojis, ...Object.values(emojiCategories).flat()]

    const searchLower = searchTerm.toLowerCase()

    return allEmojis.filter(emoji => {
      // Buscar por keywords
      const keywords = emojiKeywords[emoji] || []
      return keywords.some(keyword =>
        keyword.toLowerCase().includes(searchLower)
      )
    })
  }

  const categories = ['Recentes', ...Object.keys(emojiCategories)]

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <span className="text-lg">{value || '😀'}</span>
        <span className="text-sm text-gray-500 flex-1">
          {value ? 'Clique para trocar' : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex gap-2 mb-3">
              <span className="text-sm font-medium text-gray-900">Emoji</span>
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setIsOpen(false)
                }}
                className="ml-auto text-xs text-gray-500 hover:text-gray-700"
              >
                Remove
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Categories */}
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {getFilteredEmojis().map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {getFilteredEmojis().length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Nenhum emoji encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}