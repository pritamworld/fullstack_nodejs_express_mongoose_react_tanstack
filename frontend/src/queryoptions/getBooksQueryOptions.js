import { getBooks } from '../api/book_api';
export default function getBooksQueryOptions() {
    return {
        queryKey: ['books'], 
        queryFn: getBooks, 
        staleTime: 1000 * 60 * 1  // 1 minute
    };
}