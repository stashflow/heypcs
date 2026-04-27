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

  const toggleLike = useCallback(async (listingId: number, currentCount: number) => {
    if (pending.has(listingId)) return currentCount

    setPending(p => new Set(p).add(listingId))

    const alreadyLiked = liked.has(listingId)
    const newLiked = new Set(liked)

    if (alreadyLiked) {
      newLiked.delete(listingId)
    } else {
      newLiked.add(listingId)
    }

    setLiked(newLiked)
    saveStoredLikes(newLiked)

    try {
      const res = await fetch('/api/likes', {
        method: alreadyLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
      const data = await res.json()
      return data.likes_count ?? (alreadyLiked ? currentCount - 1 : currentCount + 1)
    } catch {
      // Revert on error
      setLiked(liked)
      saveStoredLikes(liked)
      return currentCount
    } finally {
      setPending(p => { const n = new Set(p); n.delete(listingId); return n })
    }
  }, [liked, pending])

  return { isLiked, toggleLike, liked }
}
