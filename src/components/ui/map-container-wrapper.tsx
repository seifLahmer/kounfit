
"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMemo, useRef } from 'react';

const DraggableMarker = ({ position, setPosition }: { position: L.LatLngExpression, setPosition: (pos: L.LatLng) => void }) => {
    const markerRef = useRef<L.Marker>(null);
    
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}>
        </Marker>
    );
};

interface MapContainerWrapperProps {
    center: L.LatLngExpression;
    zoom: number;
    setPosition: (pos: L.LatLng) => void;
}

const MapContainerWrapper = ({ center, zoom, setPosition }: MapContainerWrapperProps) => {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker position={center} setPosition={setPosition} />
        </MapContainer>
    );
};

export default MapContainerWrapper;
