import express from 'express';
import * as bookController from '../controllers/bookController.js';

const router = express.Router();

/**
 * ============================================
 * BASIC CRUD ROUTES
 * ============================================
 */

// GET all books with filtering and search
router.get('/books', bookController.getAllBooks);

// GET single book by ID
router.get('/books/:id', bookController.getBookById);

// CREATE new book
router.post('/books', bookController.createBook);

// UPDATE entire book
router.put('/books/:id', bookController.updateBook);

// PATCH (partial update) book
router.patch('/books/:id', bookController.patchBook);

// DELETE single book
router.delete('/books/:id', bookController.deleteBook);

// DELETE multiple books
router.delete('/books', bookController.deleteMultipleBooks);

/**
 * ============================================
 * SEARCH & FILTER ROUTES
 * ============================================
 */

// Search books by title, author, description
router.get('/search/books', bookController.searchBooks);

// Get books by genre with pagination
router.get('/genre/:genre', bookController.getBooksByGenre);

// Get books by author
router.get('/author/:author', bookController.getBooksByAuthor);

// Get trending/top-rated books
router.get('/trending', bookController.getTrendingBooks);

// Get featured books
router.get('/featured', bookController.getFeaturedBooks);

// Get available books (in stock)
router.get('/available', bookController.getAvailableBooks);

// Get books by rating range
router.get('/rating', bookController.getBooksByRating);

// Get books by price range
router.get('/price-range', bookController.getBooksByPriceRange);

// Get books by publication year
router.get('/year/:year', bookController.getBooksByYear);

/**
 * ============================================
 * STATISTICS & ANALYTICS ROUTES
 * ============================================
 */

// Get book statistics and aggregated data
router.get('/stats', bookController.getBookStats);

// Update book rating
router.put('/books/:id/rating', bookController.updateBookRating);

// Increment download count
router.put('/books/:id/increment-downloads', bookController.incrementDownloads);

/**
 * ============================================
 * BULK OPERATIONS ROUTES
 * ============================================
 */

// Bulk import books
router.post('/bulk-import', bookController.bulkImportBooks);

export default router;
