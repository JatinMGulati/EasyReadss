import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/admin'
import './Auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      setError('')
      setLoading(true)
      const userCredential = await login(email, password)
      
      // Check if email is verified
      if (userCredential && userCredential.user && !userCredential.user.emailVerified) {
        setError('Please verify your email before signing in. A verification email has been sent to your inbox.')
        setLoading(false)
        return
      }
      
      // Check if user is admin and redirect accordingly
      if (userCredential && isAdmin(userCredential.user.email)) {
        navigate('/admin')
      } else {
        navigate('/home')
      }
    } catch (err) {
      let errorMessage = 'Failed to sign in.'
      
      if (err.code === 'auth/api-key-not-valid') {
        errorMessage = 'Firebase API key is invalid. Please check your .env file and restart the dev server.'
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email format.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img 
            src="/ChatGPT Image Nov 9, 2025, 09_25_47 PM.png" 
            alt="EasyReads Logo" 
            className="logo"
          />
        </div>
        <h1 className="welcome-text">Welcome to EasyReads</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <span className="footer-text">Don't have an account? </span>
          <Link to="/signup" className="footer-link">Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default Login

