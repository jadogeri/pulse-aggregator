export interface MonitoredService {
  name: string;
  url: string;
  timeout?: number; // Optional custom timeout per service
}

export const MONITORED_SERVICES: MonitoredService[] = [
  { 
    name: 'new-orleans-food-spots-api', 
    url: 'https://nola-spots-api.onrender.com/health',
    timeout: 5000 
  },
  /*
  { 
    name: 'payment-processor', 
    url: 'https://yourdomain.com/health',
    timeout: 4000
  },
  { 
    name: 'inventory-database-api', 
    url: 'https://yourdomain.com/health' 
  }*/
];
