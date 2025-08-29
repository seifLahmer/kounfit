
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Input } from './ui/input';
import { Loader2, MapPin, Search, X, LocateFixed } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 36.8065, // Tunis
  lng: 10.1815
};

const libraries: "places"[] = ["places"];

interface LocationPickerProps {
  initialAddress?: string | null;
  onLocationSelect: (address: string, region: string) => void;
  onClose: () => void;
}

export default function LocationPicker({ initialAddress, onLocationSelect, onClose }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [center, setCenter] = useState(defaultCenter);
  const [address, setAddress] = useState("Déplacement de la carte...");
  const [region, setRegion] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (initialAddress) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: initialAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
        }
      });
    } else {
        // Try to get user's current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
            }
        );
    }
  }, [initialAddress]);

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  };
  
  const onPlacesChanged = () => {
    if (searchBoxRef.current) {
        const places = searchBoxRef.current.getPlaces();
        const place = (places && places.length > 0) ? places[0] : null;
        if (place && place.geometry?.location) {
          const location = place.geometry.location;
          mapRef.current?.panTo(location);
        }
    }
  };

  const handleMapDrag = useCallback(() => {
    if (mapRef.current) {
      setIsGeocoding(true);
      const geocoder = new window.google.maps.Geocoder();
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter) {
        geocoder.geocode({ location: currentCenter }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setAddress(results[0].formatted_address);

            let newRegion = '';
            const addressComponents = results[0].address_components;
            const regionComponent = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
            if (regionComponent) {
              newRegion = regionComponent.long_name.toLowerCase().replace('governorate', '').trim();
            }
            setRegion(newRegion);

          } else {
            setAddress("Adresse introuvable");
          }
          setIsGeocoding(false);
        });
      }
    }
  }, []);

  const handleCurrentLocation = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapRef.current?.panTo(pos);
        },
        (error) => {
          console.error("Error getting current location", error);
        }
      );
    }
  };


  if (loadError) return <div>Erreur de chargement de la carte.</div>;

  return (
    <div className="relative w-full h-full">
      {!isLoaded ? (
        <div className="flex items-center justify-center h-full bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={15}
                onLoad={onMapLoad}
                onDragEnd={handleMapDrag}
                onZoomChanged={handleMapDrag}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
                }}
            >
            </GoogleMap>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <MapPin className="text-destructive h-10 w-10 drop-shadow-lg" />
            </div>
            
            <Button variant="ghost" size="icon" className="absolute top-4 right-14 bg-white/80 backdrop-blur-sm rounded-full" onClick={handleCurrentLocation}>
                <LocateFixed />
            </Button>


            <Card className="absolute bottom-4 left-4 right-4 shadow-lg rounded-2xl">
                <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                         <MapPin className="text-destructive h-6 w-6 mt-1 shrink-0" />
                        <div>
                             <p className="font-semibold text-base">{address}</p>
                             {isGeocoding && <p className="text-xs text-muted-foreground">Mise à jour...</p>}
                        </div>
                    </div>
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl" onClick={() => onLocationSelect(address, region)}>
                        Confirmer cette adresse
                    </Button>
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
