import React from 'react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={`neumorphic-toggle ${theme === 'dark' ? 'dark' : ''} ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="neumorphic-thumb">
        <i className={`bi ${theme === 'dark' ? 'bi-moon-stars' : 'bi-sun'} neumorphic-icon`}></i>
      </div>
    </button>
  )
}

export default ThemeToggle
