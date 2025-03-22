/**
 * Application configuration including API keys and service endpoints
 * 
 * All sensitive information should be loaded from environment variables
 * to prevent exposing them in code repositories
 */

// LINZ Data Service configuration
export const LINZ_CONFIG = {
    // API key should be loaded from environment variables
    API_KEY: process.env.NEXT_PUBLIC_LINZ_API_KEY || '',
    
    // Base URL for LINZ services
    BASE_URL: 'https://data.linz.govt.nz/services',
    
    // Default service endpoints
    ENDPOINTS: {
      WFS: '/wfs',
      CSW: '/csw'
    },
    
    // Default response format preferences (in order of preference)
    PREFERRED_FORMATS: [
      'application/json',
      'application/geo+json',
      'geojson',
      'json',
      'text/xml; subtype=gml/3.2'
    ]
  };
  
  // Application configuration
  export const APP_CONFIG = {
    // Default map settings
    MAP: {
      DEFAULT_VIEW: {
        longitude: 174.7633,  // Default to New Zealand
        latitude: -41.2889,
        height: 750000
      }
    },
    
    // Logging configuration
    LOGGING: {
      LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
    }
  };