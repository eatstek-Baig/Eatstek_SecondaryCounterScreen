import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedAccess = () => {

  const navigate = useNavigate();

  const handleRetry = () => {
    console.log("Retry button clicked");

    const currentPath = window.location.hash;

    if (currentPath === '#/login') {
      console.log("Already on login page, refreshing...");
      window.location.reload(); // hard reload to reset everything
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div 
    style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: '#333333', // Light black
      padding: '1rem'
    }}
  >
    <div style={{ textAlign: 'center' }}>
      {/* UNAUTHORIZED - Extra large with peach color */}
      <h1 
        style={{ 
          fontSize: '5rem', // Much larger than before
          fontWeight: 'bold',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
          color: '#ffb7a5' // Peach color
        }}
      >
        UNAUTHORIZED
      </h1>
      
      {/* ACCESS - White text */}
      <h2 
        style={{ 
          fontSize: '1.875rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
          color: 'white'
        }}
      >
        ACCESS
      </h2>
      
      {/* Contact message */}
      <p 
        style={{ 
          fontStyle: 'italic',
          color: 'white',
          marginBottom: '2rem',
          fontSize: '1.125rem'
        }}
      >
        Please contact administrator for further assistance 99
      </p>
      
      {/* Retry button */}
      <button
        type="submit"
        onClick={handleRetry}
        style={{ 
          padding: '0.75rem 1.5rem',
          backgroundColor: 'white',
          color: 'black',
          fontWeight: '500',
          textTransform: 'uppercase',
          borderRadius: '0.375rem',
          transition: 'background-color 0.2s',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
      >
        RETRY
      </button>
    </div>
  </div>
  );
};

export default UnauthorizedAccess;