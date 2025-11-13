'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '../../../../../components/Sidebar'

interface TeamMember {
  id: string
  name: string
  email: string
  position?: string
  department?: string
  phone?: string
  isActive: boolean
  joinDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Team {
  id: string
  name: string
  slug: string
  description?: string
}

export default function TeamMembersPage() {
  const params = useParams()
  const teamSlug = params.slug as string
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    phone: '',
    notes: '',
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (teamSlug) {
      loadTeam()
      loadMembers()
    }
  }, [teamSlug])

  const loadTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data)
      }
    } catch (error) {
      console.error('Erro ao carregar team:', error)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      position: '',
      department: '',
      phone: '',
      notes: '',
      isActive: true
    })
    setEditingMember(null)
    setShowForm(false)
  }

  const openEditForm = (member: TeamMember) => {
    setFormData({
      name: member.name,
      email: member.email,
      position: member.position || '',
      department: member.department || '',
      phone: member.phone || '',
      notes: member.notes || '',
      isActive: member.isActive
    })
    setEditingMember(member)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingMember
        ? `/api/teams/${teamSlug}/members/${editingMember.id}`
        : `/api/teams/${teamSlug}/members`

      const method = editingMember ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        resetForm()
        loadMembers()
        alert(editingMember ? 'Membro atualizado com sucesso!' : 'Membro adicionado com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
      alert('Erro ao salvar membro')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Tem certeza que deseja excluir o membro ${member.name}?`)) return

    try {
      const response = await fetch(`/api/teams/${teamSlug}/members/${member.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadMembers()
        alert('Membro excluído com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao excluir membro:', error)
      alert('Erro ao excluir membro')
    }
  }

  const toggleStatus = async (member: TeamMember) => {
    try {
      const response = await fetch(`/api/teams/${teamSlug}/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...member,
          isActive: !member.isActive
        })
      })

      if (response.ok) {
        loadMembers()
        alert(`Membro ${member.isActive ? 'desativado' : 'ativado'} com sucesso!`)
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao alterar status do membro:', error)
      alert('Erro ao alterar status do membro')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Team não encontrado</h1>
            <p className="text-gray-600">O team "{teamSlug}" não existe ou não está disponível.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <a
                href={`/team/${teamSlug}/admin`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar para Admin
              </a>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Membros do Team - {team.name}
            </h1>
            <p className="text-gray-600">
              Gerencie os membros do team {team.name}
            </p>
            <div className="mt-2 text-sm text-blue-600 font-medium">
              Team: {team.slug}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Membros ({members.length})
                </h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 gap-2"
                >
                  <span>➕</span>
                  Adicionar Membro
                </button>
              </div>
            </div>

            {/* Members List */}
            {members.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum membro encontrado
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Este team ainda não possui membros cadastrados.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {members.map((member) => (
                  <div key={member.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {member.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {member.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>📧 {member.email}</div>
                          {member.position && <div>💼 {member.position}</div>}
                          {member.department && <div>🏢 {member.department}</div>}
                          {member.phone && <div>📞 {member.phone}</div>}
                        </div>
                        {member.notes && (
                          <div className="mt-2 text-sm text-gray-500">
                            📝 {member.notes}
                          </div>
                        )}
                        <div className="mt-2 text-xs text-gray-400">
                          Entrada: {new Date(member.joinDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleStatus(member)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                            member.isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {member.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => openEditForm(member)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs font-medium rounded-md transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 text-xs font-medium rounded-md transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingMember ? 'Editar Membro' : 'Adicionar Membro'}
                    </h3>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo/Posição
                      </label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Informações adicionais sobre o membro..."
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                        Membro ativo
                      </label>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Salvando...' : editingMember ? 'Atualizar' : 'Adicionar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}