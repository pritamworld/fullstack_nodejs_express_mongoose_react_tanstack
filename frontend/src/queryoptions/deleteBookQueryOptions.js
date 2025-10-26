import { deleteBook } from '../api/book_api';
export default function deleteBookQueryOptions(queryClient) {

    return {
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
        }
}