const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'books.db');
const PORT = process.env.PORT || 3000;
let db = null;

// Open the database first; start the server only if the connection succeeds
const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const isValidBook = (b) =>
  b && typeof b.title === 'string' && b.title.trim() !== '' &&
  typeof b.author === 'string' && b.author.trim() !== '' &&
  Number.isInteger(b.price) && Number.isInteger(b.pages);

// GET root route - API overview
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Lab 2: SQLite database and CRUD routes API',
    endpoints: {
      getAllBooks: 'GET /books/',
      getOneBook: 'GET /books/:bookId/',
      addBook: 'POST /books/',
      updateBook: 'PUT /books/:bookId/',
      deleteBook: 'DELETE /books/:bookId/'
    }
  });
});

// GET all books
app.get('/books/', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM book ORDER BY id;');
    res.status(200).json(books);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET one book
app.get('/books/:bookId/', async (req, res) => {
  try {
    const book = await db.get('SELECT * FROM book WHERE id = ?;', [req.params.bookId]);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add a book
app.post('/books/', async (req, res) => {
  try {
    if (!isValidBook(req.body)) {
      return res.status(400).json({ error: 'title, author (text), price and pages (integers) are required' });
    }
    const { title, author, price, pages } = req.body;
    const result = await db.run(
      'INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);',
      [title, author, price, pages]
    );
    res.status(201).json({ message: 'Book added successfully', bookId: result.lastID });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT update a book
app.put('/books/:bookId/', async (req, res) => {
  try {
    if (!isValidBook(req.body)) {
      return res.status(400).json({ error: 'title, author (text), price and pages (integers) are required' });
    }
    const { title, author, price, pages } = req.body;
    const result = await db.run(
      'UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;',
      [title, author, price, pages, req.params.bookId]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE a book
app.delete('/books/:bookId/', async (req, res) => {
  try {
    const result = await db.run('DELETE FROM book WHERE id = ?;', [req.params.bookId]);
    if (result.changes === 0) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Unknown routes
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
