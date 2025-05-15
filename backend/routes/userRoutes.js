const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  getUsers
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes publiques
router.post('/', registerUser);
router.post('/login', loginUser);

// Routes protégées
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Routes admin
router.route('/')
  .get(protect, admin, getUsers);

module.exports = router;