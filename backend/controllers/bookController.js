import Book from '../Model/BookSchema.js';
import { isAdminEmail } from '../middleware/adminAuth.js';

/**
 * ============================================
 * BOOK CRUD OPERATIONS - COMPREHENSIVE
 * ============================================
 * NOTE: CRUD operations (Create, Update, Delete) require admin authentication
 * Only users with admin emails can perform these operations
 */

/**
 * GET ALL BOOKS
 * Retrieve all books with pagination, filtering, and search
 * Query Parameters:
 * - page (default: 1): Page number for pagination
 * - limit (default: 10): Number of books per page
 * - genre: Filter by specific genre
 * - search: Search by title, author, or description
 * - sortBy: Sort by field (name, rating, createdAt, downloads)
 * - order: Sort order (asc, desc)
 */
export const getAllBooks = async (req, res, next) => {
  try {
    const { genre, page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter object
    let filter = {};

    if (genre) {
      filter.genre = genre;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query
    const books = await Book.find(filter)
      .limit(limitNum)
      .skip(skip)
      .sort(sortObj)
      .select('-__v');

    const total = await Book.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE BOOK BY ID
 * Retrieve a specific book by its MongoDB ID
 */
export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format',
      });
    }

    const book = await Book.findById(id).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Increment view count
    book.views = (book.views || 0) + 1;
    await book.save();

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE NEW BOOK
 * ⚠️ ADMIN ONLY - Only admins can add new books
 * Add a new book to the database
 * Required Fields: name, author, ISBN, image_link, amazon_link
 * Optional Fields: description, genre, pages, publishDate, etc.
 */
export const createBook = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can create books. Please login with an admin account.',
      });
    }

    const { name, author, ISBN, image_link, amazon_link, description, genre, pages, publishDate, publisher, language, price, discount, tags } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Book title (name) is required',
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Author name is required',
      });
    }

    if (!ISBN || !ISBN.trim()) {
      return res.status(400).json({
        success: false,
        message: 'ISBN is required',
      });
    }

    if (!image_link || !image_link.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Image link is required',
      });
    }

    if (!amazon_link || !amazon_link.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Amazon link is required',
      });
    }

    // Check for duplicate ISBN
    const existingBook = await Book.findOne({ ISBN });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists',
      });
    }

    // Create new book
    const book = new Book({
      name: name.trim(),
      author: author.trim(),
      ISBN: ISBN.trim(),
      image_link: image_link.trim(),
      amazon_link: amazon_link.trim(),
      description: description ? description.trim() : undefined,
      genre: genre || 'Other',
      pages: pages ? parseInt(pages) : undefined,
      publishDate: publishDate ? new Date(publishDate) : undefined,
      publisher: publisher ? publisher.trim() : undefined,
      language: language || 'English',
      price: price ? parseFloat(price) : undefined,
      discount: discount ? parseFloat(discount) : 0,
      tags: Array.isArray(tags) ? tags.map(t => t.trim()).filter(t => t) : [],
    });

    await book.save();

    res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists',
      });
    }
    next(error);
  }
};

/**
 * UPDATE EXISTING BOOK (Full Update)
 * ⚠️ ADMIN ONLY - Only admins can update books
 * Modify an existing book's details
 * Can update any field except _id
 */
export const updateBook = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can update books. Please login with an admin account.',
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format',
      });
    }

    // Don't allow updating _id or __v
    delete updateData._id;
    delete updateData.__v;

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.author) updateData.author = updateData.author.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.ISBN) updateData.ISBN = updateData.ISBN.trim();

    // Convert number fields
    if (updateData.pages) updateData.pages = parseInt(updateData.pages);
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discount) updateData.discount = parseFloat(updateData.discount);
    if (updateData.copies !== undefined) updateData.copies = parseInt(updateData.copies);

    // Update availability based on copies
    if (updateData.copies !== undefined) {
      updateData.availability = updateData.copies > 0;
    }

    const book = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
      message: 'Book updated successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists',
      });
    }
    next(error);
  }
};

/**
 * PARTIAL UPDATE BOOK (Patch)
 * ⚠️ ADMIN ONLY - Only admins can update books
 * Update specific fields without affecting others
 */
export const patchBook = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can update books. Please login with an admin account.',
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format',
      });
    }

    // Don't allow updating _id or __v
    delete updateData._id;
    delete updateData.__v;

    // Only update provided fields
    const allowedFields = [
      'name', 'author', 'ISBN', 'description', 'genre', 'image_link',
      'amazon_link', 'publishDate', 'pages', 'rating', 'reviewCount',
      'availability', 'copies', 'price', 'discount', 'tags', 'featured',
      'publisher', 'language', 'downloads', 'views'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    // Trim string fields
    if (updates.name) updates.name = updates.name.trim();
    if (updates.author) updates.author = updates.author.trim();
    if (updates.description) updates.description = updates.description.trim();

    const book = await Book.findByIdAndUpdate(id, { $set: updates }, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
      message: 'Book updated successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists',
      });
    }
    next(error);
  }
};

/**
 * DELETE BOOK
 * ⚠️ ADMIN ONLY - Only admins can delete books
 * Remove a book from the database
 */
export const deleteBook = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can delete books. Please login with an admin account.',
      });
    }

    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid book ID format',
      });
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE MULTIPLE BOOKS
 * ⚠️ ADMIN ONLY - Only admins can delete books
 * Remove multiple books by their IDs
 */
export const deleteMultipleBooks = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can delete books. Please login with an admin account.',
      });
    }

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of book IDs is required',
      });
    }

    // Validate all IDs
    const validIds = ids.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Some book IDs are invalid',
      });
    }

    const result = await Book.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} book(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ============================================
 * ADVANCED SEARCH & FILTER OPERATIONS
 * ============================================
 */

/**
 * SEARCH BOOKS
 * Search books by title, author, or description
 */
export const searchBooks = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const books = await Book.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BOOKS BY GENRE
 * Retrieve books filtered by genre with pagination
 */
export const getBooksByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!genre || !genre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Genre is required',
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({ genre })
      .limit(limitNum)
      .skip(skip)
      .sort({ rating: -1 })
      .select('-__v');

    const total = await Book.countDocuments({ genre });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET TRENDING BOOKS
 * Retrieve trending books based on rating and downloads
 */
export const getTrendingBooks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const books = await Book.find()
      .sort({ rating: -1, downloads: -1, views: -1, createdAt: -1 })
      .limit(limitNum)
      .select('-__v');

    res.status(200).json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET FEATURED BOOKS
 * Retrieve books marked as featured
 */
export const getFeaturedBooks = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const books = await Book.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('-__v');

    res.status(200).json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET AVAILABLE BOOKS
 * Retrieve only available books (in stock)
 */
export const getAvailableBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({ availability: true })
      .limit(limitNum)
      .skip(skip)
      .sort({ createdAt: -1 })
      .select('-__v');

    const total = await Book.countDocuments({ availability: true });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BOOKS BY AUTHOR
 * Retrieve all books by a specific author
 */
export const getBooksByAuthor = async (req, res, next) => {
  try {
    const { author } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Author name is required',
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({
      author: { $regex: author, $options: 'i' },
    })
      .limit(limitNum)
      .skip(skip)
      .sort({ publishDate: -1 })
      .select('-__v');

    const total = await Book.countDocuments({
      author: { $regex: author, $options: 'i' },
    });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BOOKS BY RATING RANGE
 * Filter books by minimum and maximum rating
 */
export const getBooksByRating = async (req, res, next) => {
  try {
    const { minRating = 0, maxRating = 5, page = 1, limit = 10 } = req.query;

    const min = Math.max(0, parseFloat(minRating));
    const max = Math.min(5, parseFloat(maxRating));

    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Minimum rating cannot be greater than maximum rating',
      });
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({
      rating: { $gte: min, $lte: max },
    })
      .limit(limitNum)
      .skip(skip)
      .sort({ rating: -1 })
      .select('-__v');

    const total = await Book.countDocuments({
      rating: { $gte: min, $lte: max },
    });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BOOKS BY PRICE RANGE
 * Filter books by price range
 */
export const getBooksByPriceRange = async (req, res, next) => {
  try {
    const { minPrice = 0, maxPrice = 10000, page = 1, limit = 10 } = req.query;

    const min = Math.max(0, parseFloat(minPrice));
    const max = Math.max(min, parseFloat(maxPrice));

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({
      price: { $gte: min, $lte: max },
    })
      .limit(limitNum)
      .skip(skip)
      .sort({ price: 1 })
      .select('-__v');

    const total = await Book.countDocuments({
      price: { $gte: min, $lte: max },
    });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BOOKS BY PUBLISHED YEAR
 * Filter books by publication year
 */
export const getBooksByYear = async (req, res, next) => {
  try {
    const { year, page = 1, limit = 10 } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required',
      });
    }

    const yearNum = parseInt(year);
    const startDate = new Date(`${yearNum}-01-01`);
    const endDate = new Date(`${yearNum}-12-31`);

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find({
      publishDate: { $gte: startDate, $lte: endDate },
    })
      .limit(limitNum)
      .skip(skip)
      .sort({ publishDate: -1 })
      .select('-__v');

    const total = await Book.countDocuments({
      publishDate: { $gte: startDate, $lte: endDate },
    });

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BOOK STATISTICS
 * Get aggregated statistics about books in the system
 */
export const getBookStats = async (req, res, next) => {
  try {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalBooks: { $sum: 1 },
          totalCopies: { $sum: '$copies' },
          avgRating: { $avg: '$rating' },
          avgPages: { $avg: '$pages' },
          maxRating: { $max: '$rating' },
          minRating: { $min: '$rating' },
          totalDownloads: { $sum: '$downloads' },
          totalViews: { $sum: '$views' },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    const genreStats = await Book.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          totalCopies: { $sum: '$copies' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const languageStats = await Book.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overall: stats[0] || {},
        byGenre: genreStats,
        byLanguage: languageStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE BOOK RATING
 * Update or set a book's rating
 */
export const updateBookRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, reviewCount } = req.body;

    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 0 and 5',
      });
    }

    const book = await Book.findByIdAndUpdate(
      id,
      {
        rating,
        reviewCount: reviewCount || (await Book.findById(id)).reviewCount + 1,
      },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
      message: 'Book rating updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * INCREMENT BOOK DOWNLOADS
 * Increment the download count for a book
 */
export const incrementDownloads = async (req, res, next) => {
  try {
    const { id } = req.params;

    const book = await Book.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    ).select('-__v');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
      message: 'Download count incremented',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * BULK IMPORT BOOKS
 * Import multiple books at once
 */
export const bulkImportBooks = async (req, res, next) => {
  try {
    const { books } = req.body;

    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array of books is required',
      });
    }

    const result = await Book.insertMany(books, { ordered: false }).catch(err => {
      // Continue even if some fail
      return err.result.insertedDocs || [];
    });

    res.status(201).json({
      success: true,
      message: `${result.length} book(s) imported successfully`,
      importedCount: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
