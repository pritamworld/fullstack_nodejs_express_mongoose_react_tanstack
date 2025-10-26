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

  const res = await api.get(`/books/page?${params.toString()}`);
  const total = Number(res.headers['X-Total-Count'] || 0);
  // console.log('Books Response:', res.data);
  const newObj = { data: res.data, total }
  // console.log('newObj Response:', newObj);
  return newObj;
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
