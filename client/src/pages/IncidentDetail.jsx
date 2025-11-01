import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const IncidentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchIncident()
  }, [id])

  const fetchIncident = async () => {
    try {
      const response = await api.get(`/incidents/${id}`)
      setIncident(response.data.data)
      setStatus(response.data.data.status)
    } catch (error) {
      toast.error('Failed to load incident')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/incidents/${id}`, { status, note: note ? { text: note } : null })
      toast.success('Incident updated successfully')
      fetchIncident()
      setNote('')
    } catch (error) {
      toast.error('Failed to update incident')
    }
  }

  if (loading || !incident) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading incident...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>

          <div className="card mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{incident.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
                {incident.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                incident.severity === 'low' ? 'bg-green-100 text-green-800' :
                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                'bg-red-200 text-red-900'
              }`}>
                {incident.severity}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium capitalize">
                {incident.status}
              </span>
            </div>

            <p className="text-gray-700 mb-6">{incident.description}</p>

            <div className="text-sm text-gray-600">
              <p>Reported by: {incident.reportedBy?.firstName} {incident.reportedBy?.lastName}</p>
              <p>Reported on: {new Date(incident.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {incident.images && incident.images.length > 0 && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {incident.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`Incident ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={[incident.location.coordinates[1], incident.location.coordinates[0]]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[incident.location.coordinates[1], incident.location.coordinates[0]]}>
                  <Popup>{incident.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {(user?.role === 'admin' || user?.role === 'responder') && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Update Incident</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input"
                  >
                    <option value="pending">Pending</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="input"
                    placeholder="Add any additional information..."
                  />
                </div>

                <button onClick={handleStatusUpdate} className="btn-primary">
                  Update Incident
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default IncidentDetail
