export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://heypcs.com'

export const SITE_NAME = "Hey PC's"

export const DEFAULT_DESCRIPTION =
  "Shop tested custom gaming PCs from Hey PC's. Browse high-performance builds, compare specs, and message on Facebook to buy."

export const DEFAULT_KEYWORDS = [
  "Hey PC's",
  'Hey PCs',
  'heypcs',
  'hey pcs',
  'custom gaming PCs',
  'gaming PC marketplace',
  'custom PC marketplace',
  'buy gaming PC',
  'used gaming PC',
  'prebuilt gaming PC',
  'RTX gaming PC',
]

type PcKeywordInput = {
  title?: string | null
  cpu?: string | null
  gpu?: string | null
  ram?: string | null
  storage?: string | null
  os?: string | null
}

const normalizeKeyword = (keyword: string) => keyword.replace(/\s+/g, ' ').trim()

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function buildPcKeywords(listing?: PcKeywordInput | null) {
  const parts = [
    listing?.title,
    listing?.cpu,
    listing?.gpu,
    listing?.ram,
    listing?.storage,
    listing?.os,
  ]
    .filter(Boolean)
    .map((part) => normalizeKeyword(String(part)))

  const specs = [listing?.gpu, listing?.cpu, listing?.ram, listing?.storage]
    .filter(Boolean)
    .map((part) => normalizeKeyword(String(part)))

  const generated = [
    ...DEFAULT_KEYWORDS,
    ...parts,
    specs.filter(Boolean).join(' '),
    listing?.gpu && `${listing.gpu} gaming PC`,
    listing?.cpu && `${listing.cpu} gaming PC`,
    listing?.ram && `${listing.ram} gaming PC`,
    listing?.storage && `${listing.storage} gaming PC`,
    listing?.gpu && listing?.cpu && `${listing.gpu} ${listing.cpu} PC`,
    listing?.gpu && listing?.ram && `${listing.gpu} ${listing.ram} PC`,
    listing?.title && `buy ${listing.title}`,
    listing?.title && `${listing.title} for sale`,
  ]
    .filter(Boolean)
    .map((keyword) => normalizeKeyword(String(keyword)))
    .filter((keyword) => keyword.length > 1)

  return Array.from(new Set(generated)).slice(0, 40)
}
