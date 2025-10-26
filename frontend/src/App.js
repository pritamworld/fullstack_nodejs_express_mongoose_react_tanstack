import './App.css';
import BookApp from './components/book/BookApp';
import BookPageApp from './components/bookpage/BookPageApp';

function App() {
  return (
    <div>
      <h1>Example 1 without Tanstack Table and Paging</h1>
      <BookApp />
      <h1>Example 2 with Tanstack Table, Filter, Paging & Material UI</h1>
      <BookPageApp />
    </div>
  );
}

export default App;
