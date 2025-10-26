import { updateBook } from '../api/book_api';
export default function updateBookQueryOptions(queryClient) {

    return {
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
    }
}