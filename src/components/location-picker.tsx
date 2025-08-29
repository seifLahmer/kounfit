
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Input } from './ui/input';
import { Loader2, MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 36.8065, // Tunis
  lng: 10.1815
};

const libraries: "places"[] = ["places"];

interface LocationPickerProps {
  initialAddress?: string;
  onLocationSelect: (address: string, region: string) => void;
}

export default function LocationPicker({ initialAddress, onLocationSelect }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [address, setAddress] = useState(initialAddress || "");
  const mapRef = useRef<google.maps.Map | null>(null);

  const geocodePosition = useCallback((pos: google.maps.LatLngLiteral) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const formattedAddress = results[0].formatted_address;
        setAddress(formattedAddress);
        
        let region = '';
        const addressComponents = results[0].address_components;
        const regionComponent = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
        if (regionComponent) {
          region = regionComponent.long_name.toLowerCase().replace('governorate', '').trim();
        }
        
        onLocationSelect(formattedAddress, region);
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  }, [onLocationSelect]);
  
  const geocodeAddress = useCallback((addressString: string) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: addressString }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newPos = { lat: location.lat(), lng: location.lng() };
        setMarkerPosition(newPos);
        mapRef.current?.panTo(newPos);
      }
    });
  }, []);

  useEffect(() => {
    if (isLoaded && initialAddress) {
        geocodeAddress(initialAddress);
    }
  }, [isLoaded, initialAddress, geocodeAddress]);


  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (initialAddress) {
        geocodeAddress(initialAddress);
    }
  }, [initialAddress, geocodeAddress]);

  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
        const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setMarkerPosition(newPos);
        geocodePosition(newPos);
    }
  };

  const handleInputBlur = () => {
    if(address) {
        geocodeAddress(address);
    }
  };

  if (loadError) {
    return <div>Erreur de chargement de la carte. Vérifiez la clé API.</div>;
  }

  return isLoaded ? (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
        <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={handleInputBlur}
            placeholder="Rechercher ou glisser le marqueur"
            className="pl-10"
        />
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition}
        zoom={12}
        onLoad={onMapLoad}
        options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
        }}
      >
        <Marker 
          position={markerPosition} 
          draggable={true}
          onDragEnd={onMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  ) : (
    <div className="flex items-center justify-center h-[250px] bg-muted rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
