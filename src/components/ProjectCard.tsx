'use client'

import { useState } from 'react'
import { Project } from '@/types/project'
import { getSupabase } from '@/lib/supabase'
import { ExternalLink, Edit2, Trash2, Github, Globe, Clock, MapPin, Eye, Database } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import EditProjectModal from './EditProjectModal'

interface ProjectCardProps {
  project: Project
  onUpdate: () => void
}

export default function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const [showEditModal, setShowEditModal] = useState(false)
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'web': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      case 'app': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      case 'both': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return

    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto')
    }
  }

  const updateLastGitUpdate = async (location: 'oficina' | 'casa') => {
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('projects')
        .update({
          last_git_update: new Date().toISOString(),
          update_location: location
        })
        .eq('id', project.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error updating git timestamp:', error)
      alert('Error al actualizar la fecha')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('es-ES')
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border card-hover group animate-fadeInUp">
      {/* Project Image/Logo */}
      <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/70 dark:to-purple-950/70 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        {project.logo_url ? (
          <div className="relative max-h-32 max-w-32">
            <Image
              src={project.logo_url}
              alt={project.name}
              width={128}
              height={128}
              className="max-h-32 max-w-32 object-contain"
            />
          </div>
        ) : (
          <div className="text-4xl font-bold text-muted-foreground">
            {project.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Overlay for hover effect */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/proyecto/${project.id}`)
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transform transition-transform"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-foreground truncate">{project.name}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
        )}

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(project.project_type)}`}>
            {project.project_type === 'both' ? 'Web + App' : project.project_type.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status === 'active' ? 'Activo' : project.status === 'paused' ? 'Pausado' : 'Completado'}
          </span>
        </div>

        {/* Git Info */}
        {project.last_git_update && (
          <div className="bg-muted rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-3 h-3" />
              <span>Última actualización: {formatDate(project.last_git_update)}</span>
            </div>
            {project.update_location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>Desde: {project.update_location}</span>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateLastGitUpdate('oficina')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/70"
              >
                Marcar desde Oficina
              </button>
              <button
                onClick={() => updateLastGitUpdate('casa')}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/70"
              >
                Marcar desde Casa
              </button>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="space-y-2">
          {project.git_url && (
            <a
              href={project.git_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="truncate">GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {project.domain_url && (
            <a
              href={project.domain_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="truncate">Dominio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {project.vercel_url && (
            <a
              href={project.vercel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">Vercel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {project.netlify_url && (
            <a
              href={project.netlify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">Netlify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {project.supabase_url && (
            <a
              href={project.supabase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Database className="w-4 h-4" />
              <span className="truncate">Supabase</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false)
            onUpdate()
          }}
        />
      )}
    </div>
  )
}