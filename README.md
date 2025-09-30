# Panel de Desarrollo

Un panel moderno y responsivo para gestionar todos tus proyectos de desarrollo web y aplicaciones móviles.

## Características

- ✨ Gestión completa de proyectos (CRUD)
- 🔗 Enlaces a GitHub, dominios, Vercel, Netlify
- 📸 Subida de imágenes y logos
- ⏰ Seguimiento de actualizaciones Git con ubicación (oficina/casa)
- 📊 Estadísticas del panel
- 🔍 Búsqueda y filtros
- 📱 Interfaz completamente responsiva
- 🎨 Diseño moderno con Tailwind CSS

## Tecnologías

- **Framework**: Next.js 15 con TypeScript
- **Base de datos**: Supabase
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Almacenamiento**: Supabase Storage

## Configuración

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > API y copia la URL y la clave anónima
3. Ejecuta el SQL que está en `database-schema.sql` en el Editor SQL de Supabase

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key_aqui
```

### 3. Instalación y desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el resultado.

## Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. ¡Despliega!

## Uso

1. **Crear proyecto**: Haz clic en "Nuevo Proyecto" y llena el formulario
2. **Gestionar enlaces**: Agrega URLs de GitHub, dominios, y servicios de hosting
3. **Subir imágenes**: Usa el componente de subida o pega URLs de imágenes
4. **Seguimiento Git**: Marca cuándo actualizas desde la oficina o casa
5. **Buscar y filtrar**: Usa la barra de búsqueda y filtros por tipo

## Estructura del Proyecto

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Dashboard.tsx
│   ├── ProjectCard.tsx
│   ├── AddProjectModal.tsx
│   ├── EditProjectModal.tsx
│   └── ImageUpload.tsx
├── lib/
│   └── supabase.ts
└── types/
    └── project.ts
```
