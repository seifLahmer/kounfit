
"use client";

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Loader2, MapPin, Navigation } from 'lucide-react';
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

interface LocationInfo {
  address: string;
  region: string;
}

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

  const [mapCenterLocation, setMapCenterLocation] = useState<LocationInfo | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isPointSelected, setIsPointSelected] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const getRegionFromComponents = (components: google.maps.GeocoderAddressComponent[]): string => {
      const regionComponent = components.find(c => c.types.includes('administrative_area_level_1'));
      if (regionComponent) {
          const regionName = regionComponent.long_name.toLowerCase().replace('governorate', '').trim();
          const grandTunisRegions = ['tunis', 'ariana', 'ben arous', 'manouba'];
          if (grandTunisRegions.includes(regionName)) {
              return 'grand tunis';
          }
          return regionName;
      }
      return "";
  }

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
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
            map.setCenter(pos);
        });
    }
  }, [initialAddress]);

  const handleMapInteractionEnd = useCallback(() => {
    if (isPointSelected) {
      setIsPointSelected(false);
      setMapCenterLocation(null);
    }
  }, [isPointSelected]);

  const handleUseThisPoint = () => {
    if (mapRef.current) {
      setIsGeocoding(true);
      setIsPointSelected(false);
      const geocoder = new window.google.maps.Geocoder();
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter) {
        geocoder.geocode({ location: currentCenter }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setMapCenterLocation({
              address: results[0].formatted_address,
              region: getRegionFromComponents(results[0].address_components)
            });
            setIsPointSelected(true);
          } else {
            setMapCenterLocation({ address: "Adresse introuvable", region: "" });
          }
          setIsGeocoding(false);
        });
      }
    }
  };
  
  const handleCurrentLocation = () => {
    if (navigator.geolocation && mapRef.current) {
        setIsGeocoding(true);
        setIsPointSelected(false);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                mapRef.current?.panTo(pos);

                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: pos }, (results, status) => {
                    if (status === 'OK' && results && results[0]) {
                        const locationInfo = {
                          address: results[0].formatted_address,
                          region: getRegionFromComponents(results[0].address_components)
                        };
                        setMapCenterLocation(locationInfo);
                        setIsPointSelected(true);
                    }
                    setIsGeocoding(false);
                });
            },
            (error) => {
                console.error("Error getting current location", error);
                setIsGeocoding(false);
            }
        );
    }
  };

  if (loadError) return <div>Erreur de chargement de la carte. Assurez-vous que la clé API Google Maps est correctement configurée dans votre fichier .env.local (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).</div>;

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
                center={defaultCenter}
                zoom={15}
                onLoad={onMapLoad}
                onDragEnd={handleMapInteractionEnd}
                onZoomChanged={handleMapInteractionEnd}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: false,
                    gestureHandling: 'greedy'
                }}
            >
            </GoogleMap>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                 <Button 
                    size="sm" 
                    className="pointer-events-auto mb-2 bg-white text-black shadow-lg hover:bg-gray-100" 
                    onClick={handleUseThisPoint}
                    disabled={isGeocoding || isPointSelected}
                  >
                    {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin"/> : "Utiliser ce point"}
                  </Button>
                <MapPin className="text-destructive h-10 w-10 drop-shadow-lg" />
            </div>
            
             <Button 
                className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full text-black hover:bg-white" 
                onClick={handleCurrentLocation}
                disabled={isGeocoding}
            >
                <Navigation className="mr-2 h-4 w-4" />
                Utiliser votre localisation
            </Button>

            {isPointSelected && mapCenterLocation && (
              <Card className="absolute bottom-4 left-4 right-4 shadow-lg rounded-2xl animate-in fade-in slide-in-from-bottom">
                  <CardContent className="p-4 space-y-3">
                      <div>
                          <div className="flex items-start gap-3">
                               <MapPin className="text-destructive h-6 w-6 mt-1 shrink-0" />
                              <div>
                                   <p className="font-semibold text-base">{mapCenterLocation.address}</p>
                                   {isGeocoding && <p className="text-xs text-muted-foreground">Mise à jour...</p>}
                              </div>
                          </div>
                          <Button className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl mt-2" onClick={() => onLocationSelect(mapCenterLocation.address, mapCenterLocation.region)} disabled={isGeocoding || !mapCenterLocation.address || mapCenterLocation.address === "Adresse introuvable"}>
                              Confirmer cette adresse
                          </Button>
                      </div>
                  </CardContent>
              </Card>
            )}
        </>
      )}
    </div>
  );
}
