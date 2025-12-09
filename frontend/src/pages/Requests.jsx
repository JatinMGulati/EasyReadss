import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Requests.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function Requests() {
  const { currentUser } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    bookName: '',
    author: '',
    ISBN: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentUser) {
      fetchRequests()
    }
  }, [currentUser])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/book-requests/user/${currentUser.uid}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/book-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookName: formData.bookName,
          author: formData.author,
          ISBN: formData.ISBN || undefined,
          requestedBy: currentUser.email,
          requestedByUid: currentUser.uid,
          status: 'pending',
        }),
      })

      if (response.ok) {
        setSuccess('Book request submitted successfully!')
        setFormData({ bookName: '', author: '', ISBN: '' })
        setShowForm(false)
        fetchRequests()
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to submit request')
      }
    } catch (err) {
      setError('Error submitting request. Please try again.')
      console.error('Error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4caf50'
      case 'rejected':
        return '#f44336'
      case 'pending':
        return '#ff9800'
      default:
        return '#757575'
    }
  }

  return (
    <div className="requests-page">
      <Navbar />
      <main className="requests-main">
        <div className="requests-content">
          <div className="requests-header">
            <h1 className="requests-title">Book Requests</h1>
            <p className="requests-subtitle">
              Request books that are not available in our library
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="requests-add-btn"
            >
              {showForm ? 'Cancel' : '+ Request a Book'}
            </button>
          </div>

          {error && (
            <div className="requests-alert requests-error">
              {error}
            </div>
          )}

          {success && (
            <div className="requests-alert requests-success">
              {success}
            </div>
          )}

          {showForm && (
            <div className="requests-form-container">
              <form onSubmit={handleSubmit} className="requests-form">
                <div className="form-group">
                  <label htmlFor="bookName">Book Name *</label>
                  <input
                    id="bookName"
                    type="text"
                    value={formData.bookName}
                    onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
                    required
                    placeholder="Enter book title"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input
                    id="author"
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    placeholder="Enter author name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ISBN">ISBN (Optional)</label>
                  <input
                    id="ISBN"
                    type="text"
                    value={formData.ISBN}
                    onChange={(e) => setFormData({ ...formData, ISBN: e.target.value })}
                    placeholder="Enter ISBN if known"
                  />
                </div>

                <button
                  type="submit"
                  className="requests-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>
          )}

          <div className="requests-list">
            <h2 className="requests-list-title">My Requests</h2>
            {loading ? (
              <div className="requests-loading">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="requests-empty">
                No requests yet. Click "Request a Book" to add one!
              </div>
            ) : (
              <div className="requests-grid">
                {requests.map((request) => (
                  <div key={request._id} className="request-card">
                    <div className="request-card-header">
                      <h3 className="request-book-name">{request.bookName}</h3>
                      <span
                        className="request-status"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="request-card-body">
                      <p className="request-author">
                        <strong>Author:</strong> {request.author}
                      </p>
                      {request.ISBN && (
                        <p className="request-isbn">
                          <strong>ISBN:</strong> {request.ISBN}
                        </p>
                      )}
                      <p className="request-date">
                        <strong>Requested:</strong>{' '}
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                      {request.adminNotes && (
                        <div className="request-notes">
                          <strong>Admin Notes:</strong>
                          <p>{request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Requests

