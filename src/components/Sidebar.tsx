'use client'

import { useMemo, memo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '../contexts/SidebarContext'
import { useTeam } from '../contexts/TeamContext'
import { useAuth } from '../contexts/AuthContext'

function Sidebar() {
  const { sections, sectionTypes, loading } = useSidebar()
  const { currentTeam } = useTeam()
  const { logout, team } = useAuth()
  const pathname = usePathname()

  // Memoizar os dados processados para evitar re-renders desnecessários
  const sidebarData = useMemo(() => {
    console.log('Sidebar: Processando dados...')
    console.log('Sidebar: sectionTypes:', sectionTypes)
    console.log('Sidebar: sections:', sections)

    const result = sectionTypes
      .filter(type => type.active)
      .sort((a, b) => a.order - b.order)
      .map((type, index) => {
        // Usar o campo sectionFilter ou fallback para lógica de posição
        const sectionFilter = type.sectionFilter ||
          (index === 0 ? 'MENU' : index === 1 ? 'FIXED' : 'CUSTOM')

        console.log(`Sidebar: Tipo "${type.name}" usando filtro "${sectionFilter}"`)

        const filteredSections = sections.filter(section =>
          section.type === sectionFilter && section.isActive !== false
        )

        console.log(`Sidebar: Encontradas ${filteredSections.length} seções para tipo "${type.name}"`)

        return {
          type,
          sections: filteredSections.sort((a, b) => a.order - b.order)
        }
      })

    console.log('Sidebar: Resultado final:', result)
    // Remover filtro que escondia tipos sem seções - mostrar todos os tipos ativos
    return result
  }, [sections, sectionTypes])


  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto z-50 flex flex-col">
      <div className="p-4">
        <Link href={currentTeam ? `/team/${currentTeam.slug}` : '/'} className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors">
          Base de Conhecimento
        </Link>
      </div>

      <nav className="mt-4 flex-1 px-2">
        {currentTeam && sidebarData.map((item, index) => (
          <div key={item.type.id} className={index > 0 ? "mt-8" : "mt-4"}>
            <div className="px-4 mb-3">
              <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="text-sm">{item.type.icon}</span>
                {item.type.name}
              </h3>
              <div className="mt-1 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
            </div>

            {item.sections.length > 0 ? (
              <ul className="space-y-1 px-1 mb-6">
                {item.sections.map((section) => {
                  if (!currentTeam) return null

                  // Se for a seção "Relatórios", redireciona para /team/[slug]/reports
                  const href = section.name === 'Relatórios'
                    ? `/team/${currentTeam.slug}/reports`
                    : `/team/${currentTeam.slug}/section/${section.id}`
                  const isActive = section.name === 'Relatórios'
                    ? pathname === `/team/${currentTeam.slug}/reports` || pathname.startsWith(`/team/${currentTeam.slug}/reports/`)
                    : pathname === `/team/${currentTeam.slug}/section/${section.id}`

                  return (
                    <li key={section.id}>
                      <Link
                        href={href}
                        className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-md'
                        }`}
                      >
                        <span className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-3 transition-all duration-200 ${
                              isActive ? 'bg-blue-200' : 'group-hover:scale-125'
                            }`}
                            style={{ backgroundColor: isActive ? undefined : item.type.color }}
                          ></span>
                          <span className="truncate">{section.name}</span>
                        </span>
                        {section.name !== 'Relatórios' && (
                          <span className={`text-xs px-2 py-1 rounded-full ml-2 transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-700 text-blue-100'
                              : 'bg-gray-600 text-gray-300 group-hover:bg-gray-600 group-hover:text-white'
                          }`}>
                            {section._count?.items || 0}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-500 italic text-center py-2">
                  Nenhuma seção disponível
                </p>
              </div>
            )}
          </div>
        ))}

        {!currentTeam && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">
              Carregando team...
            </p>
          </div>
        )}
      </nav>

      {/* Configurações e informações do usuário */}
      {team && currentTeam && (
        <div className="border-t border-gray-700 bg-gray-800">
          {/* Botão de Configurações */}
          <div className="p-3">
            <Link
              href={`/team/${currentTeam.slug}/admin`}
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-all duration-200 group"
            >
              <span className="mr-3 text-gray-400 group-hover:text-white transition-colors">⚙️</span>
              <span>Configurações</span>
            </Link>
          </div>

          {/* Informações do usuário e logout */}
          <div className="p-3 pt-1">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {team.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {team.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 rounded-md transition-colors duration-200 font-medium"
                title="Fazer logout"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(Sidebar)