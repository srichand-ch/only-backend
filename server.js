// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Cache to store quotes
let quotesCache = [];
// let quotesStore = [];
let currentQuoteIndex = 0;

app.get('/', (req, res) => {
  res.send('Hello, World!, I am Sai Sri Chand Chintakayala'); // Send a response back to the client
});

// Fetch quotes from ZenQuotes API and cache them locally
const fetchQuotes = async () => {
  try {
    const response = await axios.get('https://zenquotes.io/api/quotes/');
    quotesCache = response.data;
    console.log('Quotes cached successfully.');

    quotesCache.forEach(element => {
      console.log(element);
    });

  } catch (error) {
    console.error('Error fetching quotes:', error);
  }
};

// Fetch quotes initially on server start
fetchQuotes();

// Schedule rotating through quotes every 24 hours
const rotateQuotesSchedule = () => {
  setInterval(() => {
    currentQuoteIndex = (currentQuoteIndex + 1) % quotesCache.length;
  }, 24 * 60 * 60); // 24 hours
};

rotateQuotesSchedule();

// Route to get the current quote
app.get('/api/quote', (req, res) => {
  const currentQuote = quotesCache[currentQuoteIndex];
  res.json(currentQuote);
});

app.get('/api/quotes/:author', (req, res) => {
  const typedAuthor = req.params.author ? req.params.author.toLowerCase() : '';
  if (!typedAuthor) {
    return res.status(400).json({ error: 'Author name not provided' });
  }
  if (!quotesCache || !Array.isArray(quotesCache)) {
    return res.status(500).json({ error: 'Quotes cache is not properly initialized' });
  }

  const quotesByMatchingPrefix = quotesCache.filter(quote => {
    const author = quote.a ? quote.a.toLowerCase() : '';
    return author.startsWith(typedAuthor);
  });
  
  if (quotesByMatchingPrefix.length > 0) {
    res.json(quotesByMatchingPrefix);
  } else {
    res.status(404).json({ error: `No quotes found for author '${typedAuthor}' or its prefix` });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
