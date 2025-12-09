import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../utils/admin'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Admin.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const BOOK_COLLECTIONS = [
  { name: 'books', label: 'Books', endpoint: 'books' },
  { name: 'ebooks', label: 'E-Books', endpoint: 'ebooks' },
  { name: 'audiobooks', label: 'Audiobooks', endpoint: 'audiobooks' },
  { name: 'fiction', label: 'Fiction', endpoint: 'fiction' },
  { name: 'science', label: 'Science', endpoint: 'science' },
  { name: 'biography', label: 'Biography', endpoint: 'biography' },
  { name: 'fantasy', label: 'Fantasy', endpoint: 'fantasy' },
  { name: 'history', label: 'History', endpoint: 'history' },
  { name: 'technology', label: 'Technology', endpoint: 'technology' },
  { name: 'romance', label: 'Romance', endpoint: 'romance' },
]

function Admin() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('requests')
  
  // Book Requests State
  const [requests, setRequests] = useState([])
  const [requestFilter, setRequestFilter] = useState('all')
  const [requestsLoading, setRequestsLoading] = useState(true)
  
  // Book Management State
  const [selectedCollection, setSelectedCollection] = useState('books')
  const [books, setBooks] = useState([])
  const [booksLoading, setBooksLoading] = useState(false)
  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [bookFormData, setBookFormData] = useState({
    name: '',
    ISBN: '',
    author: '',
    image_link: '',
    amazon_link: '',
    narrator: '',
  })

  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (!isAdmin(currentUser.email)) {
      navigate('/home')
      return
    }
  }, [currentUser, navigate])

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests()
    } else if (activeTab === 'books') {
      fetchBooks()
    }
  }, [activeTab, selectedCollection, requestFilter])

  // Book Requests Functions
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true)
      const url = requestFilter === 'all' 
        ? `${API_BASE_URL}/book-requests`
        : `${API_BASE_URL}/book-requests?status=${requestFilter}`
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  const updateRequestStatus = async (requestId, status, notes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/book-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, adminNotes: notes }),
      })
      if (response.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error('Error updating request status:', error)
    }
  }

  // Book Management Functions
  const fetchBooks = async () => {
    try {
      setBooksLoading(true)
      const collection = BOOK_COLLECTIONS.find(c => c.name === selectedCollection)
      const response = await fetch(`${API_BASE_URL}/${collection.endpoint}`)
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setBooksLoading(false)
    }
  }

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    try {
      const collection = BOOK_COLLECTIONS.find(c => c.name === selectedCollection)
      const url = editingBook
        ? `${API_BASE_URL}/${collection.endpoint}/${editingBook._id}`
        : `${API_BASE_URL}/${collection.endpoint}`
      
      const method = editingBook ? 'PUT' : 'POST'
      
      const bookData = { ...bookFormData }
      if (selectedCollection !== 'audiobooks') {
        delete bookData.narrator
      }
      if (selectedCollection === 'books') {
        // books require amazon_link
      } else if (['fiction', 'science', 'biography', 'fantasy', 'history', 'technology', 'romance'].includes(selectedCollection)) {
        delete bookData.amazon_link
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      })

      if (response.ok) {
        setShowBookForm(false)
        setEditingBook(null)
        setBookFormData({
          name: '',
          ISBN: '',
          author: '',
          image_link: '',
          amazon_link: '',
          narrator: '',
        })
        fetchBooks()
      }
    } catch (error) {
      console.error('Error saving book:', error)
    }
  }

  const handleEditBook = (book) => {
    setEditingBook(book)
    setBookFormData({
      name: book.name || '',
      ISBN: book.ISBN || '',
      author: book.author || '',
      image_link: book.image_link || '',
      amazon_link: book.amazon_link || '',
      narrator: book.narrator || '',
    })
    setShowBookForm(true)
  }

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    
    try {
      const collection = BOOK_COLLECTIONS.find(c => c.name === selectedCollection)
      const response = await fetch(`${API_BASE_URL}/${collection.endpoint}/${bookId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchBooks()
      }
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4caf50'
      case 'rejected': return '#f44336'
      case 'pending': return '#ff9800'
      default: return '#757575'
    }
  }

  if (!currentUser || !isAdmin(currentUser.email)) {
    return null
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-main">
        <div className="admin-content">
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Manage book requests and books</p>
          </div>

          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Book Requests
            </button>
            <button
              className={`admin-tab ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              Book Management
            </button>
          </div>

          {/* Book Requests Tab */}
          {activeTab === 'requests' && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Book Requests</h2>
                <div className="admin-filters">
                  <button
                    className={`filter-btn ${requestFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setRequestFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-btn ${requestFilter === 'pending' ? 'active' : ''}`}
                    onClick={() => setRequestFilter('pending')}
                  >
                    Pending
                  </button>
                  <button
                    className={`filter-btn ${requestFilter === 'approved' ? 'active' : ''}`}
                    onClick={() => setRequestFilter('approved')}
                  >
                    Approved
                  </button>
                  <button
                    className={`filter-btn ${requestFilter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setRequestFilter('rejected')}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {requestsLoading ? (
                <div className="admin-loading">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="admin-empty">No requests found</div>
              ) : (
                <div className="requests-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Book Name</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Requested By</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request._id}>
                          <td>{request.bookName}</td>
                          <td>{request.author}</td>
                          <td>{request.ISBN || 'N/A'}</td>
                          <td>{request.requestedBy}</td>
                          <td>
                            <span
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(request.status) }}
                            >
                              {request.status.toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(request.requestedAt).toLocaleDateString()}</td>
                          <td>
                            <div className="admin-actions">
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    className="action-btn approve-btn"
                                    onClick={() => updateRequestStatus(request._id, 'approved')}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="action-btn reject-btn"
                                    onClick={() => updateRequestStatus(request._id, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {request.status !== 'pending' && (
                                <button
                                  className="action-btn reset-btn"
                                  onClick={() => updateRequestStatus(request._id, 'pending')}
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Book Management Tab */}
          {activeTab === 'books' && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Book Management</h2>
                <div className="book-management-controls">
                  <select
                    className="collection-select"
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                  >
                    {BOOK_COLLECTIONS.map((collection) => (
                      <option key={collection.name} value={collection.name}>
                        {collection.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="admin-add-btn"
                    onClick={() => {
                      setEditingBook(null)
                      setBookFormData({
                        name: '',
                        ISBN: '',
                        author: '',
                        image_link: '',
                        amazon_link: '',
                        narrator: '',
                      })
                      setShowBookForm(true)
                    }}
                  >
                    + Add Book
                  </button>
                </div>
              </div>

              {showBookForm && (
                <div className="book-form-container">
                  <form onSubmit={handleBookSubmit} className="book-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Book Name *</label>
                        <input
                          type="text"
                          value={bookFormData.name}
                          onChange={(e) => setBookFormData({ ...bookFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>ISBN *</label>
                        <input
                          type="text"
                          value={bookFormData.ISBN}
                          onChange={(e) => setBookFormData({ ...bookFormData, ISBN: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Author *</label>
                        <input
                          type="text"
                          value={bookFormData.author}
                          onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                          required
                        />
                      </div>
                      {selectedCollection === 'audiobooks' && (
                        <div className="form-group">
                          <label>Narrator</label>
                          <input
                            type="text"
                            value={bookFormData.narrator}
                            onChange={(e) => setBookFormData({ ...bookFormData, narrator: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Image Link *</label>
                        <input
                          type="url"
                          value={bookFormData.image_link}
                          onChange={(e) => setBookFormData({ ...bookFormData, image_link: e.target.value })}
                          required
                        />
                      </div>
                      {(selectedCollection === 'books' || selectedCollection === 'ebooks' || selectedCollection === 'audiobooks') && (
                        <div className="form-group">
                          <label>Amazon Link {selectedCollection === 'books' ? '*' : ''}</label>
                          <input
                            type="url"
                            value={bookFormData.amazon_link}
                            onChange={(e) => setBookFormData({ ...bookFormData, amazon_link: e.target.value })}
                            required={selectedCollection === 'books'}
                          />
                        </div>
                      )}
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        {editingBook ? 'Update Book' : 'Add Book'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setShowBookForm(false)
                          setEditingBook(null)
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {booksLoading ? (
                <div className="admin-loading">Loading books...</div>
              ) : books.length === 0 ? (
                <div className="admin-empty">No books found in this collection</div>
              ) : (
                <div className="books-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Image</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book._id}>
                          <td>{book.name}</td>
                          <td>{book.author}</td>
                          <td className="isbn-cell">{book.ISBN}</td>
                          <td>
                            <img
                              src={book.image_link}
                              alt={book.name}
                              className="book-thumbnail"
                              onError={(e) => {
                                e.target.src = '/placeholder-book.jpg'
                              }}
                            />
                          </td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="action-btn edit-btn"
                                onClick={() => handleEditBook(book)}
                              >
                                Edit
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteBook(book._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Admin
