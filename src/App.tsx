import './App.css'
import AppRoutes from './Routes/Routes'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
function App() {

  return (
    <>
      <Router>
        <AuthProvider>
        <AppRoutes/>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
