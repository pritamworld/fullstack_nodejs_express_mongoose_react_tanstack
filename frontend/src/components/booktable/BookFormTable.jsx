import React, { useEffect, useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

export default function BookFormTable({ initial, onSubmit }) {
  const [form, setForm] = useState({ title: '', author: '', price: 0, rating: 0 });

  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ title: '', author: '', price: 0, rating: 0 });
  }, [initial]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return alert('Please enter title and author');
    onSubmit({ ...form, year: Number(form.year) || '' });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Title"
        name="title"
        margin="normal"
        value={form.title}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Author"
        name="author"
        margin="normal"
        value={form.author}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Price"
        name="price"
        margin="normal"
        type="number"
        value={form.price}
        onChange={handleChange}
      />
     <TextField
        fullWidth
        label="Rating"
        name="rating"
        margin="normal"
        type="number"
        value={form.rating}
        onChange={handleChange}
      />
      <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
        {initial ? 'Update' : 'Add'}
      </Button>
    </Box>
  );
}
