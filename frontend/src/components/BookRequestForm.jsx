import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './BookRequestForm.css'

function BookRequestForm({ onSuccess, onClose }) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    requesterEmail: currentUser?.email || '',
    requesterName: currentUser?.displayName || '',
    isbn: '',
    genre: 'Other',
    publishYear: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Book title is required')
      return false
    }
    if (!formData.author.trim()) {
      setError('Author name is required')
      return false
    }
    if (!formData.requesterEmail.trim()) {
      setError('Email address is required')
      return false
    }
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(formData.requesterEmail)) {
      setError('Please provide a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          author: formData.author.trim(),
          description: formData.description.trim(),
          requesterEmail: formData.requesterEmail.trim(),
          requesterName: formData.requesterName.trim() || 'Anonymous',
          isbn: formData.isbn.trim() || undefined,
          genre: formData.genre,
          publishYear: formData.publishYear ? parseInt(formData.publishYear) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Failed to submit request')
        return
      }

      setSuccess('Book request submitted successfully! Admins will review it soon.')
      setFormData({
        title: '',
        author: '',
        description: '',
        requesterEmail: currentUser?.email || '',
        requesterName: currentUser?.displayName || '',
        isbn: '',
        genre: 'Other',
        publishYear: '',
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(data.data)
      }

      // Auto-close after 3 seconds
      setTimeout(() => {
        if (onClose) {
          onClose()
        }
      }, 3000)
    } catch (err) {
      console.error('Error submitting request:', err)
      setError('An error occurred while submitting your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="book-request-form-container">
      <div className="book-request-form">
        <div className="form-header">
          <h2>Request a Book</h2>
          <p className="form-subtitle">Can't find a book you're looking for? Request it and admins will consider adding it!</p>
        </div>

        {error && (
          <div className="form-alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="form-alert alert-success">
            <span className="alert-icon">✅</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-content">
          {/* Book Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Book Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., The Silent Patient"
              className="form-input"
              required
              maxLength={200}
            />
            <small className="char-count">{formData.title.length}/200</small>
          </div>

          {/* Author */}
          <div className="form-group">
            <label htmlFor="author" className="form-label">
              Author <span className="required">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g., Alex Michaelides"
              className="form-input"
              required
              maxLength={100}
            />
          </div>

          {/* Genre */}
          <div className="form-group">
            <label htmlFor="genre" className="form-label">
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="form-input"
            >
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Mystery">Mystery</option>
              <option value="Romance">Romance</option>
              <option value="Science Fiction">Science Fiction</option>
              <option value="Fantasy">Fantasy</option>
              <option value="Biography">Biography</option>
              <option value="History">History</option>
              <option value="Technology">Technology</option>
              <option value="Science">Science</option>
              <option value="Audiobook">Audiobook</option>
              <option value="E-Book">E-Book</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* ISBN & Publish Year Row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="isbn" className="form-label">
                ISBN (Optional)
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="978-1234567890"
                className="form-input"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label htmlFor="publishYear" className="form-label">
                Publication Year (Optional)
              </label>
              <input
                type="number"
                id="publishYear"
                name="publishYear"
                value={formData.publishYear}
                onChange={handleChange}
                placeholder={new Date().getFullYear()}
                className="form-input"
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us why you'd like this book added..."
              className="form-input form-textarea"
              maxLength={1000}
              rows={4}
            />
            <small className="char-count">{formData.description.length}/1000</small>
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="requesterEmail" className="form-label">
              Your Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="requesterEmail"
              name="requesterEmail"
              value={formData.requesterEmail}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="form-input"
              required
            />
            <small className="form-help">We'll use this to notify you when the book is added (optional)</small>
          </div>

          {/* Requester Name */}
          <div className="form-group">
            <label htmlFor="requesterName" className="form-label">
              Your Name (Optional)
            </label>
            <input
              type="text"
              id="requesterName"
              name="requesterName"
              value={formData.requesterName}
              onChange={handleChange}
              placeholder="Your name"
              className="form-input"
              maxLength={100}
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="form-info">
          <p>💡 <strong>Tip:</strong> The more details you provide, the better admins can help fulfill your request!</p>
        </div>
      </div>
    </div>
  )
}

export default BookRequestForm
