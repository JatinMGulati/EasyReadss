import { useEffect, useState } from "react";
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './DigitalBooks.css'

function DigitalBooks() {
  const [ebooks, setEbooks] = useState([]);
  const [audiobooks, setAudiobooks] = useState([]);
  const [ebookStartIndex, setEbookStartIndex] = useState(0);
  const [audiobookStartIndex, setAudiobookStartIndex] = useState(0);
  const [isLoadingEBooks, setIsLoadingEBooks] = useState(false);
  const [isLoadingAudiobooks, setIsLoadingAudiobooks] = useState(false);

  const MAX_RESULTS = 12;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

  const fetchDigitalContent = async (type, startIndex) => {
    try {
      const url =
        type === "ebooks"
          ? `https://www.googleapis.com/books/v1/volumes?q=filter=ebooks&startIndex=${startIndex}&maxResults=${MAX_RESULTS}&key=${API_KEY}`
          : `https://www.googleapis.com/books/v1/volumes?q=subject:audiobooks&startIndex=${startIndex}&maxResults=${MAX_RESULTS}&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error fetching digital content:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchInitialContent = async () => {
      setIsLoadingEBooks(true);
      const initialEBooks = await fetchDigitalContent("ebooks", ebookStartIndex);
      setEbooks(initialEBooks);
      setIsLoadingEBooks(false);

      setIsLoadingAudiobooks(true);
      const initialAudiobooks = await fetchDigitalContent("audiobooks", audiobookStartIndex);
      setAudiobooks(initialAudiobooks);
      setIsLoadingAudiobooks(false);
    };

    fetchInitialContent();
  }, []);

  const loadMoreEBooks = async () => {
    setIsLoadingEBooks(true);
    const newIndex = ebookStartIndex + MAX_RESULTS;
    const newEBooks = await fetchDigitalContent("ebooks", newIndex);
    setEbooks((prev) => [...prev, ...newEBooks]);
    setEbookStartIndex(newIndex);
    setIsLoadingEBooks(false);
  };

  const loadMoreAudiobooks = async () => {
    setIsLoadingAudiobooks(true);
    const newIndex = audiobookStartIndex + MAX_RESULTS;
    const newAudiobooks = await fetchDigitalContent("audiobooks", newIndex);
    setAudiobooks((prev) => [...prev, ...newAudiobooks]);
    setAudiobookStartIndex(newIndex);
    setIsLoadingAudiobooks(false);
  };

  return (
    <div className="digital-books-page">
      <Navbar />
      <main className="digital-books-main">
        <div className="digital-books-content">
          <div className="digital-books-header">
            <h1 className="digital-books-title">Digital Content</h1>
          </div>

          {/* E-Books Section */}
          <section className="digital-section">
            <h2 className="digital-section-title ebook-title">E-Books</h2>
            <div className="digital-scroll-container">
              {ebooks.length === 0 && !isLoadingEBooks ? (
                <div className="digital-empty">No e-books available</div>
              ) : (
                <div className="digital-scroll-content">
                  {ebooks.map((book, index) => (
                    <div key={index} className="digital-book-card">
                      <img
                        src={book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/150"}
                        alt={book.volumeInfo?.title || "Book"}
                        className="digital-book-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="digital-book-info">
                        <h4 className="digital-book-title">
                          {book.volumeInfo?.title || "Untitled"}
                        </h4>
                        <p className="digital-book-author">
                          {book.volumeInfo?.authors?.join(", ") || "Unknown Author"}
                        </p>
                        {book.volumeInfo?.previewLink && (
                          <button
                            onClick={() => window.open(book.volumeInfo.previewLink, '_blank', 'noopener,noreferrer')}
                            className="digital-book-button ebook-button"
                          >
                            Preview
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="digital-load-more-container">
              <button
                onClick={loadMoreEBooks}
                className="digital-load-more-btn ebook-btn"
                disabled={isLoadingEBooks}
              >
                {isLoadingEBooks ? "Loading..." : "Load More E-Books"}
              </button>
            </div>
          </section>

          {/* Audiobooks Section */}
          <section className="digital-section">
            <h2 className="digital-section-title audiobook-title">Audiobooks</h2>
            <div className="digital-scroll-container">
              {audiobooks.length === 0 && !isLoadingAudiobooks ? (
                <div className="digital-empty">No audiobooks available</div>
              ) : (
                <div className="digital-scroll-content">
                  {audiobooks.map((book, index) => (
                    <div key={index} className="digital-book-card">
                      <img
                        src={book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/150"}
                        alt={book.volumeInfo?.title || "Book"}
                        className="digital-book-image"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                      />
                      <div className="digital-book-info">
                        <h4 className="digital-book-title">
                          {book.volumeInfo?.title || "Untitled"}
                        </h4>
                        <p className="digital-book-author">
                          {book.volumeInfo?.authors?.join(", ") || "Unknown Author"}
                        </p>
                        {book.volumeInfo?.previewLink && (
                          <button
                            onClick={() => window.open(book.volumeInfo.previewLink, '_blank', 'noopener,noreferrer')}
                            className="digital-book-button audiobook-button"
                          >
                            Listen
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="digital-load-more-container">
              <button
                onClick={loadMoreAudiobooks}
                className="digital-load-more-btn audiobook-btn"
                disabled={isLoadingAudiobooks}
              >
                {isLoadingAudiobooks ? "Loading..." : "Load More Audiobooks"}
              </button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DigitalBooks;
