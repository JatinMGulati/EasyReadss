/**
 * Admin Authorization Middleware
 * Verifies that the user is an admin before allowing access to protected routes
 */

/**
 * Get admin emails from environment variable
 * Format: admin@easyreads.com,admin2@example.com
 */
const getAdminEmails = () => {
  const adminEnv = process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '';
  if (!adminEnv) {
    console.warn('No admin emails configured. Set VITE_ADMIN_EMAILS environment variable.');
    return [];
  }
  return adminEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

/**
 * Check if an email belongs to an admin user
 * @param {string} email - User email to check
 * @returns {boolean} True if user is admin
 */
export const isAdminEmail = (email) => {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase());
};

/**
 * Middleware to verify admin status
 * Must be used after verifyToken middleware
 * Expects req.user.email to be set by authentication middleware
 */
export const requireAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please provide a valid token.',
      });
    }

    // Check if user email is set
    if (!req.user.email) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User email not found in token.',
      });
    }

    // Check if user is admin
    if (!isAdminEmail(req.user.email)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Only administrators can perform this action. Admin email: ${req.user.email}`,
      });
    }

    // User is admin, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Error checking admin status.',
    });
  }
};

/**
 * Middleware to attach user info for logging/tracking
 * Can be used to track which admin performed which action
 */
export const attachAdminInfo = (req, res, next) => {
  if (req.user && req.user.email && isAdminEmail(req.user.email)) {
    req.adminEmail = req.user.email;
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
    req.adminEmail = null;
  }
  next();
};

export default {
  requireAdmin,
  isAdminEmail,
  attachAdminInfo,
};
