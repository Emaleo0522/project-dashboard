'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Image as ImageIcon, X, ExternalLink, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface ProjectImage {
  id: string
  image_url: string
  image_type: 'screenshot' | 'background'
  description?: string
  created_at: string
}

interface ProjectImageGalleryProps {
  projectId: string
  type: 'screenshot' | 'background'
  title: string
}

export default function ProjectImageGallery({ projectId, type, title }: ProjectImageGalleryProps) {
  const [images, setImages] = useState<ProjectImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null)

  const fetchImages = useCallback(async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('image_type', type)
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, type])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const deleteImage = async (imageId: string, imageUrl: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return

    try {
      const supabase = getSupabase()

      // Extraer el nombre del archivo de la URL
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
        // Eliminar del storage
        await supabase.storage
          .from('project-images')
          .remove([fileName])
      }

      // Eliminar de la base de datos
      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error
      fetchImages()
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error al eliminar la imagen')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">{title}</h4>
        <span className="text-sm text-muted-foreground">{images.length} imagen{images.length !== 1 ? 'es' : ''}</span>
      </div>

      {images.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-8 text-center border border-dashed border-border">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No hay {type === 'screenshot' ? 'capturas' : 'fondos'} aún
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Usa el gestor de assets para subir imágenes
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative bg-muted rounded-lg overflow-hidden aspect-video cursor-pointer border border-border hover:border-primary/50 transition-all duration-200"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.image_url}
                alt={image.description || `${type} del proyecto`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteImage(image.id, image.image_url)
                  }}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium">
                  {formatDate(image.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de imagen seleccionada */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-background rounded-lg overflow-hidden">
              <div className="relative w-full h-[60vh]">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.description || `${type} del proyecto`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {selectedImage.description || `${type === 'screenshot' ? 'Captura' : 'Imagen de fondo'} del proyecto`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Subida el {formatDate(selectedImage.created_at)}
                    </p>
                  </div>
                  <a
                    href={selectedImage.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Ver original
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}