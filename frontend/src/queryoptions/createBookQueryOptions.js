import { addBook } from '../api/book_api';
export default function createBookQueryOptions(queryClient) {

    return {
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
    }
}