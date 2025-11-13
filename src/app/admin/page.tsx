'use client'

import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'

interface Section {
  id: string
  name: string
  description?: string
  type: 'FIXED' | 'CUSTOM' | 'MENU'
  order: number
  _count: {
    items: number
  }
}


interface MenuItem {
  id: string
  name: string
  href: string
  icon: string
  order: number
  isActive: boolean
}

interface Item {
  id: string
  title: string
  content: string
  tags: string[]
  sectionId: string
  categoryId?: string
  section: Section
  category?: Category
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração</h1>
            <p className="text-gray-600">Gerencie o conteúdo da base de conhecimento</p>
          </div>

          {/* Gerenciar Seções */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Gerenciar Sistema</h2>
              <div className="flex items-center gap-2">
                <a
                  href="/admin/sections"
                  className="inline-flex items-center px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar tipos de seção"
                >
                  🎨 Tipos de Seção
                </a>
                <a
                  href="/admin/gerenciarsecoes"
                  className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                >
                  📂 Gerenciar Seções
                </a>
                <a
                  href="/admin/itenssecoes"
                  className="inline-flex items-center px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar itens das seções"
                >
                  📝 Itens das Seções
                </a>
                <a
                  href="/admin/categorias"
                  className="inline-flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors gap-1"
                  title="Gerenciar categorias"
                >
                  🏷️ Categorias
                </a>
              </div>
            </div>

            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚙️</div>
              <p className="text-gray-600 mb-4">Use os botões acima para acessar as páginas de configuração</p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>🎨 <strong>Tipos de Seção</strong>: Configurar categorias e grupos de seções</p>
                <p>📂 <strong>Gerenciar Seções</strong>: Criar, editar e organizar seções</p>
                <p>📝 <strong>Itens das Seções</strong>: Adicionar, editar e organizar conteúdo das seções</p>
                <p>🏷️ <strong>Categorias</strong>: Gerenciar categorias para organizar itens</p>
              </div>
            </div>
          </div>



        </div>
      </main>
    </div>
  )
}
