-- Panel de Desarrollo - Esquema de Base de Datos
-- Ejecuta este script completo en el Editor SQL de Supabase

-- 1. Crear tabla de proyectos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  git_url VARCHAR(500),
  last_git_update TIMESTAMP WITH TIME ZONE,
  update_location VARCHAR(20) CHECK (update_location IN ('oficina', 'casa')),
  domain_url VARCHAR(500),
  vercel_url VARCHAR(500),
  netlify_url VARCHAR(500),
  logo_url VARCHAR(500),
  project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('web', 'app', 'both')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de imágenes de proyectos
CREATE TABLE project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_type VARCHAR(20) NOT NULL CHECK (image_type IN ('logo', 'screenshot', 'background')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger para actualizar updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas de acceso público (para simplicidad)
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on project_images" ON project_images FOR ALL USING (true);

-- 7. Crear bucket para almacenar imágenes
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);

-- 8. Crear políticas para el bucket de imágenes
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-images');