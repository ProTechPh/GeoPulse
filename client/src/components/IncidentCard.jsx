import { Link } from 'react-router-dom'

const severityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-200 text-red-900'
}

const IncidentCard = ({ incident }) => {
  return (
    <Link to={`/incidents/${incident._id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        {incident.images && incident.images.length > 0 && (
          <img
            src={incident.images[0].url}
            alt={incident.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {incident.title}
        </h3>
        <p className="text-gray-600 mb-3 line-clamp-2">
          {incident.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="capitalize text-sm text-gray-500">
            {incident.category}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${severityColors[incident.severity]}`}
          >
            {incident.severity}
          </span>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          Reported by {incident.reportedBy?.firstName} {incident.reportedBy?.lastName}
        </div>
      </div>
    </Link>
  )
}

export default IncidentCard
