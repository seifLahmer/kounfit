
"use client"

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SetLocationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleConfirmLocation = () => {
        setLoading(true);
        // In a real app, you would get the coordinates from the map's center.
        // For this placeholder, we'll use a hardcoded address.
        const fakeAddress = "Avenue Habib Bourguiba, Tunis, Tunisie";

        // Use localStorage to pass the address back to the cart page
        localStorage.setItem('selectedDeliveryAddress', fakeAddress);
        
        toast({
            title: "Adresse confirmée",
            description: fakeAddress,
        });

        // Simulate a small delay then redirect back
        setTimeout(() => {
            router.back();
            setLoading(false);
        }, 500);
    }

    return (
        <div className="relative h-screen w-screen flex flex-col bg-gray-200">
             <header className="absolute top-0 left-0 right-0 z-20 p-4">
                <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-md" onClick={() => router.back()}>
                    <ChevronLeft />
                </Button>
            </header>

            <div className="flex-grow relative">
                {/* Placeholder Map Image */}
                <Image
                    src="https://placehold.co/800x1200.png"
                    alt="Map placeholder"
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint="city map"
                />

                {/* Central Map Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                     <MapPin className="w-12 h-12 text-destructive drop-shadow-lg" />
                     <div className="w-3 h-3 bg-destructive rounded-full -mt-2 shadow-md"></div>
                </div>
            </div>

            <footer className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/20 to-transparent">
                <Button 
                    size="lg" 
                    className="w-full bg-destructive hover:bg-destructive/90 rounded-full h-14 text-lg"
                    onClick={handleConfirmLocation}
                    disabled={loading}
                >
                    Confirmer cet emplacement
                </Button>
            </footer>
        </div>
    )
}
