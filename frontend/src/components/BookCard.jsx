import './BookCard.css'

function BookCard({ book, type = 'book' }) {
  // Get preview link - check multiple sources
  const getPreviewLink = () => {
    // Direct links
    if (book.amazon_link) return book.amazon_link
    if (book.previewLink) return book.previewLink
    if (book.volumeInfo?.previewLink) return book.volumeInfo.previewLink
    
    // Fallback: construct Amazon link from ISBN if available
    if (book.ISBN) {
      // Remove hyphens and spaces from ISBN
      const cleanISBN = book.ISBN.replace(/[-\s]/g, '')
      return `https://www.amazon.com/s?k=${cleanISBN}`
    }
    
    return null
  }

  const previewLink = getPreviewLink()

  const handlePreview = (e) => {
    e.stopPropagation() // Prevent card click if preview button is clicked
    if (previewLink) {
      window.open(previewLink, '_blank', 'noopener,noreferrer')
    } else {
      console.warn('No preview link available for book:', book.name || book.volumeInfo?.title)
    }
  }

  // Determine if it's an audiobook based on type or book properties
  const isAudiobook = type === 'audiobook' || book.type === 'audiobook'

  return (
    <div className="book-card">
      <div className="book-card-image-container">
        <img
          src={book.image_link || book.volumeInfo?.imageLinks?.thumbnail || '/placeholder-book.jpg'}
          alt={book.name || book.volumeInfo?.title || 'Book'}
          className="book-card-image"
          onError={(e) => {
            e.target.src = '/placeholder-book.jpg'
          }}
        />
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{book.name || book.volumeInfo?.title}</h3>
        <p className="book-card-author">{book.author || book.volumeInfo?.authors?.join(', ')}</p>
        {(isAudiobook || type === 'audiobook') && book.narrator && (
          <p className="book-card-narrator">Narrator: {book.narrator}</p>
        )}
        {/* Show preview button if any link exists (including fallback from ISBN) */}
        {previewLink && (
          <button 
            onClick={handlePreview} 
            className={`book-card-preview ${isAudiobook ? 'book-card-listen' : ''}`}
          >
            {isAudiobook ? 'Listen' : 'Preview'}
          </button>
        )}
      </div>
    </div>
  )
}

export default BookCard

