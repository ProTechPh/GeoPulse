import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const MapClickHandler = ({ setLocation }) => {
  useMapEvents({
    click: (e) => {
      setLocation([e.latlng.lat, e.latlng.lng])
    }
  })
  return null
}

const IncidentForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 'medium',
    location: null
  })
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get user location using GPS (high accuracy)
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
          setFormData(prev => ({
            ...prev,
            location: [latitude, longitude]
          }))
          toast.success('Location detected! You can adjust by clicking on the map.')
        },
        (error) => {
          console.error('Error getting GPS location:', error.message)
          let errorMessage = 'Unable to get your GPS location. Please select on map.'
          
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied. Please allow location access and select on map.'
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'GPS location unavailable. Please select location on map.'
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Location request timed out. Please select location on map.'
          }
          
          toast.error(errorMessage)
        },
        geoOptions
      )
    } else {
      toast.error('Geolocation not supported. Please select location on map.')
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setUploading(true)
    const uploadPromises = files.map(file => {
      const formData = new FormData()
      formData.append('image', file)
      return api.post('/incidents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    try {
      const results = await Promise.all(uploadPromises)
      const uploadedImages = results.map(r => r.data.data)
      setImages([...images, ...uploadedImages])
      toast.success('Images uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload images')
    }
    setUploading(false)
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.location) {
      toast.error('Please select a location on the map')
      return
    }

    setLoading(true)

    try {
      await api.post('/incidents', {
        ...formData,
        images,
        location: {
          latitude: formData.location[0],
          longitude: formData.location[1]
        }
      })

      toast.success('Incident reported successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to report incident')
    }

    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Report Incident</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Incident Details</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Brief description of incident"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="input"
                    placeholder="Provide detailed information about the incident"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">Select category</option>
                      <option value="fire">Fire</option>
                      <option value="flood">Flood</option>
                      <option value="crime">Crime</option>
                      <option value="accident">Accident</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                      Severity *
                    </label>
                    <select
                      id="severity"
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Location</h2>
              <p className="text-sm text-gray-600 mb-4">
                Click on the map to select the incident location
              </p>
              {formData.location ? (
                <div className="h-96 rounded-lg overflow-hidden border">
                  <MapContainer
                    center={formData.location}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler setLocation={(loc) => setFormData({ ...formData, location: loc })} />
                    <Marker position={formData.location} />
                  </MapContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Loading map...</p>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-xl font-bold mb-4">Photos (Optional)</h2>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || images.length >= 5}
                  className="input"
                />
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="btn-primary flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default IncidentForm
