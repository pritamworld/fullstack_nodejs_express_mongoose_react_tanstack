import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  TableSortLabel,
  TextField,
  IconButton,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import debounce from 'lodash.debounce';
import BookFormTable from './BookFormTable';
import getBooksByPagesQueryOptions from '../../queryoptions/getBooksByPagesQueryOptions';
import createBookQueryOptions from '../../queryoptions/createBookQueryOptions.js';
import updateBookQueryOptions from '../../queryoptions/updateBookQueryOptions.js';
import deleteBookQueryOptions from '../../queryoptions/deleteBookQueryOptions.js';

export default function App() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const limit = 5;

  const { data, isLoading, isError } = useQuery(getBooksByPagesQueryOptions(page, limit, globalFilter));

  const addMutation = useMutation(createBookQueryOptions(queryClient));

  const updateMutation = useMutation(updateBookQueryOptions(queryClient));

  const deleteMutation = useMutation(deleteBookQueryOptions(queryClient));

  const handleSearch = useMemo(
    () =>
      debounce((e) => {
        setPage(1);
        setGlobalFilter(e.target.value);
      }, 400),
    []
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
      },
      {
        accessorKey: 'author',
        header: 'Author',
      },
      {
        accessorKey: 'price',
        header: 'Price',
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <>
            <IconButton color="primary" onClick={() => openEdit(row.original)}>
              <Edit />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(row.original.id)}>
              <Delete />
            </IconButton>
          </>
        ),
      },
    ],
    []
  );

  const books = data?.data.data || [];
  const totalPages = Math.ceil((data?.data.total || 0) / limit);

  const table = useReactTable({
    data: books,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
    if (editing) await updateMutation.mutateAsync({ ...editing, ...book });
    else await addMutation.mutateAsync(book);
    closeDialog();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📚 Book Management (TanStack Table)
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          onChange={handleSearch}
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() || 'asc'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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
          <BookFormTable initial={editing} onSubmit={handleSubmit} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
