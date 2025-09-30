# Ejecutar Migración Multiusuario

Para habilitar el sistema multiusuario, ejecuta los siguientes pasos:

## 1. Abrir Supabase Dashboard
1. Ve a https://supabase.com/dashboard
2. Abre tu proyecto: `dpdwrtgsmdzsdzmpitfz`
3. Ve a la sección **SQL Editor**

## 2. Ejecutar la migración
Copia y pega el contenido completo del archivo `multiuser-migration.sql` en el SQL Editor y ejecuta.

## 3. Verificar que la migración fue exitosa
Ejecuta esta consulta para verificar que las columnas `user_id` se agregaron correctamente:

```sql
SELECT
  schemaname,
  tablename,
  attname as column_name,
  typname as data_type
FROM pg_attribute
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_images', 'vault_master_password', 'project_credentials')
  AND attname = 'user_id'
  AND NOT attisdropped
ORDER BY tablename, attname;
```

Si la consulta devuelve 4 filas (una para cada tabla), la migración fue exitosa.

## 4. Habilitar autenticación
1. En Supabase Dashboard, ve a **Authentication** > **Settings**
2. Asegúrate de que "Enable email confirmations" esté habilitado
3. En **Site URL**, configura: tu URL de producción en Vercel

¡Listo! El sistema ahora es multiusuario.