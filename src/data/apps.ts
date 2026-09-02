import type { ClientApp } from '../types/revision'

export const CLIENT_APPS: ClientApp[] = [
  {
    id: 'airmen-voice',
    name: 'Airmen Voice',
    description: 'Voice and communication platform for airmen',
  },
]

export function getAppById(appId: string): ClientApp | undefined {
  return CLIENT_APPS.find((app) => app.id === appId)
}
