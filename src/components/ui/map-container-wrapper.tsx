
"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useMemo, useRef, useState, useEffect } from 'react';

const DraggableMarker = ({ position, onPositionChange }: { position: L.LatLngExpression, onPositionChange: (pos: L.LatLng) => void }) => {
    const markerRef = useRef<L.Marker>(null);
    const [currentPosition, setCurrentPosition] = useState(position);

    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setCurrentPosition(newPos);
            onPositionChange(newPos);
            map.flyTo(newPos, map.getZoom());
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const newPos = marker.getLatLng();
                    setCurrentPosition(newPos);
                    onPositionChange(newPos);
                }
            },
        }),
        [onPositionChange],
    );

    useEffect(() => {
        // This effect ensures the marker's position is updated if the initial prop changes,
        // although in our flow, it's primarily set once.
        const marker = markerRef.current;
        if (marker) {
            marker.setLatLng(position);
        }
    }, [position]);

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={currentPosition}
            ref={markerRef}>
        </Marker>
    );
};

interface MapContainerWrapperProps {
    center: L.LatLngExpression;
    zoom: number;
    onPositionChange: (pos: L.LatLng) => void;
}

const MapContainerWrapper = ({ center, zoom, onPositionChange }: MapContainerWrapperProps) => {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker position={center} onPositionChange={onPositionChange} />
        </MapContainer>
    );
};

export default MapContainerWrapper;
