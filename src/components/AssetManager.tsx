'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Upload, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid'
import ProjectImageGallery from './ProjectImageGallery'

interface AssetManagerProps {
  projectId: string
  currentLogo?: string
  onLogoUpdate: (url: string) => void
  onUpdate: () => void
}

export default function AssetManager({ projectId, currentLogo, onLogoUpdate, onUpdate }: AssetManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const uploadFile = async (file: File, type: 'logo' | 'screenshot' | 'background') => {
    try {
      setUploading(true)

      const supabase = getSupabase()
      const fileExt = file.name.split('.').pop()
      const fileName = `${projectId}/${type}/${uuidv4()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName)

      const imageUrl = data.publicUrl

      // Si es logo, actualizar el proyecto directamente
      if (type === 'logo') {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ logo_url: imageUrl })
          .eq('id', projectId)

        if (updateError) throw updateError
        onLogoUpdate(imageUrl)
      } else {
        // Guardar en la tabla de imágenes del proyecto
        const { error: insertError } = await supabase
          .from('project_images')
          .insert({
            project_id: projectId,
            image_url: imageUrl,
            image_type: type
          })

        if (insertError) throw insertError
      }

      onUpdate()
      setRefreshKey(prev => prev + 1) // Forzar refresh de las galerías
      return imageUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (files: FileList | null, type: 'logo' | 'screenshot' | 'background') => {
    if (!files) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo ${file.name} es demasiado grande. Máximo 5MB.`)
        continue
      }
      await uploadFile(file, type)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'screenshot' | 'background') => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files, type)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const generateScreenshot = async (type: 'full' | 'desktop' | 'mobile') => {
    setQuickActionLoading(type)
    try {
      // Simulación de captura de pantalla
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Captura ${type} generada (función de demostración)`)
    } catch (error) {
      console.error('Error generating screenshot:', error)
      alert('Error al generar la captura')
    } finally {
      setQuickActionLoading(null)
    }
  }

  const generateAssets = async () => {
    setQuickActionLoading('assets')
    try {
      // Simulación de generación de assets
      await new Promise(resolve => setTimeout(resolve, 3000))
      alert('Assets generados (función de demostración)')
    } catch (error) {
      console.error('Error generating assets:', error)
      alert('Error al generar assets')
    } finally {
      setQuickActionLoading(null)
    }
  }

  const UploadZone = ({ type, title, description }: {
    type: 'logo' | 'screenshot' | 'background'
    title: string
    description: string
  }) => (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
        dragOver
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="image/*"
        multiple={type !== 'logo'}
        onChange={(e) => handleFileSelect(e.target.files, type)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-full">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Subiendo...
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Gestión de Assets</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Arrastra y suelta imágenes o haz clic para seleccionar archivos
        </p>
      </div>

      {/* Logo Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground">Logo del Proyecto</h4>
          {currentLogo && (
            <a
              href={currentLogo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Ver original
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentLogo && (
            <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
              <Image
                src={currentLogo}
                alt="Logo actual"
                width={120}
                height={120}
                className="max-w-full max-h-32 object-contain"
              />
            </div>
          )}
          <UploadZone
            type="logo"
            title="Actualizar Logo"
            description="PNG, JPG o SVG - Máximo 5MB"
          />
        </div>
      </div>

      {/* Screenshots Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Capturas de Pantalla</h4>
        <UploadZone
          type="screenshot"
          title="Subir Capturas"
          description="Puedes seleccionar múltiples archivos"
        />
        <ProjectImageGallery
          key={`screenshot-${refreshKey}`}
          projectId={projectId}
          type="screenshot"
          title="Capturas Subidas"
        />
      </div>

      {/* Backgrounds Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Fondos e Imágenes</h4>
        <UploadZone
          type="background"
          title="Subir Fondos"
          description="Imágenes de fondo, banners, etc."
        />
        <ProjectImageGallery
          key={`background-${refreshKey}`}
          projectId={projectId}
          type="background"
          title="Fondos Subidos"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <h4 className="font-medium text-foreground mb-3">Acciones Rápidas</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => generateScreenshot('full')}
            disabled={quickActionLoading !== null}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {quickActionLoading === 'full' && <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>}
            Captura Completa
          </button>
          <button
            onClick={() => generateScreenshot('desktop')}
            disabled={quickActionLoading !== null}
            className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {quickActionLoading === 'desktop' && <div className="animate-spin rounded-full h-3 w-3 border-b border-foreground"></div>}
            Solo Desktop
          </button>
          <button
            onClick={() => generateScreenshot('mobile')}
            disabled={quickActionLoading !== null}
            className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {quickActionLoading === 'mobile' && <div className="animate-spin rounded-full h-3 w-3 border-b border-foreground"></div>}
            Solo Móvil
          </button>
          <button
            onClick={generateAssets}
            disabled={quickActionLoading !== null}
            className="px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {quickActionLoading === 'assets' && <div className="animate-spin rounded-full h-3 w-3 border-b border-foreground"></div>}
            Generar Assets
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * Las acciones rápidas son funciones de demostración
        </p>
      </div>
    </div>
  )
}