import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PublicSite } from './PublicSite'
import { AdminGuard } from './admin/AdminGuard'
import { AdminDashboard } from './admin/AdminDashboard'
import { LoginPage } from './admin/LoginPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
