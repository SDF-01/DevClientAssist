import type { ClientApp } from '../types/revision'

export const CLIENT_APPS: ClientApp[] = [
  {
    id: 'training-simulator',
    name: 'Training Simulator',
    description: 'Interactive training and scenario-based learning platform',
  },
  {
    id: 'client-dashboard',
    name: 'Client Dashboard',
    description: 'Analytics and reporting dashboard for client operations',
  },
  {
    id: 'mobile-pwa',
    name: 'Mobile PWA',
    description: 'Progressive web app for field and mobile workflows',
  },
  {
    id: 'admin-portal',
    name: 'Admin Portal',
    description: 'Internal admin tools for user and content management',
  },
  {
    id: 'marketing-site',
    name: 'Marketing Site',
    description: 'Public marketing and landing pages',
  },
]

export function getAppById(appId: string): ClientApp | undefined {
  return CLIENT_APPS.find((app) => app.id === appId)
}
