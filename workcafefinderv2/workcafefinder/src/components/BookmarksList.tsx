import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import type { CafeNomadCafe } from '../utils/cafenomad';
import BookmarkButton from './BookmarkButton';

interface BookmarksListProps {
  userId: string;
  onCafeClick: (cafe: any) => void;
  onClose: () => void;
  bookmarksChanged: number;
  onBookmarksChanged?: () => void;
}

// Reuse CafeListItem logic for bookmarks
const CafeListItem: React.FC<{
  cafe: Partial<CafeNomadCafe> & { cafe_name: string; cafe_address: string; cafe_id: string };
  onClick: () => void;
  userId: string;
  onBookmarksChanged?: () => void;
  bookmarksChanged?: number;
}> = ({ cafe, onClick, userId, onBookmarksChanged, bookmarksChanged }) => {
  const [rating, setRating] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (window.google && window.google.maps && window.google.maps.places) {
      setLoading(true);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.textSearch({
        query: `${cafe.cafe_name} ${cafe.cafe_address}`,
      }, (results, status) => {
        if (cancelled) return;
        setLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          setRating(results[0].rating ?? null);
          if (results[0].photos && results[0].photos.length > 0) {
            const photoUrl = results[0].photos[0].getUrl({
              maxWidth: 200,
              maxHeight: 150
            });
            setPhoto(photoUrl);
          }
        } else {
          setError('N/A');
        }
      });
    } else {
      setError('N/A');
    }
    return () => { cancelled = true; };
  }, [cafe.cafe_name, cafe.cafe_address]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <span style={{ color: '#fbc02d', fontSize: 16, verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} aria-label="Full star">★</span>
        ))}
        {halfStar && <span aria-label="Half star" style={{ position: 'relative', display: 'inline-block', width: 16, height: 16, overflow: 'hidden' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbc02d" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="half-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#fbc02d" />
                <stop offset="50%" stopColor="#e0e0e0" />
              </linearGradient>
            </defs>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="url(#half-gradient)" />
          </svg>
        </span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i + fullStars + 1} aria-label="Empty star" style={{ color: '#e0e0e0' }}>★</span>
        ))}
      </span>
    );
  };

  return (
    <li
      style={{
        marginBottom: "1rem",
        padding: "1.5rem 1.5rem",
        background: "#ffffff",
        border: "2px solid #eee",
        cursor: "pointer",
        color: '#3d3d3d',
        borderRadius: '18px',
        minWidth: '320px',
        maxWidth: '100%',
        boxSizing: 'border-box',
        transition: 'box-shadow 0.2s',
        lineHeight: '1.7',
        display: 'block',
        position: 'relative',
      }}
      onClick={onClick}
    >
      {photo && (
        <div style={{
          width: '100%',
          height: '120px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f0f0f0',
          marginBottom: '0.75rem',
        }}>
          <img
            src={photo}
            alt={`Photo of ${cafe.cafe_name}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>{cafe.cafe_name}</strong>
        <div>{cafe.cafe_address}</div>
        <div>
          {loading ? 'Loading...' : rating !== null ? (
            <>
              {renderStars(rating)} <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>{rating.toFixed(1)}</span>
            </>
          ) : (error || 'N/A')}
        </div>
      </div>
      {/* Bookmark button positioned absolutely */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 10
      }}>
        <BookmarkButton 
          cafe={{
            id: cafe.cafe_id || '',
            name: cafe.cafe_name,
            address: cafe.cafe_address,
            latitude: cafe.latitude || 0,
            longitude: cafe.longitude || 0,
            wifi: cafe.wifi || 0,
            quiet: cafe.quiet || 0,
            socket: cafe.socket || 0,
            seat: cafe.seat || 0,
            cheap: cafe.cheap || 0,
            open_time: cafe.open_time || '',
            music: cafe.music || 0,
            limited_time: cafe.limited_time || 'no',
            standing_desk: cafe.standing_desk || 'no',
            mrt: cafe.mrt || '',
            url: cafe.url || '',
            city: cafe.city || '',
            district: cafe.district || '',
            price: cafe.price || '',
            tasty: cafe.tasty || 0,
            comfort: cafe.comfort || 0,
            drinks: cafe.drinks || '',
            food: cafe.food || '',
            last_update: cafe.last_update || ''
          }}
          userId={userId}
          onBookmarksChanged={onBookmarksChanged}
          bookmarksChanged={bookmarksChanged}
        />
      </div>
    </li>
  );
};

const BookmarksList: React.FC<BookmarksListProps> = ({ userId, onCafeClick, onClose, bookmarksChanged, onBookmarksChanged }) => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      // Small delay to ensure database updates complete
      await new Promise(resolve => setTimeout(resolve, 100));
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        // Filter out duplicates by cafe_id to ensure each cafe only appears once
        const uniqueBookmarks = data ? data.filter((bookmark, index, self) => 
          index === self.findIndex(b => b.cafe_id === bookmark.cafe_id)
        ) : [];
        setBookmarks(uniqueBookmarks);
      }
      setLoading(false);
    };
    fetchBookmarks();
  }, [userId, bookmarksChanged]);

  const clearAllBookmarks = async () => {
    if (!confirm('Are you sure you want to remove all bookmarks? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing bookmarks:', error);
        setError('Failed to clear bookmarks');
      } else {
        setBookmarks([]);
        if (typeof onBookmarksChanged === 'function') {
          onBookmarksChanged();
        }
      }
    } catch (err) {
      console.error('Unexpected error clearing bookmarks:', err);
      setError('An unexpected error occurred');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.32)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#f7f7f7',
        padding: '2rem',
        borderRadius: '16px',
        width: '400px',
        boxShadow: '0 2px 24px rgba(0,0,0,0.12)',
        color: '#3d3d3d',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>×</button>
        <h2 style={{ margin: '0 0 1.5rem 0', textAlign: 'center' }}>Bookmarked Cafes</h2>
        
        {/* Clear All Button */}
        {!loading && !error && bookmarks.length > 0 && (
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <button
              onClick={clearAllBookmarks}
              disabled={clearing}
              style={{
                padding: '0.5rem 1rem',
                background: clearing ? '#ff6b6b' : '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: clearing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                transition: 'background 0.2s',
                opacity: clearing ? 0.7 : 1
              }}
            >
              {clearing ? 'Clearing...' : 'Clear All Bookmarks'}
            </button>
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : bookmarks.length === 0 ? (
          <div>No bookmarks yet.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {bookmarks.map((bm) => (
              <CafeListItem key={bm.id} cafe={bm} onClick={() => {
                // Convert bookmarked cafe data to proper format for details modal
                const cafeData: CafeNomadCafe = {
                  id: bm.cafe_id,
                  name: bm.cafe_name,
                  address: bm.cafe_address,
                  latitude: bm.latitude,
                  longitude: bm.longitude,
                  wifi: bm.wifi,
                  quiet: bm.quiet,
                  socket: bm.socket,
                  seat: bm.seat,
                  cheap: bm.cheap,
                  open_time: bm.open_time || '',
                  music: bm.music || 0,
                  limited_time: bm.limited_time || 'no',
                  standing_desk: bm.standing_desk || 'no',
                  mrt: bm.mrt || '',
                  url: bm.url || '',
                  city: bm.city || '',
                  district: bm.district || '',
                  price: bm.price || '',
                  tasty: bm.tasty || 0,
                  comfort: bm.comfort || 0,
                  drinks: bm.drinks || '',
                  food: bm.food || '',
                  last_update: bm.last_update || ''
                };
                onCafeClick(cafeData);
              }} userId={userId} onBookmarksChanged={onBookmarksChanged} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BookmarksList;