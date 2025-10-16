// In /server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Parses incoming JSON requests

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/communication', communicationRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server is running beautifully on port ${PORT}`);
});