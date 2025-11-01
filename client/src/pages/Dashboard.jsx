import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import api from '../services/api'
import Navbar from '../components/Navbar'
import IncidentCard from '../components/IncidentCard'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const severityColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626'
}

const CenterMap = ({ position }) => {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView(position, 13)
    }
  }, [position, map])
  return null
}

const Dashboard = () => {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState([40.7128, -74.0060]) // Default location (NYC)
  const [filters, setFilters] = useState({
    category: '',
    severity: '',
    status: ''
  })

  const fetchIncidents = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.severity) params.append('severity', filters.severity)
      if (filters.status) params.append('status', filters.status)

      const response = await api.get(`/incidents?${params.toString()}`)
      setIncidents(response.data.data)
    } catch (error) {
      console.error('Error fetching incidents:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Get user location with GPS (high accuracy)
  useEffect(() => {
    if ('geolocation' in navigator) {
      const geoOptions = {
        enableHighAccuracy: true, // Use GPS instead of IP-based location
        timeout: 15000, // 15 second timeout to allow GPS to initialize
        maximumAge: 0 // Don't use cached location, always get fresh GPS reading
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords
          console.log('GPS location obtained:', { latitude, longitude, accuracy: `${accuracy}m` })
          setUserLocation([latitude, longitude])
        },
        (error) => {
          console.error('Error getting GPS location:', error.message)
          // Show user-friendly error message
          if (error.code === error.PERMISSION_DENIED) {
            console.warn('Location permission denied. Using default location.')
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            console.warn('Location unavailable. Using default location.')
          } else if (error.code === error.TIMEOUT) {
            console.warn('Location request timed out. Using default location.')
          }
          // Keep default location if GPS fails
        },
        geoOptions
      )
    } else {
      console.warn('Geolocation is not supported by this browser.')
    }
  }, [])

  // Fetch incidents when filters change
  useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading incidents...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Incident Dashboard</h1>
            <Link to="/report" className="btn-primary">
              + Report Incident
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input"
                >
                  <option value="">All Categories</option>
                  <option value="fire">Fire</option>
                  <option value="flood">Flood</option>
                  <option value="crime">Crime</option>
                  <option value="accident">Accident</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  className="input"
                >
                  <option value="">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="input"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mb-8 h-96 rounded-lg shadow-lg overflow-hidden">
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <CenterMap position={userLocation} />
              {incidents.map((incident) => (
                <Marker
                  key={incident._id}
                  position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold text-lg">{incident.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{incident.category}</p>
                      <span
                        className="inline-block px-2 py-1 text-xs font-bold rounded text-white"
                        style={{ backgroundColor: severityColors[incident.severity] }}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      <div className="mt-2">
                        <Link
                          to={`/incidents/${incident._id}`}
                          className="text-primary-600 text-sm hover:underline"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Incidents List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incidents.map((incident) => (
                <IncidentCard key={incident._id} incident={incident} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
