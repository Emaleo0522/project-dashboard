import AppLayout from '@/components/AppLayout'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  return <AppLayout initialSection="details" projectId={id} />
}