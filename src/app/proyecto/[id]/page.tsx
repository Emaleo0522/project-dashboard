import ProjectDetail from '@/components/ProjectDetail'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  return <ProjectDetail projectId={id} />
}