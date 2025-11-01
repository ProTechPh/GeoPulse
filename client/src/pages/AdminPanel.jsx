import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingIncidents: 0,
    resolvedToday: 0,
    totalUsers: 0
  })
  const [incidents, setIncidents] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentIncidents()
    fetchUsers()
  }, [])

  const fetchStats = async () => {
    try {
      const [incidentsRes, usersRes] = await Promise.all([
        api.get('/incidents?limit=1000'),
        api.get('/users?limit=1000')
      ])

      const allIncidents = incidentsRes.data.data
      const today = new Date().toDateString()

      setStats({
        totalIncidents: allIncidents.length,
        pendingIncidents: allIncidents.filter(i => i.status === 'pending').length,
        resolvedToday: allIncidents.filter(i => 
          i.status === 'resolved' && new Date(i.resolvedAt).toDateString() === today
        ).length,
        totalUsers: usersRes.data.data.length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentIncidents = async () => {
    try {
      const response = await api.get('/incidents?limit=10&sort=-createdAt')
      setIncidents(response.data.data)
    } catch (error) {
      console.error('Error fetching incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) {
      return
    }

    try {
      await api.delete(`/incidents/${id}`)
      toast.success('Incident deleted successfully')
      fetchRecentIncidents()
      fetchStats()
    } catch (error) {
      toast.error('Failed to delete incident')
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Incidents</h3>
              <p className="text-3xl font-bold text-primary-600">{stats.totalIncidents}</p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingIncidents}</p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Resolved Today</h3>
              <p className="text-3xl font-bold text-green-600">{stats.resolvedToday}</p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Recent Incidents</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incidents.map((incident) => (
                      <tr key={incident._id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {incident.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                          {incident.category}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleDeleteIncident(incident._id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Users */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium capitalize bg-primary-100 text-primary-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPanel
