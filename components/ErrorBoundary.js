// components/ErrorBoundary.js
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    // Hier zou je de error naar een monitoring service sturen
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Er ging iets mis</h2>
            <p className="text-gray-600 mb-6">
              Er is een fout opgetreden in de applicatie. Probeer de pagina te verversen.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <i className="fas fa-redo mr-2"></i>
                Pagina verversen
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <i className="fas fa-home mr-2"></i>
                Naar Dashboard
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
