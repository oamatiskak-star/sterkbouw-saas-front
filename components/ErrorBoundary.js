// components/ErrorBoundary.js
import { Component } from 'react'
import { useRouter } from 'next/router'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />
    }

    return this.props.children
  }
}

function ErrorDisplay({ error }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-red-600 text-3xl"></i>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Oeps! Er ging iets mis</h1>
          <p className="text-gray-600 mb-6">
            Er is een onverwachte fout opgetreden. Onze technici zijn op de hoogte gesteld.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-redo"></i>
              Pagina verversen
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-home"></i>
              Naar Dashboard
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Debug informatie:</h3>
              <pre className="text-xs text-red-600 overflow-auto max-h-40">
                {error.toString()}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
