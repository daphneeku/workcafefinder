import React from "react";
import type { CafeNomadCafe } from "../utils/cafenomad";
import BookmarkButton from "./BookmarkButton";
import Image from 'next/image';

interface CafeListProps {
  cafes: CafeNomadCafe[];
  onCafeClick: (cafe: CafeNomadCafe) => void;
  selectedCafeId: string | null;
  isLoaded: boolean;
  loadError: Error | undefined;
  userId?: string | null;
  onBookmarksChanged?: () => void;
  bookmarksChanged?: number; // Add this prop
}

// New CafeCardPreview component for shared card UI (with optional address)
export const CafeCardPreview: React.FC<{
  cafe: CafeNomadCafe;
  selected?: boolean;
  showAddress?: boolean;
  noBorder?: boolean;
  compact?: boolean;
  onClick?: () => void;
}> = ({ cafe, selected = false, showAddress = true, noBorder = false, compact = false, onClick }) => {
  const [rating, setRating] = React.useState<number | null>(null);
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (window.google && window.google.maps && window.google.maps.places) {
      setLoading(true);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.textSearch({
        query: `${cafe.name} ${cafe.address}`,
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
  }, [cafe.name, cafe.address]);

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
    <div
      style={{
        marginBottom: "1rem",
        padding: compact ? "0.3rem 0.2rem" : "1.5rem 1.5rem",
        background: selected ? "rgba(101, 181, 164, 0.18)" : "#ffffff",
        border: noBorder ? "none" : "2px solid #eee",
        cursor: onClick ? "pointer" : undefined,
        color: '#3d3d3d',
        borderRadius: '12px',
        width: compact ? '280px' : '320px',
        height: compact ? '280px' : '320px',
        boxSizing: 'border-box',
        transition: 'box-shadow 0.2s',
        lineHeight: '1.7',
        boxShadow: selected ? '0 2px 8px rgba(56, 142, 196, 0.10)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        textAlign: compact ? 'center' : 'left',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={onClick}
    >
      {photo ? (
        <div style={{
          width: '100%',
          height: compact ? '120px' : '170px',
          borderRadius: '8px',
          overflow: 'hidden',
          background: '#f0f0f0',
          marginBottom: compact ? '0.5rem' : '0.75rem',
          flexShrink: 0
        }}>
          <Image 
            src={photo} 
            alt={`Photo of ${cafe.name}`}
            width={200}
            height={150}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%',
          height: compact ? '120px' : '170px',
          borderRadius: '8px',
          background: '#f0f0f0',
          marginBottom: compact ? '0.5rem' : '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px',
          flexShrink: 0
        }}>
          No Photo
        </div>
      )}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <strong style={{ 
            fontSize: compact ? '16px' : '18px', 
            fontWeight: '600',
            display: 'block',
            marginBottom: '4px',
            lineHeight: '1.3'
          }}>{cafe.name}</strong>
          {showAddress && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}>{cafe.address}</div>
          )}
        </div>
        <div style={{ marginTop: 'auto' }}>
          {loading ? 'Loading...' : rating !== null ? (
            <>
              {renderStars(rating)} <span style={{ fontSize: 13, color: '#888', marginLeft: 4 }}>{rating.toFixed(1)}</span>
            </>
          ) : (error || 'N/A')}
        </div>
      </div>
    </div>
  );
};

// Updated CafeListItem to use CafeCardPreview
const CafeListItem: React.FC<{
  cafe: CafeNomadCafe;
  selected: boolean;
  onClick: () => void;
  userId?: string | null;
  onBookmarksChanged?: () => void;
  bookmarksChanged?: number; // Add this prop
}> = ({ cafe, selected, onClick, userId, onBookmarksChanged, bookmarksChanged }) => {
  return (
    <li style={{ listStyle: 'none', position: 'relative' }}>
      <CafeCardPreview cafe={cafe} selected={selected} onClick={onClick} showAddress={true} />
      {userId && (
        <div 
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
          }}
        >
          <BookmarkButton 
            cafe={cafe} 
            userId={userId} 
            onBookmarksChanged={onBookmarksChanged}
            bookmarksChanged={bookmarksChanged}
          />
        </div>
      )}
    </li>
  );
};

const CafeList: React.FC<CafeListProps> = ({ cafes, onCafeClick, selectedCafeId, isLoaded, loadError, userId, onBookmarksChanged, bookmarksChanged }) => {
  if (loadError) return <div>Google Maps cannot be loaded right now.</div>;
  if (!isLoaded) return <div>Loading Google Maps...</div>;

  return (
    <ul style={{ listStyle: "none", padding: '0 0 0 0.1rem', color: '#3d3d3d', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {cafes.length === 0 && <li>No cafes found.</li>}
      {cafes.map((cafe) => (
        <CafeListItem
          key={cafe.id}
          cafe={cafe}
          selected={selectedCafeId === cafe.id}
          onClick={() => onCafeClick(cafe)}
          userId={userId}
          onBookmarksChanged={onBookmarksChanged}
          bookmarksChanged={bookmarksChanged}
        />
      ))}
    </ul>
  );
};

export default CafeList; 