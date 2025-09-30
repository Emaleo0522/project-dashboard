'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { getSupabase } from '@/lib/supabase'
import ProjectCard from './ProjectCard'
import AddProjectModal from './AddProjectModal'
import { Plus, Search } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'web' | 'app'>('all')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' ||
                       project.project_type === filterType ||
                       project.project_type === 'both'
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Panel de Desarrollo</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gestiona todos tus proyectos web y aplicaciones en un solo lugar</p>
          </div>
          <div className="sm:mt-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <select
            className="px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-colors"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'web' | 'app')}
          >
            <option value="all">Todos los tipos</option>
            <option value="web">Web</option>
            <option value="app">App</option>
          </select>

          {/* Add Project Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 btn-primary text-primary-foreground px-6 py-3 rounded-lg shadow-md font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 animate-fadeInUp">
          <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Total Proyectos</h3>
            <p className="text-2xl md:text-3xl font-bold text-foreground">{projects.length}</p>
          </div>
          <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Proyectos Web</h3>
            <p className="text-2xl md:text-3xl font-bold text-blue-600">
              {projects.filter(p => p.project_type === 'web' || p.project_type === 'both').length}
            </p>
          </div>
          <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Apps</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600">
              {projects.filter(p => p.project_type === 'app' || p.project_type === 'both').length}
            </p>
          </div>
          <div className="bg-card p-4 md:p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow duration-200">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Activos</h3>
            <p className="text-2xl md:text-3xl font-bold text-orange-600">
              {projects.filter(p => p.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterType !== 'all'
                ? 'No se encontraron proyectos con los filtros aplicados'
                : 'No tienes proyectos aún. ¡Crea tu primer proyecto!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                style={{ animationDelay: `${index * 0.1}s` }}
                className="animate-fadeInUp"
              >
                <ProjectCard
                  project={project}
                  onUpdate={fetchProjects}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Project Modal */}
        {showAddModal && (
          <AddProjectModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              fetchProjects()
            }}
          />
        )}
      </div>
    </div>
  )
}