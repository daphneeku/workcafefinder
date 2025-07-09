import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import type { CafeNomadCafe } from '../utils/cafenomad'
// import bookmarkIcon from '../public/file.svg'; // adjust path if needed

interface BookmarkButtonProps {
  cafe: CafeNomadCafe
  userId: string | null
  onBookmarksChanged?: () => void
  bookmarksChanged?: number // Add this to trigger re-checks
}

// Update BookmarkButton component to handle null supabase client
const BookmarkButton: React.FC<BookmarkButtonProps> = ({ cafe, userId, onBookmarksChanged, bookmarksChanged }) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  const checkBookmarkStatus = useCallback(async () => {
    if (!supabase || !userId) {
      setIsBookmarked(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('cafe_id', cafe.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking bookmark status:', error)
      }
      setIsBookmarked(!!data)
    } catch (err) {
      console.error('Unexpected error checking bookmark status:', err)
      setIsBookmarked(false)
    }
  }, [userId, cafe.id, bookmarksChanged])

  useEffect(() => {
    if (userId) {
      checkBookmarkStatus()
    } else {
      setIsBookmarked(false)
    }
  }, [userId, cafe.id, bookmarksChanged, checkBookmarkStatus])

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!supabase || !userId) {
      alert('Please sign in to bookmark cafes')
      return
    }

    setLoading(true)
    const previousState = isBookmarked
    setIsBookmarked(!isBookmarked)

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('cafe_id', cafe.id)

        if (error) {
          console.error('Error removing bookmark:', error)
          setIsBookmarked(true) // Revert optimistic update
        }
      } else {
        // Add bookmark with more complete data
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            cafe_id: cafe.id,
            cafe_name: cafe.name,
            cafe_address: cafe.address,
            latitude: cafe.latitude,
            longitude: cafe.longitude,
            wifi: cafe.wifi,
            quiet: cafe.quiet,
            seat: cafe.seat,
            socket: cafe.socket,
            cheap: cafe.cheap,
            open_time: cafe.open_time,
            music: cafe.music,
            limited_time: cafe.limited_time,
            standing_desk: cafe.standing_desk,
            mrt: cafe.mrt,
            url: cafe.url,
            city: cafe.city,
            district: cafe.district,
            price: cafe.price,
            tasty: cafe.tasty,
            comfort: cafe.comfort,
            drinks: cafe.drinks,
            food: cafe.food,
            last_update: cafe.last_update
          })

        if (error) {
          console.error('Error adding bookmark:', error)
          setIsBookmarked(false) // Revert optimistic update
        }
      }

      if (typeof onBookmarksChanged === 'function') {
        onBookmarksChanged()
      }
    } catch (err) {
      console.error('Unexpected error toggling bookmark:', err)
      setIsBookmarked(previousState) // Revert optimistic update
    } finally {
      setLoading(false)
    }
  }

  if (!userId) {
    return null
  }

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '20px',
        color: isBookmarked ? '#fbc02d' : '#ccc',
        padding: '4px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        zIndex: 9999,
        position: 'relative',
        opacity: loading ? 0.6 : 1,
        transform: loading ? 'scale(0.95)' : 'scale(1)'
      }}
      title={loading ? 'Processing...' : (isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks')}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 19"
        fill={isBookmarked ? '#fbc02d' : 'none'}
        stroke={isBookmarked ? '#fbc02d' : '#ccc'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' }}
      >
        <path d="M6 4a2 2 0 0 0-2 2v14l8-5.333L20 20V6a2 2 0 0 0-2-2z" />
      </svg>
    </button>
  )
}

export default BookmarkButton 