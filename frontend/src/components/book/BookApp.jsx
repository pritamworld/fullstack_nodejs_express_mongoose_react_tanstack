import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBook, deleteBook } from '../../api/book_api';
import BookFormNoPage from './BookFormNoPage';
import '../../App.css';
import getBooksQueryOptions from '../../queryoptions/getBooksQueryOptions.js';
import createBookQueryOptions from '../../queryoptions/createBookQueryOptions.js';
import updateBookQueryOptions from '../../queryoptions/updateBookQueryOptions.js';
import deleteBookQueryOptions from '../../queryoptions/deleteBookQueryOptions.js';

export default function BookApp() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  // Fetch books
  const { data: books = [], isLoading, isError } = useQuery(getBooksQueryOptions());

  // Add book mutation
  const addMutation = useMutation(createBookQueryOptions(queryClient));

  // Update book mutation
  const updateMutation = useMutation(updateBookQueryOptions(queryClient));

  // Delete book mutation (optimistic)
  const deleteMutation = useMutation(deleteBookQueryOptions(queryClient));

  const startEdit = (book) => setEditing(book);
  const cancelEdit = () => setEditing(null);

  const handleAdd = async (book) => {
    await addMutation.mutateAsync(book);
  };

  const handleUpdate = async (bookId, book) => {
    await updateMutation.mutateAsync(bookId, book);
    setEditing(null);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Delete this book?')) return;
    await deleteMutation.mutateAsync(bookId);
  };

  return (
    <div className="container">
      <h1>Book Manager</h1>

      <div className="content">
        <section className="left">
          <h2>Books</h2>
          {isLoading && <div>Loading books…</div>}
          {isError && <div>Error loading books.</div>}
          {!isLoading && books.length === 0 && <div>No books found.</div>}
          <ul className="book-list">
            {books.map(b => (
              <li key={b._id} className="book-item">
                <div>
                  <strong>{b.title}</strong>
                  <div className="meta">{b.author} — {b.price}— {b.rating}</div>
                </div>
                <div className="actions">
                  <button onClick={() => startEdit(b)}>Edit</button>
                  <button onClick={() => handleDelete(b._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="right">
          <h2>{editing ? 'Edit Book' : 'Add Book'}</h2>
          <BookFormNoPage
            initial={editing}
            onCancel={cancelEdit}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
          />
        </aside>
      </div>
    </div>
  );
}
