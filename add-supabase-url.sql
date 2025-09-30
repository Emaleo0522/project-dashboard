-- Agregar campo supabase_url a la tabla projects
-- Ejecuta este comando en el Editor SQL de Supabase

ALTER TABLE projects
ADD COLUMN supabase_url VARCHAR(500);

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'projects'
AND column_name = 'supabase_url';