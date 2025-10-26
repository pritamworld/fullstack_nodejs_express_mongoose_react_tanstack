import { getBooksByPage } from '../api/book_api';
export default function getBooksByPagesQueryOptions(page, limit, search) {
    return {
        queryKey: ['books', { page, limit, search }],
        queryFn: () => getBooksByPage({ page, limit, search }),
        keepPreviousData: true,
        staleTime: 1000 * 60 * 1  // 1 minute
    };
}