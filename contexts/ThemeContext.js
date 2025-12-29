// contexts/ThemeContext.js
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    // Check localStorage voor theme
    const savedTheme = localStorage.getItem('theme') || 'light'
    const savedSidebarState = localStorage.getItem('sidebarCollapsed') === 'true'
    
    setTheme(savedTheme)
    setSidebarCollapsed(savedSidebarState)
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.remove(theme)
    document.documentElement.classList.add(newTheme)
  }

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', newState)
  }

  const value = {
    theme,
    sidebarCollapsed,
    toggleTheme,
    toggleSidebar,
    isDark: theme === 'dark'
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
