import { permanentRedirect } from 'next/navigation'

type LegacyListingPageProps = {
  params: Promise<{ id: string }>
}

export default async function LegacyListingPage({ params }: LegacyListingPageProps) {
  const { id } = await params
  permanentRedirect(`/${id}`)
}
