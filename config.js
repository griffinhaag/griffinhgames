// Backend configuration
// Automatically detects environment and uses appropriate backend URL
(function() {
  'use strict';
  
  const BACKEND_CONFIG = {
    // Production: Use Fly.io backend URL
    production: 'https://griffinhgames-server.fly.dev',
    
    // Development: Use localhost
    development: 'http://localhost:3000'
  };

  // Detect environment
  const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.startsWith('192.168.');

  // Get the appropriate backend URL
  // You can override this by setting BACKEND_URL in your environment or manually here
  const BACKEND_URL = window.BACKEND_URL || 
                      (isProduction ? BACKEND_CONFIG.production : BACKEND_CONFIG.development);

  // Expose to window for use in other scripts
  window.BACKEND_URL = BACKEND_URL;
  window.isProduction = isProduction;
  window.BACKEND_CONFIG = BACKEND_CONFIG;
})();

