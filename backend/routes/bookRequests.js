import express from 'express';
import BookRequest from '../Model/BookRequestSchema.js';

const router = express.Router();

// GET all book requests
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const requests = await BookRequest.find(query).sort({ requestedAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book requests', error: error.message });
  }
});

// GET book request by ID
router.get('/:id', async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Book request not found' });
    }
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book request', error: error.message });
  }
});

// GET requests by user
router.get('/user/:uid', async (req, res) => {
  try {
    const requests = await BookRequest.find({ requestedByUid: req.params.uid }).sort({ requestedAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user requests', error: error.message });
  }
});

// POST create new book request
router.post('/', async (req, res) => {
  try {
    const newRequest = new BookRequest(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error creating book request', error: error.message });
  }
});

// PUT update book request status
router.put('/:id', async (req, res) => {
  try {
    const updatedRequest = await BookRequest.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Book request not found' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error updating book request', error: error.message });
  }
});

// PATCH update status only
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updatedRequest = await BookRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Book request not found' });
    }
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error updating request status', error: error.message });
  }
});

// DELETE book request
router.delete('/:id', async (req, res) => {
  try {
    const deletedRequest = await BookRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Book request not found' });
    }
    res.status(200).json({ message: 'Book request deleted successfully', request: deletedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting book request', error: error.message });
  }
});

export default router;

