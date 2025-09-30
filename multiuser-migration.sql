-- Migración a sistema multiusuario
-- Ejecutar después de configurar Supabase Auth

-- 1. Agregar columna user_id a projects
ALTER TABLE projects ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. Agregar columna user_id a project_images
ALTER TABLE project_images ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 3. Modificar vault_master_password para ser por usuario
-- Primero respaldar la contraseña actual
CREATE TABLE vault_master_password_backup AS SELECT * FROM vault_master_password;

-- Eliminar tabla actual y recrear con user_id
DROP TABLE vault_master_password CASCADE;

CREATE TABLE vault_master_password (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- Un vault por usuario
);

-- 4. Agregar user_id a project_credentials
ALTER TABLE project_credentials ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 5. Actualizar RLS policies para filtrar por usuario

-- Projects policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON projects;
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Project images policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON project_images;
CREATE POLICY "Users can view own project images" ON project_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own project images" ON project_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own project images" ON project_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own project images" ON project_images FOR DELETE USING (auth.uid() = user_id);

-- Vault master password policies
ALTER TABLE vault_master_password ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own vault password" ON vault_master_password FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vault password" ON vault_master_password FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vault password" ON vault_master_password FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vault password" ON vault_master_password FOR DELETE USING (auth.uid() = user_id);

-- Project credentials policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON project_credentials;
CREATE POLICY "Users can view own credentials" ON project_credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credentials" ON project_credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credentials" ON project_credentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credentials" ON project_credentials FOR DELETE USING (auth.uid() = user_id);

-- 6. Crear función para auto-asignar user_id
CREATE OR REPLACE FUNCTION auto_assign_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Crear triggers para auto-asignar user_id
CREATE TRIGGER projects_auto_user_id
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_id();

CREATE TRIGGER project_images_auto_user_id
  BEFORE INSERT ON project_images
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_id();

CREATE TRIGGER project_credentials_auto_user_id
  BEFORE INSERT ON project_credentials
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_id();

CREATE TRIGGER vault_master_password_auto_user_id
  BEFORE INSERT ON vault_master_password
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_user_id();

-- 8. Actualizar triggers de updated_at
CREATE TRIGGER update_vault_master_password_updated_at
    BEFORE UPDATE ON vault_master_password
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Verificar configuración
SELECT
  n.nspname as schema_name,
  c.relname as table_name,
  a.attname as column_name,
  t.typname as data_type
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_type t ON a.atttypid = t.oid
WHERE n.nspname = 'public'
  AND c.relname IN ('projects', 'project_images', 'vault_master_password', 'project_credentials')
  AND a.attname = 'user_id'
  AND NOT a.attisdropped
ORDER BY c.relname, a.attname;