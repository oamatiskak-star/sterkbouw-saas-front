// Frontend/components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', // 'small' | 'medium' | 'large'
  color = 'primary', // 'primary' | 'secondary' | 'white'
  fullScreen = false,
  message = 'Laden...',
  showMessage = true
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const colorClasses = {
    primary: 'spinner-primary',
    secondary: 'spinner-secondary',
    white: 'spinner-white'
  };

  return (
    <div className={`loading-spinner-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="spinner-content">
        <div className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
          <div className="spinner-inner"></div>
        </div>
        
        {showMessage && message && (
          <div className="spinner-message">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export const SuperAdminLoadingSpinner = () => (
  <LoadingSpinner 
    size="large"
    color="primary"
    message="SUPER_ADMIN initialiseren..."
    showMessage={true}
    fullScreen={true}
  />
);

export default LoadingSpinner;
