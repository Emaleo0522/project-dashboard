'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/types/project'
import { getSupabase } from '@/lib/supabase'
import { ArrowLeft, ExternalLink, Github, Globe, Clock, MapPin, Edit2, Monitor, Settings, Upload, Save, X, Database, Shield, LogOut } from 'lucide-react'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import EditProjectModal from './EditProjectModal'
import AssetManager from './AssetManager'
import CredentialsVault from './CredentialsVault'
import { useAuth } from './AuthProvider'

interface ProjectDetailProps {
  projectId: string
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { user, signOut } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showAssetManager, setShowAssetManager] = useState(false)
  const [showCredentialsVault, setShowCredentialsVault] = useState(false)
  const [quickEditMode, setQuickEditMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const updateLastGitUpdate = async (location: 'oficina' | 'casa') => {
    if (!project) return

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
      fetchProject()
    } catch (error) {
      console.error('Error updating git timestamp:', error)
      alert('Error al actualizar la fecha')
    }
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const handleLogoUpdate = (url: string) => {
    setProject(prev => prev ? { ...prev, logo_url: url } : null)
  }

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('es-ES')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Proyecto no encontrado</p>
          <button
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors duration-200 border border-border"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{project.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTypeColor(project.project_type)}`}>
                  {project.project_type === 'both' ? 'Web + App' : project.project_type.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status === 'active' ? 'Activo' : project.status === 'paused' ? 'Pausado' : 'Completado'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg border border-border">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded hover:bg-accent transition-colors duration-200"
                title="Editar proyecto"
              >
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={() => setShowAssetManager(!showAssetManager)}
                className={`p-2 rounded transition-colors duration-200 ${
                  showAssetManager ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'
                }`}
                title="Gestión de assets"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => setQuickEditMode(!quickEditMode)}
                className={`p-2 rounded transition-colors duration-200 ${
                  quickEditMode ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'
                }`}
                title="Modo edición rápida"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowCredentialsVault(!showCredentialsVault)}
                className={`p-2 rounded transition-colors duration-200 ${
                  showCredentialsVault ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'
                }`}
                title="Vault de credenciales"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Quick Edit Panel */}
        {quickEditMode && (
          <div className="bg-card p-4 rounded-lg shadow-sm border border-border mb-6 animate-fadeInScale">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Edición Rápida</h3>
              <button
                onClick={() => setQuickEditMode(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre del proyecto</label>
                <input
                  type="text"
                  value={project.name}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                <select
                  value={project.status}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                >
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                <textarea
                  value={project.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground resize-none"
                  placeholder="Descripción del proyecto..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">URL de GitHub</label>
                <input
                  type="url"
                  value={project.git_url || ''}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">URL del dominio</label>
                <input
                  type="url"
                  value={project.domain_url || ''}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">URL de Supabase</label>
                <input
                  type="url"
                  value={project.supabase_url || ''}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  placeholder="https://proyecto.supabase.co"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" />
                Guardar cambios
              </button>
              <button
                onClick={() => setQuickEditMode(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Project Info */}
          <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            {/* Description */}
            {project.description && (
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-3">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            )}

            {/* Git Activity */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Actividad Git</h2>
              {project.last_git_update ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Última actualización: {formatDate(project.last_git_update)}</span>
                  </div>
                  {project.update_location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Desde: {project.update_location}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No hay actualizaciones registradas</p>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => updateLastGitUpdate('oficina')}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-800/70"
                >
                  Marcar desde Oficina
                </button>
                <button
                  onClick={() => updateLastGitUpdate('casa')}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/70"
                >
                  Marcar desde Casa
                </button>
              </div>
            </div>

            {/* Preview Section */}
            {(project.domain_url || project.vercel_url || project.netlify_url) && (
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Vista Previa</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`p-2 rounded-lg transition-colors duration-200 border border-border ${
                        showPreview ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent text-foreground'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showPreview && (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">Vista en vivo del sitio web:</p>
                      <div className="bg-background rounded-lg border-2 border-border overflow-hidden" style={{ aspectRatio: '16/10' }}>
                        <iframe
                          src={project.domain_url || project.vercel_url || project.netlify_url}
                          className="w-full h-full"
                          title={`Vista previa de ${project.name}`}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Asset Management Section */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Gestión de Assets</h2>
                <button
                  onClick={() => setShowAssetManager(!showAssetManager)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 border border-border text-sm font-medium ${
                    showAssetManager ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent text-foreground'
                  }`}
                >
                  {showAssetManager ? 'Ocultar' : 'Mostrar'} Assets
                </button>
              </div>

              {showAssetManager && (
                <AssetManager
                  projectId={project.id}
                  currentLogo={project.logo_url}
                  onLogoUpdate={handleLogoUpdate}
                  onUpdate={fetchProject}
                />
              )}
            </div>

            {/* Credentials Vault Section */}
            {showCredentialsVault && (
              <CredentialsVault
                projectId={project.id}
                onUpdate={fetchProject}
              />
            )}
          </div>

          {/* Right Column - Links and Assets */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Project Logo */}
            {project.logo_url && (
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Logo</h3>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                    <Image
                      src={project.logo_url}
                      alt={project.name}
                      width={128}
                      height={128}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Project Links */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Enlaces</h3>
              <div className="space-y-3">
                {project.git_url && (
                  <a
                    href={project.git_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Github className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                      Repositorio GitHub
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground ml-auto" />
                  </a>
                )}

                {project.domain_url && (
                  <a
                    href={project.domain_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Globe className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                      Sitio Principal
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground ml-auto" />
                  </a>
                )}

                {project.vercel_url && (
                  <a
                    href={project.vercel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent transition-colors group"
                  >
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                      Vercel Deploy
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground ml-auto" />
                  </a>
                )}

                {project.netlify_url && (
                  <a
                    href={project.netlify_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent transition-colors group"
                  >
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                      Netlify Deploy
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground ml-auto" />
                  </a>
                )}

                {project.supabase_url && (
                  <a
                    href={project.supabase_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Database className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                      Supabase Dashboard
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground ml-auto" />
                  </a>
                )}
              </div>
            </div>

            {/* Project Stats */}
            <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="text-foreground">{formatDate(project.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Actualizado:</span>
                  <span className="text-foreground">{formatDate(project.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="text-foreground">
                    {project.project_type === 'both' ? 'Web + App' : project.project_type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <EditProjectModal
            project={project}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              setShowEditModal(false)
              fetchProject()
            }}
          />
        )}
      </div>
    </div>
  )
}