'use client';
import React from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import type { CafeNomadCafe } from "../utils/cafenomad";
import CafeList, { CafeCardPreview } from "./CafeList";

const containerStyle = { width: "100%", height: "100%" };

interface MapProps {
  location: { lat: number; lng: number };
  cafes: CafeNomadCafe[];
  isLoaded: boolean;
  loadError: Error | undefined;
  onCafePinClick?: (cafe: CafeNomadCafe) => void;
}

const Map: React.FC<MapProps> = ({ location, cafes, isLoaded, loadError, onCafePinClick }) => {
  const [selectedCafeId, setSelectedCafeId] = React.useState<string | null>(null);
  const selectedCafe = cafes.find(c => c.id === selectedCafeId) || null;

  if (loadError) return <div>Map cannot be loaded right now.</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={location}
      zoom={14}
    >
      {/* User location marker (blue) */}
      <Marker 
        position={location} 
        icon={{
          path: window.google?.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#fff',
        }}
        title="Your Location"
      />
      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={{ lat: Number(cafe.latitude), lng: Number(cafe.longitude) }}
          title={cafe.name}
          onClick={() => {
            setSelectedCafeId(cafe.id);
            // Remove the automatic details modal opening
            // if (onCafePinClick) onCafePinClick(cafe);
          }}
        />
      ))}
      {selectedCafe && (
        <InfoWindow
          position={{ lat: Number(selectedCafe.latitude), lng: Number(selectedCafe.longitude) }}
          onCloseClick={() => setSelectedCafeId(null)}
        >
          <div style={{ width: '280px', padding: 0, position: 'relative' }}>
            {/* Use CafeCardPreview for the popup, omit address, make clickable */}
            <CafeCardPreview
              cafe={selectedCafe}
              selected={false}
              showAddress={false}
              noBorder={true}
              compact={true}
              onClick={() => {
                if (onCafePinClick) onCafePinClick(selectedCafe);
              }}
            />
            {/* Triangle pointer pointing to the pin */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #ffffff',
              zIndex: 1
            }} />
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default Map; 