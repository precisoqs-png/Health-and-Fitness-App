import { Navigate } from 'react-router-dom'

// After login, the home page should go straight to the dashboard
export default function Home() {
  return <Navigate to="/dashboard" replace />
}
