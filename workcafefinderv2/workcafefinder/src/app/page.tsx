'use client';
import React, { useEffect, useState, useCallback } from "react";
import Map from "../components/Map";
import CafeList from "../components/CafeList";
import { fetchCafeNomadCafes, CafeNomadCafe } from "../utils/cafenomad";
import { useJsApiLoader } from "@react-google-maps/api";
import Auth from "../components/Auth";
import BookmarkButton from "../components/BookmarkButton";
import BookmarksList from "../components/BookmarksList";
import UserDropdown from "../components/UserDropdown";
import { supabase } from "../utils/supabase";

const taipei = { lat: 25.033964, lng: 121.564468 };

export default function Home() {
  const [cafes, setCafes] = useState<CafeNomadCafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number }>(taipei);
  const [selectedCafe, setSelectedCafe] = useState<CafeNomadCafe | null>(null);
  const [fetchError, setFetchError] = useState<any>(null);
  const [googleOpeningHours, setGoogleOpeningHours] = useState<string[] | null>(null);
  const [googleOpeningHoursLoading, setGoogleOpeningHoursLoading] = useState(false);
  const [goodForWorkingOnly, setGoodForWorkingOnly] = useState(false);
  const [goodWifiOnly, setGoodWifiOnly] = useState(false);
  const [goodQuietOnly, setGoodQuietOnly] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [user, setUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [bookmarksChanged, setBookmarksChanged] = useState(0);
  const [priceFilters, setPriceFilters] = useState<number[]>([]);
  const [locationHover, setLocationHover] = useState(false);
  const [bookmarksHover, setBookmarksHover] = useState(false);
  const [cafePhoto, setCafePhoto] = React.useState<string | null>(null);
  const [cafePhotoLoading, setCafePhotoLoading] = React.useState(false);
  const [cafePhotoError, setCafePhotoError] = React.useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  useEffect(() => {
    setLoading(true);
    fetchCafeNomadCafes()
      .then((data) => {
        setCafes(data);
        setFetchError(null);
      })
      .catch((e) => {
        setError(e.message);
        setFetchError(e);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLocation.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation + ", Taiwan")}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setLocation({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
        setError(null);
      } else {
        setError("Location not found. Please try a different search term.");
      }
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCafeClick = (cafe: CafeNomadCafe) => {
    setSelectedCafe(cafe);
    setGoogleOpeningHours(null);
    setGoogleOpeningHoursLoading(false);
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleOpeningHoursLoading(true);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      // Use textSearch for better matching
      service.textSearch({
        query: `${cafe.name} ${cafe.address}`,
      }, (results: any, status: any) => {
        console.log('textSearch', { results, status });
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          const placeId = results[0].place_id;
          // Step 2: Get details
          service.getDetails({
            placeId,
            fields: ['opening_hours'],
          }, (place: any, status: any) => {
            console.log('getDetails', { place, status });
            setGoogleOpeningHoursLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.opening_hours) {
              setGoogleOpeningHours(place.opening_hours.weekday_text);
            } else {
              setGoogleOpeningHours([]); // Indicate that Google opening hours are not available
            }
          });
        } else {
          setGoogleOpeningHoursLoading(false);
          setGoogleOpeningHours([]); // Indicate that Google opening hours are not available
        }
      });
    }
  };

  const handleCloseModal = () => {
    setSelectedCafe(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Filter cafes within 1km of the current location
  let filteredCafes = cafes.filter((cafe) => {
    const R = 6371e3; // metres
    const φ1 = (location.lat * Math.PI) / 180;
    const φ2 = (Number(cafe.latitude) * Math.PI) / 180;
    const Δφ = ((Number(cafe.latitude) - location.lat) * Math.PI) / 180;
    const Δλ = ((Number(cafe.longitude) - location.lng) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d < 1000;
  });

  if (goodForWorkingOnly) {
    filteredCafes = filteredCafes.filter((cafe) => {
      const wifi = cafe.wifi;
      const quiet = cafe.quiet;
      const sockets = cafe.socket;
      return (wifi >= 4 && quiet >= 4) || (wifi >= 4 && quiet >= 4 && sockets >= 4);
    });
  }
  if (goodWifiOnly) {
    filteredCafes = filteredCafes.filter((cafe) => cafe.wifi >= 4); // Good WiFi (4) or Excellent WiFi (5)
  }
  if (goodQuietOnly) {
    filteredCafes = filteredCafes.filter((cafe) => cafe.quiet >= 4);
  }
  if (priceFilters.length > 0) {
    filteredCafes = filteredCafes.filter((cafe) => priceFilters.includes(Number(cafe.cheap)));
  }

  // Callback to trigger bookmarks refresh
  const handleBookmarksChanged = useCallback(() => {
    setBookmarksChanged((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!selectedCafe) return;
    setCafePhoto(null);
    setCafePhotoError(null);
    if (window.google && window.google.maps && window.google.maps.places) {
      setCafePhotoLoading(true);
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.textSearch({
        query: `${selectedCafe.name} ${selectedCafe.address}`,
      }, (results, status) => {
        setCafePhotoLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
          if (results[0].photos && results[0].photos.length > 0) {
            const photoUrl = results[0].photos[0].getUrl({ maxWidth: 400, maxHeight: 250 });
            setCafePhoto(photoUrl);
          }
        } else {
          setCafePhotoError('No photo available');
        }
      });
    } else {
      setCafePhotoError('No photo available');
    }
  }, [selectedCafe]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Debug info removed */}
      <header style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ color: '#000' }}>WorkCafeFinder Taiwan 🍵</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  padding: "0 1.5rem",
                  height: "40px",
                  borderRadius: "20px",
                  background: "#2b2b2b",
                  color: "white",
                  border: "none",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#65b5a4"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#2b2b2b"}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
        <form style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1rem", justifyContent: "space-between" }} onSubmit={handleSearchLocation}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="Enter a location (e.g. Taipei)"
              style={{
                padding: "0.5rem",
                paddingRight: "2.5rem",
                width: "100%",
                boxSizing: "border-box",
                fontSize: "1.1rem",
                background: "#f7f7f7",
                borderRadius: "10px",
                border: "2px solid transparent",
                height: "50px",
                color: "#666",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              name="location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              disabled={searchLoading}
              onFocus={(e) => e.target.style.borderColor = "#d0d0d0"}
              onBlur={(e) => e.target.style.borderColor = "transparent"}
            />
            <style jsx>{`
              input::placeholder {
                color: #ccc;
              }
            `}</style>
            <button
              type="button"
              onClick={() => setSearchLocation("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: "#888",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ×
            </button>
          </div>
          <button
            type="button"
            style={{
              padding: "0 1.5rem",
              height: "43px",
              borderRadius: "20px",
              background: locationHover ? "#65b5a4" : "#2b2b2b",
              color: "white",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onClick={handleUseMyLocation}
            onMouseEnter={() => setLocationHover(true)}
            onMouseLeave={() => setLocationHover(false)}
          >
            Use My Location
          </button>
          <button
            type="button"
            style={{
              padding: "0 1.5rem",
              height: "43px",
              borderRadius: "20px",
              background: bookmarksHover ? "#65b5a4" : "#2b2b2b",
              color: "white",
              border: "none",
              fontSize: "0.9rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onClick={() => {
              if (user) {
                setShowBookmarks(true);
              } else {
                alert("Please sign in first to access your bookmarks.");
                setShowAuth(true);
              }
            }}
            onMouseEnter={() => setBookmarksHover(true)}
            onMouseLeave={() => setBookmarksHover(false)}
          >
            Bookmarks ☕
          </button>
        </form>
      </header>
      <main style={{ display: "flex", flex: 1, minHeight: 0, height: '82vh', gap: '1rem' }}>
        <aside style={{ width: '20%', height: '84.7vh', overflowY: 'auto', padding: "1rem 1rem 1rem 2rem", background: '#f7f7f7', color: '#222', borderTopRightRadius: '18px' }}>
          <h2 style={{ padding: "0.5rem 0 0.1rem 0.1rem", margin: "0 0 1.8rem 0" }}>Filters</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontWeight: 500 }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem', paddingLeft: '0.1rem' }}>
              <input type="checkbox" name="laptopFriendly" checked={goodForWorkingOnly} onChange={e => setGoodForWorkingOnly(e.target.checked)} style={{ display: 'none' }} />
              <span style={{
                display: 'inline-block',
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: goodForWorkingOnly ? '#65b5a4' : '#222',
                transition: 'background 0.25s cubic-bezier(.4,2,.6,1)',
                boxShadow: goodForWorkingOnly ? '0 0 0 4px #65b5a455' : 'none',
                position: 'relative',
              }} />
              Good for Working
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem', paddingLeft: '0.1rem' }}>
              <input type="checkbox" name="freeWifi" checked={goodWifiOnly} onChange={e => setGoodWifiOnly(e.target.checked)} style={{ display: 'none' }} />
              <span style={{
                display: 'inline-block',
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: goodWifiOnly ? '#65b5a4' : '#222',
                transition: 'background 0.25s cubic-bezier(.4,2,.6,1)',
                boxShadow: goodWifiOnly ? '0 0 0 4px #65b5a455' : 'none',
                position: 'relative',
              }} />
              WiFi
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem', paddingLeft: '0.1rem' }}>
              <input type="checkbox" name="quiet" checked={goodQuietOnly} onChange={e => setGoodQuietOnly(e.target.checked)} style={{ display: 'none' }} />
              <span style={{
                display: 'inline-block',
                width: 15,
                height: 15,
                borderRadius: '50%',
                background: goodQuietOnly ? '#65b5a4' : '#222',
                transition: 'background 0.25s cubic-bezier(.4,2,.6,1)',
                boxShadow: goodQuietOnly ? '0 0 0 4px #65b5a455' : 'none',
                position: 'relative',
              }} />
              Quiet
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', paddingLeft: '0.1rem' }}>
              <span style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Price Range</span>
              {[5, 4, 3, 2, 1].map((level) => (
                <label key={level} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={priceFilters.includes(level)}
                    onChange={() => {
                      setPriceFilters((prev) =>
                        prev.includes(level)
                          ? prev.filter((l) => l !== level)
                          : [...prev, level]
                      );
                    }}
                    style={{ display: 'none' }}
                  />
                  <span style={{
                    display: 'inline-block',
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                    background: priceFilters.includes(level) ? '#65b5a4' : '#222',
                    transition: 'background 0.25s cubic-bezier(.4,2,.6,1)',
                    boxShadow: priceFilters.includes(level) ? '0 0 0 4px #65b5a455' : 'none',
                    position: 'relative',
                  }} />
                  {level === 5 ? (<><span style={{fontSize: '15px'}}>Very affordable</span> <span style={{fontSize: '13px'}}>💲</span></>) :
                   level === 4 ? (<><span style={{fontSize: '15px'}}>Affordable</span> <span style={{fontSize: '13px'}}>💲💲</span></>) :
                   level === 3 ? (<><span style={{fontSize: '15px'}}>Moderate</span> <span style={{fontSize: '13px'}}>💲💲💲</span></>) :
                   level === 2 ? (<><span style={{fontSize: '15px'}}>Expensive</span> <span style={{fontSize: '13px'}}>💲💲💲💲</span></>) :
                   (<><span style={{fontSize: '15px'}}>Very expensive</span> <span style={{fontSize: '13px'}}>💲💲💲💲💲</span></>)}
                 </label>
               ))}
             </div>
          </div>
        </aside>
        <section style={{ flex: '0 0 60%', minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, minHeight: 0, position: "relative", height: '100vh', borderRadius: '18px', overflow: 'hidden' }}>
            <Map location={location} cafes={filteredCafes} isLoaded={isLoaded} loadError={loadError} onCafePinClick={handleCafeClick} />
          </div>
        </section>
        <aside style={{ width: '25%', height: '84.7vh', overflowY: 'auto', padding: "1rem", background: '#f7f7f7', color: '#222', borderTopLeftRadius: '18px' }}>
          <h2 style={{ padding: "0.5rem 0 0.1rem 0.5frem", margin: "0 0 1.3rem 0" }}>Cafes</h2>
          {loading && <div>Loading cafes...</div>}
          {error && <div style={{ color: "red" }}>{error}</div>}
          <CafeList cafes={filteredCafes} onCafeClick={handleCafeClick} selectedCafeId={selectedCafe?.id || null} isLoaded={isLoaded} loadError={loadError} userId={user?.id || null} onBookmarksChanged={handleBookmarksChanged} bookmarksChanged={bookmarksChanged} />
        </aside>
      </main>
      {selectedCafe && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0, 0, 0, 0.32)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001
        }} onClick={handleCloseModal}>
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 16,
              width: 600,
              height: 800,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
              color: '#3d3d3d',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: '8px', zIndex: 2 }}>
              <button style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }} onClick={handleCloseModal}>×</button>
            </div>
            {cafePhotoLoading ? (
              <div style={{ width: '100%', height: 260, background: '#f0f0f0', borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading photo...</div>
            ) : cafePhoto ? (
              <div style={{ width: '100%', height: 260, background: '#f0f0f0', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
                <img src={cafePhoto} alt={`Photo of ${selectedCafe.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : null}
            <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
              {selectedCafe.name}
              <span onClick={e => e.stopPropagation()}>
                <BookmarkButton cafe={selectedCafe} userId={user?.id || null} onBookmarksChanged={handleBookmarksChanged} bookmarksChanged={bookmarksChanged} />
              </span>
            </h2>
            <div style={{ fontSize: 15 }}>{selectedCafe.address}</div>
            {/* Good for Working label and attributes follow... */}
            {(() => {
              const wifi = selectedCafe.wifi;
              const quiet = selectedCafe.quiet;
              const sockets = selectedCafe.socket;
              if (wifi >= 4 && quiet >= 4 && sockets >= 4) {
                return <div style={{ fontWeight: 600, color: '#388e3c', marginBottom: 8 }}>Good for Working <span style={{ color: '#fbc02d' }}>★★</span></div>;
              } else if (wifi >= 4 && quiet >= 4) {
                return <div style={{ fontWeight: 600, color: '#388e3c', marginBottom: 8 }}>Good for Working <span style={{ color: '#fbc02d' }}>★</span></div>;
              }
              return null;
            })()}
            <div>
              <span style={{ fontWeight: 500 }}>WiFi: </span>
              <span style={{ color: '#3d3d3d', fontSize: 15 }}>
                {selectedCafe.wifi ? (
                  selectedCafe.wifi >= 5 ? 'Excellent WiFi' : selectedCafe.wifi === 4 ? 'Good WiFi' : selectedCafe.wifi === 3 ? 'Average WiFi' : 'Poor WiFi'
                ) : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Seats: </span>
              <span style={{ color: '#3d3d3d', fontSize: 15 }}>
                {selectedCafe.seat ? (
                  selectedCafe.seat >= 4 ? 'Plenty of seating' : selectedCafe.seat === 3 ? 'Moderate seating' : 'Limited seating'
                ) : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Noise Level: </span>
              <span style={{ color: '#3d3d3d', fontSize: 15 }}>
                {selectedCafe.quiet ? (
                  selectedCafe.quiet >= 4 ? 'Very quiet' : selectedCafe.quiet === 3 ? 'Moderately quiet' : 'Noisy'
                ) : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Sockets: </span>
              <span style={{ color: '#3d3d3d', fontSize: 15 }}>
                {selectedCafe.socket ? selectedCafe.socket : 'N/A'}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Price: </span>
              <span style={{ color: '#3d3d3d', fontSize: 15 }}>
                {selectedCafe.cheap ? (
                  selectedCafe.cheap >= 5 ? 'Very affordable 💲' : 
                   selectedCafe.cheap === 4 ? 'Affordable 💲💲' : 
                   selectedCafe.cheap === 3 ? 'Moderate pricing 💲💲💲' : 
                   selectedCafe.cheap === 2 ? 'Expensive 💲💲💲💲' : 
                   'Very expensive 💲💲💲💲💲'
                ) : 'N/A'}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Open: {googleOpeningHoursLoading ? (
              <span style={{ fontSize: 14 }}>Loading Google opening hours...</span>
            ) : googleOpeningHours ? (
              googleOpeningHours.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 14, fontWeight: 400, listStyle: 'none' }}>
                  {googleOpeningHours.map((line, i) => (
                    <li key={i} style={{ 
                      fontSize: 14, 
                      position: 'relative',
                      paddingLeft: '12px',
                      marginBottom: '2px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        top: '6px',
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        backgroundColor: '#888',
                        display: 'inline-block'
                      }}></span>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: 13 }}>Google opening hours not available</span>
              )
            ) : selectedCafe.open_time}
            </div>

          </div>
        </div>
      )}
      {showAuth && (
        <Auth
          onAuthChange={(user) => {
            setUser(user)
            setShowAuth(false)
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
      
      {showBookmarks && user && (
        <BookmarksList
          userId={user.id}
          onCafeClick={handleCafeClick}
          onClose={() => setShowBookmarks(false)}
          bookmarksChanged={bookmarksChanged}
          onBookmarksChanged={handleBookmarksChanged}
        />
      )}
    </div>
  );
}
