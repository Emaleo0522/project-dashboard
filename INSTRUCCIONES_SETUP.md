# 🚀 Instrucciones de Configuración - Panel de Desarrollo

## 📋 Resumen
Has creado un panel de desarrollo completo para gestionar todos tus proyectos web y aplicaciones móviles. Este panel incluye:

- ✨ Gestión completa de proyectos (crear, editar, eliminar)
- 🔗 Enlaces a GitHub, dominios, Vercel, Netlify
- 📸 Subida de imágenes y logos
- ⏰ Seguimiento de actualizaciones Git con ubicación (oficina/casa)
- 📊 Estadísticas del panel
- 🔍 Búsqueda y filtros
- 📱 Interfaz completamente responsiva

## 🛠️ Configuración Paso a Paso

### 1. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [https://supabase.com](https://supabase.com)
   - Crea una cuenta gratuita si no tienes una
   - Crea un nuevo proyecto (elige región preferiblemente cercana a ti)

2. **Obtener credenciales:**
   - Ve a Settings > API en tu proyecto de Supabase
   - Copia la **Project URL**
   - Copia la **anon public** key

3. **Configurar base de datos:**

   **Opción A - Script Completo (Recomendado):**
   - Ve al "SQL Editor" en Supabase
   - Abre el archivo `database-schema.sql` en tu proyecto
   - Copia TODO el contenido manualmente (no uses Ctrl+C desde el archivo)
   - Pégalo en el editor SQL de Supabase
   - Ejecuta el script (botón "RUN")

   **Opción B - Si tienes problemas con Storage:**
   - Usa el archivo `database-schema-simple.sql` en su lugar
   - Luego configura manualmente el Storage:
     1. Ve a Storage en Supabase
     2. Crea un nuevo bucket llamado "project-images"
     3. Márcalo como público

### 2. Configurar Variables de Entorno

1. **Editar archivo .env.local:**
   - Abre el archivo `.env.local` en la raíz del proyecto
   - Reemplaza los valores placeholder:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**Ejemplo:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Probar Localmente

```bash
# Instalar dependencias (si no está hecho)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver tu panel.

### 4. Desplegar en Vercel

#### Opción A: Desde GitHub (Recomendado)

1. **Subir a GitHub:**
   ```bash
   git add .
   git commit -m "Panel de desarrollo completado"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [https://vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa tu repositorio
   - En "Environment Variables" agrega:
     - `NEXT_PUBLIC_SUPABASE_URL`: tu URL de Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: tu clave anónima
   - Despliega

#### Opción B: Desde CLI de Vercel

```bash
# Instalar CLI de Vercel
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel dashboard
```

## 🎯 Usar el Panel

### Crear tu primer proyecto
1. Haz clic en "Nuevo Proyecto"
2. Llena el formulario con:
   - **Nombre**: Nombre de tu proyecto
   - **Tipo**: Web, App, o ambos
   - **Descripción**: Breve descripción
   - **Enlaces**: URLs de GitHub, dominio, Vercel, etc.
   - **Logo**: Sube una imagen o pega una URL

### Gestionar proyectos existentes
- **Editar**: Botón de lápiz en cada tarjeta
- **Eliminar**: Botón de papelera
- **Actualizar Git**: Botones "Marcar desde Oficina/Casa"

### Búsqueda y filtros
- Usa la barra de búsqueda para encontrar proyectos
- Filtra por tipo: Todos, Web, o App

## 🗂️ Estructura de Archivos

```
dev-panel/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Dashboard.tsx          # Página principal
│   │   ├── ProjectCard.tsx        # Tarjeta de proyecto
│   │   ├── AddProjectModal.tsx    # Modal crear proyecto
│   │   ├── EditProjectModal.tsx   # Modal editar proyecto
│   │   └── ImageUpload.tsx        # Componente subir imágenes
│   ├── lib/
│   │   └── supabase.ts           # Configuración Supabase
│   └── types/
│       └── project.ts            # Tipos TypeScript
├── database-schema.sql           # Script SQL para Supabase
├── .env.local                   # Variables de entorno
└── README.md                    # Documentación
```

## 🚨 Solución de Problemas

### Error: "Unable to find snippet" al pegar SQL
**Causa:** Error de copia/pega desde el archivo
**Solución:**
1. Abre el archivo `database-schema.sql` en un editor de texto
2. Selecciona TODO manualmente (no uses Ctrl+A)
3. Copia línea por línea si es necesario
4. Alternativamente, usa `database-schema-simple.sql`

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env.local` tiene las variables correctas
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error en la subida de imágenes
- Verifica que ejecutaste el script SQL completo en Supabase
- Verifica que el bucket 'project-images' existe en Supabase Storage
- Si no existe, créalo manualmente en Storage > "New bucket"

### Proyectos no aparecen
- Verifica que las tablas se crearon correctamente en Supabase
- Revisa la consola del navegador para errores
- Verifica las políticas RLS en Supabase

## 🎉 ¡Tu Panel Está Listo!

Tu panel de desarrollo está completamente funcional y listo para usar. Puedes:

1. ✅ Gestionar todos tus proyectos en un lugar
2. ✅ Subir logos e imágenes
3. ✅ Trackear actualizaciones de Git
4. ✅ Mantener enlaces organizados
5. ✅ Acceder desde cualquier dispositivo

**URL de tu panel desplegado:** (se generará después del despliegue en Vercel)

---

💡 **Consejo:** Marca esta página como favorita para acceso rápido a tu panel de desarrollo.