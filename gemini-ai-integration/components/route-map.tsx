'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Place } from '@/lib/types'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Custom start marker (green)
const StartIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #22c55e;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">S</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Custom end marker (red)
const EndIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #ef4444;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">E</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Custom numbered marker for circuit stops
const getNumberedIcon = (number: number) => L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #c4956a;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">${number}</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Waypoint marker (small circle)
const WaypointIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #3b82f6;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

interface MapCenterProps {
  bounds: L.LatLngBoundsExpression
}

function MapBoundsController({ bounds }: MapCenterProps) {
  const map = useMap()
  
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [map, bounds])
  
  return null
}

interface RouteMapProps {
  waypoints: [number, number][]
  startPoint?: { name: string; coordinates: [number, number] }
  endPoint?: { name: string; coordinates: [number, number] }
  places?: Place[]
}

export function RouteMap({ waypoints, startPoint, endPoint, places }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Calculate bounds from all points
  const allPoints = [
    ...(startPoint ? [startPoint.coordinates] : []),
    ...waypoints,
    ...(endPoint ? [endPoint.coordinates] : []),
    ...(places?.map(p => p.coordinates) || [])
  ]

  const bounds = allPoints.length > 0
    ? L.latLngBounds(allPoints.map(p => [p[0], p[1]] as [number, number]))
    : L.latLngBounds([[31.6, -8.1], [31.7, -7.9]])

  // Calculate center
  const center: [number, number] = allPoints.length > 0
    ? [
        allPoints.reduce((sum, p) => sum + p[0], 0) / allPoints.length,
        allPoints.reduce((sum, p) => sum + p[1], 0) / allPoints.length
      ]
    : [31.6295, -7.9811]

  // Create path for polyline
  const pathCoordinates = places && places.length > 0
    ? places.map(p => p.coordinates)
    : waypoints

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="h-full w-full"
      zoomControl={true}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapBoundsController bounds={bounds} />

      {/* Route path line */}
      {pathCoordinates.length > 1 && (
        <Polyline
          positions={pathCoordinates}
          pathOptions={{
            color: '#c4956a',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10',
          }}
        />
      )}

      {/* If places are provided (circuit), show numbered markers */}
      {places && places.length > 0 ? (
        places.map((place, index) => (
          <Marker
            key={place.id}
            position={place.coordinates}
            icon={getNumberedIcon(index + 1)}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-foreground">{place.name}</h3>
                </div>
                {place.nameAr && (
                  <p className="text-xs text-muted-foreground">{place.nameAr}</p>
                )}
                <p className="text-xs mt-1 text-muted-foreground line-clamp-2">{place.description}</p>
              </div>
            </Popup>
          </Marker>
        ))
      ) : (
        <>
          {/* Start marker */}
          {startPoint && (
            <Marker position={startPoint.coordinates} icon={StartIcon}>
              <Popup>
                <div className="min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                      S
                    </div>
                    <div>
                      <p className="font-bold text-xs text-emerald-600">START</p>
                      <h3 className="font-semibold">{startPoint.name}</h3>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Waypoint markers (middle points) */}
          {waypoints.slice(1, -1).map((waypoint, index) => (
            <Marker key={index} position={waypoint} icon={WaypointIcon}>
              <Popup>
                <div className="text-xs text-center">
                  <p className="font-medium">Waypoint {index + 1}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* End marker */}
          {endPoint && (
            <Marker position={endPoint.coordinates} icon={EndIcon}>
              <Popup>
                <div className="min-w-[150px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                      E
                    </div>
                    <div>
                      <p className="font-bold text-xs text-red-600">END</p>
                      <h3 className="font-semibold">{endPoint.name}</h3>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </>
      )}

      {/* Legend */}
      <div className="leaflet-bottom leaflet-right" style={{ pointerEvents: 'auto' }}>
        <div className="leaflet-control bg-white rounded-lg shadow-lg p-2 mr-2 mb-2" style={{ zIndex: 1000 }}>
          <p className="text-xs font-semibold mb-1">via Leaflet.js</p>
        </div>
      </div>
    </MapContainer>
  )
}
