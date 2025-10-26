import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBooksByPage, addBook, updateBook, deleteBook } from '../../api/book_api';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import debounce from 'lodash.debounce';
import BookFormPage from './BookFormPage';

export default function BookPageApp() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const limit = 3;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['books', { page, limit, search }],
        queryFn: () => getBooksByPage({ page, limit, search }),
        keepPreviousData: true,
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


    const handleSearchChange = useMemo(
        () => debounce((e) => {
        setPage(1);
        setSearch(e.target.value);
        }, 400),
        []
    );

    const openAdd = () => {
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (book) => {
        setEditing(book);
        setOpen(true);
    };

    const closeDialog = () => {
        setEditing(null);
        setOpen(false);
    };

    const handleSubmit = async (book) => {
        if (editing) {
            await updateMutation.mutateAsync({ ...editing, ...book });
        } else {
            await addMutation.mutateAsync(book);
        }
        closeDialog();
    };

    const handleDelete = async (bookId) => {
        if (window.confirm('Delete this book?')) {
            await deleteMutation.mutateAsync(bookId);
        }
    };

    console.log('Data:', data?.data);
    const books = data?.data.data || []
    const totalPages = Math.ceil((data?.data.total || 0) / limit);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📚 Book Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by title or author"
          onChange={handleSearchChange}
        />
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>
          Add Book
        </Button>
      </Box>

      {isLoading && <Typography>Loading...</Typography>}
      {isError && <Typography color="error">Error loading books</Typography>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Price</TableCell>
               <TableCell>Rating</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.price}</TableCell>
                 <TableCell>{book.rating}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openEdit(book)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(book._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {books.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No books found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={totalPages || 1}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Book' : 'Add Book'}</DialogTitle>
        <DialogContent>
          <BookFormPage initial={editing} onSubmit={handleSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
