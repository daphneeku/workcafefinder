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
  const [isClicked, setIsClicked] = useState(false)

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
  }, [userId, cafe.id])

  useEffect(() => {
    if (userId) {
      checkBookmarkStatus()
    } else {
      setIsBookmarked(false)
    }
  }, [userId, cafe.id, bookmarksChanged, checkBookmarkStatus])

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    
    console.log('Bookmark button clicked!', { 
      cafe: cafe.name, 
      cafeId: cafe.id,
      userId, 
      isBookmarked,
      supabaseConfigured: !!supabase
    })
    
    if (!supabase || !userId) {
      alert('Please sign in to bookmark cafes')
      return
    }

    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200) // Visual feedback

    setLoading(true)
    const previousState = isBookmarked
    setIsBookmarked(!isBookmarked)

    try {
      if (isBookmarked) {
        // Remove bookmark
        console.log('Removing bookmark...')
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('cafe_id', cafe.id)

        if (error) {
          console.error('Error removing bookmark:', error)
          setIsBookmarked(true) // Revert optimistic update
        } else {
          console.log('Bookmark removed successfully')
        }
      } else {
        // Add bookmark with minimal data first
        console.log('Adding bookmark...')
        const bookmarkData = {
          user_id: userId,
          cafe_id: cafe.id,
          cafe_name: cafe.name || '',
          cafe_address: cafe.address || ''
        }
        console.log('Bookmark data:', bookmarkData)
        
        const { error } = await supabase
          .from('bookmarks')
          .insert(bookmarkData)

        if (error) {
          console.error('Error adding bookmark:', error)
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          setIsBookmarked(false) // Revert optimistic update
        } else {
          console.log('Bookmark added successfully')
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
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #eee',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '20px',
          color: isBookmarked ? '#fbc02d' : '#666',
          padding: '8px',
          borderRadius: '6px',
          transition: 'all 0.2s ease',
          zIndex: 99999,
          position: 'relative',
          opacity: loading ? 0.6 : 1,
          transform: loading ? 'scale(0.95)' : (isClicked ? 'scale(0.9)' : 'scale(1)'),
          pointerEvents: 'auto',
          minWidth: '40px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isClicked ? '0 1px 4px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)'
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
        title={loading ? 'Processing...' : (isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isBookmarked ? '#fbc02d' : 'none'}
          stroke={isBookmarked ? '#fbc02d' : '#666'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block', pointerEvents: 'none' }}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
  )
}

export default BookmarkButton 