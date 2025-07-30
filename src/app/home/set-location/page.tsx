
"use client"

import { useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import dynamic from 'next/dynamic';


// Leaflet's default icon doesn't work well with bundlers, so we fix it.
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dynamically import the map component to ensure it's only rendered on the client side.
const MapContainerWrapper = dynamic(() => import('@/components/ui/map-container-wrapper'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>
});


function SetLocationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState<L.LatLng>(new L.LatLng(36.8065, 10.1815)); // Default to Tunis

    const handleConfirmLocation = async () => {
        setLoading(true);
        try {
            // Reverse geocode the coordinates to get an address
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
            if (!response.ok) {
                throw new Error("Failed to fetch address from coordinates.");
            }
            const data = await response.json();
            const address = data.display_name || `Lat: ${position.lat.toFixed(4)}, Lon: ${position.lng.toFixed(4)}`;

            localStorage.setItem('selectedDeliveryAddress', address);
            
            toast({
                title: "Adresse confirmée",
                description: address,
            });

            setTimeout(() => {
                router.back();
            }, 300);

        } catch (error) {
            console.error("Reverse geocoding error:", error);
            toast({
                title: "Erreur",
                description: "Impossible de récupérer l'adresse pour cet emplacement.",
                variant: "destructive"
            });
            setLoading(false);
        }
    }

    return (
        <div className="relative h-screen w-screen flex flex-col bg-gray-200">
             <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
                <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-md" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-2 px-4 shadow-md text-center max-w-md truncate">
                    <p className="font-semibold text-sm">Déplacez le marqueur ou cliquez sur la carte</p>
                </div>
            </header>

            <div className="flex-grow z-10">
                 <MapContainerWrapper center={position} zoom={13} setPosition={setPosition} />
            </div>

            <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/20 to-transparent">
                <Button 
                    size="lg" 
                    className="w-full bg-destructive hover:bg-destructive/90 rounded-full h-14 text-lg"
                    onClick={handleConfirmLocation}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Confirmer cet emplacement"}
                </Button>
            </footer>
        </div>
    )
}

export default dynamic(() => Promise.resolve(SetLocationPage), { ssr: false });
