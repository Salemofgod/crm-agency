const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { connectDB }  = require('./config/database');
const authRoutes     = require('./routes/auth');
const clientRoutes   = require('./routes/clients');
const saleRoutes     = require('./routes/sales');
const taskRoutes     = require('./routes/tasks');
const userRoutes     = require('./routes/userRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',        authRoutes);
app.use('/api/clients',     clientRoutes);
app.use('/api/sales',       saleRoutes);
app.use('/api/tasks',       taskRoutes);
app.use('/api/admin/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM API is running.' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error.', error: err.message });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
    console.log('Environment: ' + process.env.NODE_ENV);
  });
};

start();
