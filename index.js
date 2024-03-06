// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors middleware
const Account = require('./Account');
const User = require('./User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.json());
app.use(cors()); // Use cors middleware


mongoose.connect('mongodb+srv://steeve:admin@cluster0.92ffcqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


  const JWT_SECRET = 'your_secret_key';
// Define POST endpoint to create a new account
app.post('/accounts', async (req, res) => {
  try {
    const { title, price, description, videoUrl, imageUrl } = req.body;
    const account = new Account({ title, price, description, videoUrl, imageUrl });
    await account.save();
    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define GET endpoint to fetch all accounts
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define PUT endpoint to update a particular account
app.put('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, videoUrl, imageUrl } = req.body;
    const updatedAccount = await Account.findByIdAndUpdate(id, { title, price, description, videoUrl, imageUrl }, { new: true });
    if (!updatedAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define DELETE endpoint to delete a particular account
app.delete('/accounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAccount = await Account.findByIdAndDelete(id);
    if (!deletedAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    const user = new User({ username, password: hashedPassword });
    await user.save();
    // Create and send JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // Create and send JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
