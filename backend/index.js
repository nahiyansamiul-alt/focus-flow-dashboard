const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/focusflow';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Models
const Todo = require('./models/Todo');
const Note = require('./models/Note');
const History = require('./models/History');
const Folder = require('./models/Folder');
const Reminder = require('./models/Reminder');

// Routes
app.use('/api/todos', require('./routes/todos'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/folders', require('./routes/folders'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/history', require('./routes/history'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
