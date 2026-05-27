export interface MonitoredService {
  name: string;
  url: string;
  timeout?: number; // Optional custom timeout per service

}

const rawJsonEnv = process.env.MONITORED_SERVICES_JSON;

function loadServices(): MonitoredService[] {
  if (!rawJsonEnv) {
    // Local fallback list if environment variable is not set
    return [{ name: 'google-fallback', url: 'https://google.com' }];
  }

  try {
    // Parse the JSON array directly from memory
    return JSON.parse(rawJsonEnv) as MonitoredService[];
  } catch (error) {
    // Prevents app from crashing on Render if there is a syntax error in the JSON string
    console.error('🚨 CRITICAL: Invalid JSON string provided in MONITORED_SERVICES_JSON', error);
    return [{ name: 'config-error-fallback', url: 'https://google.com' }];
  }
}

export const MONITORED_SERVICES: MonitoredService[] = loadServices();

