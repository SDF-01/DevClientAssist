import { CLIENT_APPS } from '../data/apps'

interface AppSelectorProps {
  value: string
  onChange: (appId: string) => void
}

export function AppSelector({ value, onChange }: AppSelectorProps) {
  const selectedApp = CLIENT_APPS.find((app) => app.id === value)

  return (
    <section className="field-group">
      <label htmlFor="target-app">Target application</label>
      <select
        id="target-app"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      >
        <option value="" disabled>
          Select an application
        </option>
        {CLIENT_APPS.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>
      {selectedApp ? <p className="field-description">{selectedApp.description}</p> : null}
    </section>
  )
}
