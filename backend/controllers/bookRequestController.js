import BookRequest from '../Model/BookRequestSchema.js';
import { isAdminEmail } from '../middleware/adminAuth.js';

/**
 * ============================================
 * BOOK REQUEST OPERATIONS
 * ============================================
 * Users can request unavailable books
 * Admins can view, approve, and reject requests
 */

/**
 * CREATE NEW BOOK REQUEST
 * Public endpoint - Any user can request a book
 * User provides: title, author, description, email (optional: isbn, genre, publishYear)
 */
export const createBookRequest = async (req, res, next) => {
  try {
    const {
      title,
      author,
      description,
      requesterEmail,
      requesterName,
      isbn,
      genre,
      publishYear,
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Book title is required',
      });
    }

    if (!author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Book author is required',
      });
    }

    if (!requesterEmail || !requesterEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Requester email is required',
      });
    }

    // Email validation regex
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(requesterEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Create new request
    const bookRequest = new BookRequest({
      title: title.trim(),
      author: author.trim(),
      description: description ? description.trim() : '',
      requesterEmail: requesterEmail.toLowerCase().trim(),
      requesterName: requesterName ? requesterName.trim() : 'Anonymous',
      isbn: isbn ? isbn.trim() : '',
      genre: genre || 'Other',
      publishYear: publishYear ? parseInt(publishYear) : null,
      status: 'pending',
    });

    await bookRequest.save();

    res.status(201).json({
      success: true,
      data: bookRequest,
      message: 'Book request submitted successfully. Admins will review it soon!',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL BOOK REQUESTS
 * ⚠️ ADMIN ONLY - Only admins can view all requests
 * Query Parameters:
 * - status: Filter by status (pending, approved, rejected, fulfilled)
 * - page: Page number for pagination
 * - limit: Number of requests per page
 * - sort: Sort field (createdAt, status, priority)
 */
export const getBookRequests = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can view book requests.',
      });
    }

    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const requests = await BookRequest.find(filter)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .select('-__v');

    const total = await BookRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: requests,
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
 * GET REQUEST BY ID
 * ⚠️ ADMIN ONLY - Only admins can view specific requests
 */
export const getBookRequestById = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can view book requests.',
      });
    }

    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await BookRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET USER'S OWN REQUESTS
 * Any authenticated user can view their own requests
 * Uses email from auth token
 */
export const getUserRequests = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const { page = 1, limit = 10 } = req.query;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const requests = await BookRequest.find({
      requesterEmail: req.user.email.toLowerCase(),
    })
      .sort('-createdAt')
      .limit(limitNum)
      .skip(skip)
      .select('-__v');

    const total = await BookRequest.countDocuments({
      requesterEmail: req.user.email.toLowerCase(),
    });

    res.status(200).json({
      success: true,
      data: requests,
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
 * APPROVE BOOK REQUEST
 * ⚠️ ADMIN ONLY - Only admins can approve requests
 * Updates status to 'approved' and adds admin notes
 */
export const approveBookRequest = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can approve book requests.',
      });
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await BookRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found',
      });
    }

    // Update request
    request.status = 'approved';
    request.respondedBy = req.user.email;
    request.respondedAt = new Date();
    if (adminNotes) {
      request.adminNotes = adminNotes.trim();
    }

    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: 'Book request approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REJECT BOOK REQUEST
 * ⚠️ ADMIN ONLY - Only admins can reject requests
 * Updates status to 'rejected' and adds admin notes (reason)
 */
export const rejectBookRequest = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can reject book requests.',
      });
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    if (!adminNotes || !adminNotes.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason (adminNotes) is required',
      });
    }

    const request = await BookRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found',
      });
    }

    // Update request
    request.status = 'rejected';
    request.respondedBy = req.user.email;
    request.respondedAt = new Date();
    request.adminNotes = adminNotes.trim();

    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: 'Book request rejected',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * MARK REQUEST AS FULFILLED
 * ⚠️ ADMIN ONLY - Mark request as fulfilled when book is added
 */
export const markRequestFulfilled = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can mark requests as fulfilled.',
      });
    }

    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await BookRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found',
      });
    }

    request.status = 'fulfilled';
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: 'Request marked as fulfilled',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET REQUEST STATISTICS
 * ⚠️ ADMIN ONLY - Get statistics about book requests
 */
export const getRequestStats = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can view request statistics.',
      });
    }

    const stats = await BookRequest.getStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET POPULAR REQUESTS
 * ⚠️ ADMIN ONLY - Get most popular/upvoted pending requests
 */
export const getPopularRequests = async (req, res, next) => {
  try {
    // Admin check
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only administrators can view popular requests.',
      });
    }

    const { limit = 10 } = req.query;
    const requests = await BookRequest.getPopularRequests(parseInt(limit));

    res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPVOTE REQUEST
 * Public endpoint - Any user can upvote a pending request
 * Useful for showing community interest in particular book requests
 */
export const upvoteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID format',
      });
    }

    const request = await BookRequest.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Book request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
      message: 'Request upvoted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL PENDING REQUESTS (Public)
 * Any user can view all pending requests to upvote and show interest
 */
export const getPendingRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-upvotes' } = req.query;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const requests = await BookRequest.find({ status: 'pending' })
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .select('-adminNotes');

    const total = await BookRequest.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      data: requests,
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

export default {
  createBookRequest,
  getBookRequests,
  getBookRequestById,
  getUserRequests,
  approveBookRequest,
  rejectBookRequest,
  markRequestFulfilled,
  getRequestStats,
  getPopularRequests,
  upvoteRequest,
  getPendingRequests,
};
