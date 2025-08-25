import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
        <p className="text-xl text-gray-600 mb-4">Page Not Found</p>
        <p className="text-gray-500 mb-6">
          Could not find the requested resource
        </p>
        <Link 
          href="/"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}