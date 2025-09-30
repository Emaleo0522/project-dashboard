-- Credentials Vault - Esquema de Base de Datos
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Crear tabla para almacenar la contraseña maestra (hash)
CREATE TABLE vault_master_password (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla para credenciales cifradas por proyecto
CREATE TABLE project_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  credential_type VARCHAR(50) NOT NULL, -- 'github_token', 'api_key', 'anon_public', 'private_key', etc.
  credential_name VARCHAR(100) NOT NULL, -- nombre descriptivo
  encrypted_value TEXT NOT NULL, -- valor cifrado
  iv TEXT NOT NULL, -- vector de inicialización para el cifrado
  description TEXT, -- descripción opcional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, credential_type, credential_name)
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX idx_project_credentials_project_id ON project_credentials(project_id);
CREATE INDEX idx_project_credentials_type ON project_credentials(credential_type);

-- 4. Habilitar RLS
ALTER TABLE vault_master_password ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_credentials ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas RLS (acceso completo para usuarios autenticados)
CREATE POLICY "Enable all operations for authenticated users" ON vault_master_password
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON project_credentials
  FOR ALL USING (true);

-- 6. Insertar la contraseña maestra hasheada con salt
-- Contraseña: "SofiLuci07" (respetando mayúsculas)
INSERT INTO vault_master_password (password_hash, salt)
VALUES (
  '$2b$12$QwaA90Tx2I6vILs3VocI2uPevA.4kWdNNI8dLpbTjYhX9A42RUx3u', -- Hash de "SofiLuci07" con bcrypt
  'default_salt_for_master_password'
);

-- 7. Función para actualizar updated_at automáticamente
CREATE TRIGGER update_vault_master_password_updated_at
    BEFORE UPDATE ON vault_master_password
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_credentials_updated_at
    BEFORE UPDATE ON project_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Verificar las tablas creadas
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('vault_master_password', 'project_credentials')
ORDER BY table_name, ordinal_position;