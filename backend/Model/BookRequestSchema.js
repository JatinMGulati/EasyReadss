import mongoose from 'mongoose';

const bookRequestSchema = new mongoose.Schema({
  bookName: {
      type: String,
    required: true,
    },
    author: {
      type: String,
    required: true,
    },
  ISBN: {
      type: String,
    required: false,
    },
  requestedBy: {
      type: String,
    required: true,
    note: 'Firebase user email or UID'
    },
  requestedByUid: {
      type: String,
    required: true,
    note: 'Firebase user UID'
  },
    status: {
      type: String,
    enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    required: false,
    },
  requestedAt: {
    type: Date,
    default: Date.now,
    },
  updatedAt: {
      type: Date,
    default: Date.now,
    },
}, { timestamps: true });

export default mongoose.model('BookRequest', bookRequestSchema);
