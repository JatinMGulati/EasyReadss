import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/admin'
import './Navbar.css'

function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const userIsAdmin = currentUser ? isAdmin(currentUser.email) : false

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Failed to log out', error)
    }
  }

  // If admin, show only admin link
  if (userIsAdmin) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/admin" className="navbar-logo">
            EasyReads Admin
          </Link>
          <div className="navbar-menu">
            <Link to="/admin" className="navbar-link admin-link">
              Admin Dashboard
            </Link>
            {currentUser && (
              <div className="navbar-user">
                <span className="navbar-welcome">Welcome, {currentUser.email}</span>
                <button onClick={handleLogout} className="navbar-logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    )
  }

  // Regular user navbar
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-logo">
          EasyReads
        </Link>
        <div className="navbar-menu">
          <Link to="/home" className="navbar-link">
            Home
          </Link>
          <Link to="/books" className="navbar-link">
            Books
          </Link>
          <Link to="/digital-books" className="navbar-link">
            Digital Books
          </Link>
          <Link to="/requests" className="navbar-link">
            Requests
          </Link>
          {currentUser && (
            <div className="navbar-user">
              <span className="navbar-welcome">Welcome, {currentUser.email}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

