'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import Dashboard from './Dashboard'
import ProjectDetail from './ProjectDetail'
import AssetManager from './AssetManager'
import CredentialsVault from './CredentialsVault'
import { Project } from '@/types/project'
import { getSupabase } from '@/lib/supabase'

interface AppLayoutProps {
  initialSection?: string
  projectId?: string
}

export default function AppLayout({ initialSection = 'dashboard', projectId }: AppLayoutProps) {
  const [currentSection, setCurrentSection] = useState(initialSection)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Si hay projectId, cargar el proyecto y mostrar detalles
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
      setCurrentSection('details')
    }
  }, [projectId]) // fetchProject se define dentro del efecto específico, no necesita dependencia

  const fetchProject = async (id: string) => {
    try {
      setLoading(true)
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setSelectedProject(data)
    } catch (error) {
      console.error('Error fetching project:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleSectionChange = (section: string) => {
    setCurrentSection(section)

    // Si vamos al dashboard desde otra sección, limpiar proyecto seleccionado
    if (section === 'dashboard') {
      setSelectedProject(null)
      router.push('/')
    }
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setCurrentSection('details')
    router.push(`/proyecto/${project.id}`)
  }

  const handleProjectUpdate = () => {
    if (selectedProject) {
      fetchProject(selectedProject.id)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    switch (currentSection) {
      case 'dashboard':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Panel de Desarrollo</h1>
              <p className="text-muted-foreground">Gestiona todos tus proyectos en un solo lugar</p>
            </div>
            <Dashboard onProjectSelect={handleProjectSelect} hideHeader={true} />
          </div>
        )

      case 'details':
        if (!selectedProject) {
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No hay proyecto seleccionado</h3>
                <p className="text-sm">Selecciona un proyecto desde el Dashboard</p>
                <button
                  onClick={() => setCurrentSection('dashboard')}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Ir al Dashboard
                </button>
              </div>
            </div>
          )
        }
        return (
          <div className="p-6">
            <ProjectDetail
              projectId={selectedProject.id}
              hideNavigation={true}
              onUpdate={handleProjectUpdate}
            />
          </div>
        )

      case 'assets':
        if (!selectedProject) {
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecciona un proyecto</h3>
                <p className="text-sm">Los assets se gestionan por proyecto</p>
              </div>
            </div>
          )
        }
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Gestión de Assets</h1>
                <p className="text-muted-foreground">
                  Proyecto: <span className="font-medium">{selectedProject.name}</span>
                </p>
              </div>
              <AssetManager
                projectId={selectedProject.id}
                currentLogo={selectedProject.logo_url}
                onLogoUpdate={(url) => {
                  setSelectedProject(prev => prev ? { ...prev, logo_url: url } : null)
                }}
                onUpdate={handleProjectUpdate}
              />
            </div>
          </div>
        )

      case 'vault':
        if (!selectedProject) {
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecciona un proyecto</h3>
                <p className="text-sm">El vault se gestiona por proyecto</p>
              </div>
            </div>
          )
        }
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Vault de Credenciales</h1>
                <p className="text-muted-foreground">
                  Proyecto: <span className="font-medium">{selectedProject.name}</span>
                </p>
              </div>
              <CredentialsVault
                projectId={selectedProject.id}
                onUpdate={handleProjectUpdate}
              />
            </div>
          </div>
        )

      case 'settings':
        if (!selectedProject) {
          return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Selecciona un proyecto</h3>
                <p className="text-sm">La configuración se gestiona por proyecto</p>
              </div>
            </div>
          )
        }
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Configuración</h1>
                <p className="text-muted-foreground">
                  Proyecto: <span className="font-medium">{selectedProject.name}</span>
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-medium mb-4">Configuración del Proyecto</h3>
                <p className="text-muted-foreground text-sm">
                  Esta sección estará disponible próximamente con opciones avanzadas de configuración.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Sección no encontrada</h3>
              <p className="text-sm">La sección solicitada no existe</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        projectName={selectedProject?.name}
      />

      <main className="flex-1 overflow-auto lg:ml-0 ml-0">
        <div className="min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}