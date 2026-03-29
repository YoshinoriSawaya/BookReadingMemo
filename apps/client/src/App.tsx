import { BookPage } from './pages/BookPage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* 将来的に共通のサイドバーや、ルーティング（Routes）が入る場所 */}
      <BookPage />
    </div>
  );
}

export default App;