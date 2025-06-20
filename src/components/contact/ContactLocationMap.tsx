
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

interface ContactLocationMapProps {
  location?: string;
  className?: string;
  height?: string;
}

export function ContactLocationMap({ 
  location, 
  className = "", 
  height = "200px" 
}: ContactLocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Using your provided Mapbox public token
  const mapboxToken = 'pk.eyJ1IjoiamFjb2J0YXJ0YWJpbmkiLCJhIjoiY21jNHFiNGJqMGk0bDJvcHpqMG14MWI4eSJ9.prmjtbXfU8a3Xbcg2oSpQQ';

  useEffect(() => {
    if (!location || !mapContainer.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Set access token
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 12,
        center: [-74.0066, 40.7135], // Default to NYC
      });

      // Geocode the location
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&limit=1`;
      
      fetch(geocodeUrl)
        .then(response => response.json())
        .then(data => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            const placeName = data.features[0].place_name;

            if (map.current) {
              map.current.setCenter([lng, lat]);
              
              // Add marker
              const marker = new mapboxgl.Marker({
                color: '#0daeec'
              })
                .setLngLat([lng, lat])
                .addTo(map.current);

              // Add popup on click
              const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<div class="text-sm font-medium">${placeName}</div>`);

              marker.getElement().addEventListener('click', () => {
                popup.setLngLat([lng, lat]).addTo(map.current!);
              });
            }
            setIsLoading(false);
          } else {
            setError('Location not found');
            setIsLoading(false);
          }
        })
        .catch(() => {
          setError('Failed to load map');
          setIsLoading(false);
        });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (err) {
      setError('Failed to initialize map');
      setIsLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [location, mapboxToken]);

  // If no location provided
  if (!location) {
    return null;
  }

  // If error
  if (error) {
    return (
      <div className={`${className} border border-border rounded-lg p-4 bg-muted/50`} style={{ height }}>
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} border border-border rounded-lg overflow-hidden bg-muted/50`} style={{ height }}>
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading map...
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}
