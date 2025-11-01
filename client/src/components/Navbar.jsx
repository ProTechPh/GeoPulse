import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
              GeoPulse
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/report"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Report Incident
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <Link
              to="/profile"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {user?.firstName} {user?.lastName}
            </Link>
            <button
              onClick={handleLogout}
              className="btn-secondary ml-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
