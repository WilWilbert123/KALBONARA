require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from 'public' folder
app.use(express.static('public'));

// Serve index.html at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Load environment variables
const API_KEY = process.env.API_KEY;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

// Middleware to check internal API key
const authenticateKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }
  next();
};

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  username: String,
  password: String,
  role:String,
});

const User = mongoose.model('users', userSchema);

// Routes

// GET all users
app.get('/users', authenticateKey, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// POST add user
app.post('/users', authenticateKey, async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('POST /users error:', error.message);
    res.status(500).json({ message: 'Failed to add user' });
  }
});

// PUT update user
app.put('/users/:id', authenticateKey, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    console.error('PUT /users/:id error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user
app.delete('/users/:id', authenticateKey, async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send('User not found');
    res.send({ success: true });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`)
);
