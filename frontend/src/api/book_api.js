import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

export const getBooks = async () => {
  const res = await api.get('/books');
  return res.data.data;
};

// Fetch books with pagination and optional search
export const getBooksByPage = async ({ page = 1, limit = 5, search = '' }) => {
  const params = new URLSearchParams();
  params.append('_page', page);
  params.append('_limit', limit);
  if (search) params.append('q', search);

  const res = await api.get(`/books?${params.toString()}`);
  const total = Number(res.headers['x-total-count'] || 0);
  return { data: res.data, total };
};

export const addBook = async (book) => {
  const res = await api.post('/books', book);
  return res.data;
};

export const updateBook = async (book) => {
  const res = await api.put(`/book/${book._id}`, book);
  return res.data;
};

export const deleteBook = async (bookId) => {
  const res = await api.delete(`/book/${bookId}`);
  return res.data;
};
