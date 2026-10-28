// Route definitions for the Express server.
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).type('text').send('Node.js and Express are ready to handle your requests!');
});

router.get('/about', (req, res) => {
  res.status(200).json({
    name: 'P.Avinash',
    registrationNumber: '252U1R1194',
    section: 'CSE-2D'
  });
});

router.get('/time', (req, res) => {
  const now = new Date();
  res.status(200).type('text').send(`Current date and time: ${now}`);
});

module.exports = router;
