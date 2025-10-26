import './App.css';
import BookApp from './components/book/BookApp';
import BookPageApp from './components/bookpage/BookPageApp';
import BookTableApp from './components/booktable/BookTableApp';

function App() {
  return (
    <div>
      <h1>Example 1 without Filter and Paging</h1>
      <BookApp />
      <h1>Example 2 with Filter, Paging & Material UI</h1>
      <BookPageApp />
      <h1>Example 3 with Tanstack Table, Filter, Sorting, Paging & Material UI</h1>
      <BookTableApp />
    </div>
  );
}

export default App;
