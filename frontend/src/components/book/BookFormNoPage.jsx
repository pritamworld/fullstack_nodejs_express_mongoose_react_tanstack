import React, { useEffect, useState } from 'react';

export default function BookFormNoPage({ initial = null, onAdd, onUpdate, onCancel }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState(0.0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setAuthor(initial.author || '');
      setPrice(initial.price || 0.0);
      setRating(initial.rating || 0);
    } else {
      setTitle('');
      setAuthor('');
      setPrice(0.0);
      setRating(0);
    }
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    const payload = { title: title.trim(), author: author.trim(), price: Number(price), rating: Number(rating) || null };
    if (!payload.title) {
      alert('Please add a title');
      return;
    }
    if (initial) {
      onUpdate({...initial, ...payload });
    } else {
      onAdd(payload);
    }
    // after add, clear form
    if (!initial) {
      setTitle(''); 
      setAuthor(''); 
      setPrice(0.0);
      setRating(0);
    }
  };

  return (
    <form onSubmit={submit} className="book-form">
      <label>
        Title
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Book title" />
      </label>
      <label>
        Author
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" />
      </label>
      <label>
        Price
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" />
      </label>
      <label>
        Rating
        <input value={rating} onChange={e => setRating(e.target.value)} placeholder="Rating" />
      </label>

      <div className="form-actions">
        <button type="submit">{initial ? 'Update' : 'Add'}</button>
        {initial && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
