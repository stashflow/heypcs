import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'heypcs_liked'

function getStoredLikes(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveStoredLikes(likes: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(likes)))
}

export function useLikes() {
  const [liked, setLiked] = useState<Set<number>>(new Set())
  const [pending, setPending] = useState<Set<number>>(new Set())

  useEffect(() => {
    setLiked(getStoredLikes())
  }, [])

  const isLiked = useCallback((id: number) => liked.has(id), [liked])

  const toggleLike = useCallback(async (listingId: number): Promise<void> => {
    if (pending.has(listingId)) return

    setPending(p => new Set(p).add(listingId))

    const alreadyLiked = liked.has(listingId)
    const next = new Set(liked)
    if (alreadyLiked) next.delete(listingId)
    else next.add(listingId)

    setLiked(next)
    saveStoredLikes(next)

    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, action: alreadyLiked ? 'unlike' : 'like' }),
      })
    } catch {
      // revert on error
      setLiked(liked)
      saveStoredLikes(liked)
    } finally {
      setPending(p => { const n = new Set(p); n.delete(listingId); return n })
    }
  }, [liked, pending])

  return { isLiked, toggleLike, liked }
}
