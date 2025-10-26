import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import getBooksByPagesQueryOptions from '../../queryoptions/getBooksByPagesQueryOptions';
import createBookQueryOptions from '../../queryoptions/createBookQueryOptions.js';
import updateBookQueryOptions from '../../queryoptions/updateBookQueryOptions.js';
import deleteBookQueryOptions from '../../queryoptions/deleteBookQueryOptions.js';

export default function BookPageApp() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const limit = 3;

    const { data, isLoading, isError } = useQuery(getBooksByPagesQueryOptions(page, limit, search));

    // Add book mutation
    const addMutation = useMutation(createBookQueryOptions(queryClient));
  
    // Update book mutation
    const updateMutation = useMutation(updateBookQueryOptions(queryClient));
  
    // Delete book mutation (optimistic)
    const deleteMutation = useMutation(deleteBookQueryOptions(queryClient));

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
