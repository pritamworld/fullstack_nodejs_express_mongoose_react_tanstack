import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooks, addBook, updateBook, deleteBook } from '../../api/book_api';
import BookFormNoPage from './BookFormNoPage';
import '../../App.css';

export default function BookApp() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);

  // Fetch books
  const { data: books = [], isLoading, isError } = useQuery({
    queryKey: ['books'], 
    queryFn: getBooks, 
    staleTime: 1000 * 60 * 1  // 1 minute
  });

  // Add book mutation
  const addMutation = useMutation({
    mutationFn: async (newBook) => {
      await queryClient.cancelQueries({queryKey: ['books']});
      const json = await addBook(newBook);
      return json.data;
    },
    onSuccess: (newBook) => {
      queryClient.setQueryData({queryKey: ['books']}, old => [...(old || []), newBook]);
    },
    onError: (err, newBook, context) => {
      if (context?.previous) queryClient.setQueryData({ queryKey: ["books"] }, context.previous);
      alert('Add failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  // Update book mutation
  const updateMutation = useMutation({
    mutationFn: async (bookId, bookToUpdate) => {
      await queryClient.cancelQueries({ queryKey: ["books"] });
      const json = await updateBook(bookId, bookToUpdate);
      return json.data;
    },
    onSuccess: (updatedBook) => {
      queryClient.setQueryData({ queryKey: ["books"] }, old =>
        (old || []).map(b => (b._id === updatedBook._id ? updatedBook : b))
      );
    },
    onError: (err, variables, context) => {
      if (context?.previous) queryClient.setQueryData({queryKey: ['books']}, context.previous);
      alert('Update failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['books']});
    },
  });

  // Delete book mutation (optimistic)
  const deleteMutation = useMutation({
    mutationFn: async (bookId) => {
      await queryClient.cancelQueries({queryKey: ['books']});
      const json = await deleteBook(bookId);
      return json.data;
    },
    onMutate: async (bookId) => {
      await queryClient.cancelQueries({queryKey: ['books']});
      // Optimistic update: remove from any cached lists
      const keyFilter = { queryKey: ["books"] };
      const prevListCaches = queryClient.getQueryCache().findAll(keyFilter).map((query) => ({
          queryHash: query.queryHash,
          previousData: query.state.data,
      }));


      queryClient.setQueriesData(keyFilter, (old) => {
      if (!Array.isArray(old)) return old;
          return old.filter((b) => b._id !== bookId);
      });

      return { prevListCaches };
    },
    onError: (err, id, context) => {
      if (context?.previous) queryClient.setQueryData({queryKey: ['books']}, context.previous);
      alert('Delete failed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['books']});
    },
  });

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
