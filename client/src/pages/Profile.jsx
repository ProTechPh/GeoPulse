import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    notificationRadius: 5000,
    incidentTypes: []
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        notificationRadius: user.notificationPreferences?.radius || 5000,
        incidentTypes: user.notificationPreferences?.incidentTypes || []
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'notificationRadius') {
      setFormData({ ...formData, [name]: parseInt(value) })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleIncidentTypeToggle = (type) => {
    setFormData(prev => ({
      ...prev,
      incidentTypes: prev.incidentTypes.includes(type)
        ? prev.incidentTypes.filter(t => t !== type)
        : [...prev.incidentTypes, type]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      notificationPreferences: {
        radius: formData.notificationRadius,
        incidentTypes: formData.incidentTypes,
        enabled: true
      }
    })

    if (result.success) {
      toast.success('Profile updated successfully')
    } else {
      toast.error(result.message)
    }

    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">Personal Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role?.toUpperCase() || ''}
                  disabled
                  className="input bg-gray-100 cursor-not-allowed capitalize"
                />
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notification Radius (meters)
                  </label>
                  <input
                    type="number"
                    name="notificationRadius"
                    value={formData.notificationRadius}
                    onChange={handleChange}
                    min="1000"
                    max="50000"
                    step="1000"
                    className="input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You'll receive notifications for incidents within {(formData.notificationRadius / 1000).toFixed(1)} km
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Types to Notify (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['fire', 'flood', 'crime', 'accident', 'infrastructure', 'other'].map(type => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.incidentTypes.includes(type)}
                          onChange={() => handleIncidentTypeToggle(type)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile
