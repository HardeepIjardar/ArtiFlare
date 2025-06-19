const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Endpoint to send order emails
app.post('/api/send-order-emails', async (req, res) => {
  // Email logic will be added here
  res.status(200).json({ message: 'Email endpoint hit', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 