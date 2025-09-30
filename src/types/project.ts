export interface Project {
  id: string
  name: string
  description?: string
  git_url?: string
  last_git_update?: string
  update_location?: 'oficina' | 'casa'
  domain_url?: string
  vercel_url?: string
  netlify_url?: string
  supabase_url?: string
  logo_url?: string
  screenshots: string[]
  project_type: 'web' | 'app' | 'both'
  status: 'active' | 'paused' | 'completed'
  created_at: string
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  image_url: string
  image_type: 'logo' | 'screenshot' | 'background'
  description?: string
  created_at: string
}