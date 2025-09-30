'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types/project'
import { getSupabase } from '@/lib/supabase'
import { X } from 'lucide-react'
import ImageUpload from './ImageUpload'

interface EditProjectModalProps {
  project: Project
  onClose: () => void
  onSuccess: () => void
}

export default function EditProjectModal({ project, onClose, onSuccess }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    git_url: '',
    domain_url: '',
    vercel_url: '',
    netlify_url: '',
    supabase_url: '',
    logo_url: '',
    project_type: 'web' as 'web' | 'app' | 'both',
    status: 'active' as 'active' | 'paused' | 'completed'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setFormData({
      name: project.name || '',
      description: project.description || '',
      git_url: project.git_url || '',
      domain_url: project.domain_url || '',
      vercel_url: project.vercel_url || '',
      netlify_url: project.netlify_url || '',
      supabase_url: project.supabase_url || '',
      logo_url: project.logo_url || '',
      project_type: project.project_type,
      status: project.status
    })
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const supabase = getSupabase()
      const { error } = await supabase
        .from('projects')
        .update({
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          git_url: formData.git_url.trim() || null,
          domain_url: formData.domain_url.trim() || null,
          vercel_url: formData.vercel_url.trim() || null,
          netlify_url: formData.netlify_url.trim() || null,
          supabase_url: formData.supabase_url.trim() || null,
          logo_url: formData.logo_url.trim() || null
        })
        .eq('id', project.id)

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error al actualizar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg border border-border">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Editar Proyecto</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="Mi Proyecto Genial"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Proyecto
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
              >
                <option value="web">Web</option>
                <option value="app">App</option>
                <option value="both">Web + App</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground resize-none"
              placeholder="Una breve descripción del proyecto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
            </select>
          </div>

          {/* URLs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Enlaces</h3>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL de GitHub
              </label>
              <input
                type="url"
                name="git_url"
                value={formData.git_url}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="https://github.com/usuario/proyecto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Dominio Principal
              </label>
              <input
                type="url"
                name="domain_url"
                value={formData.domain_url}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                placeholder="https://miproyecto.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL de Vercel
                </label>
                <input
                  type="url"
                  name="vercel_url"
                  value={formData.vercel_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  placeholder="https://proyecto.vercel.app"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL de Netlify
                </label>
                <input
                  type="url"
                  name="netlify_url"
                  value={formData.netlify_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  placeholder="https://proyecto.netlify.app"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  URL de Supabase
                </label>
                <input
                  type="url"
                  name="supabase_url"
                  value={formData.supabase_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  placeholder="https://proyecto.supabase.co"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Logo del Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                label="Subir Logo"
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, logo_url: url }))}
                currentImage={formData.logo_url}
              />
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  O pegar URL del Logo
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}