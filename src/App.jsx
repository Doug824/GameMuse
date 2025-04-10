import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import Home from './pages/Home';
import GameDetails from './pages/GameDetails';

function App() {
    return (
        <FavoritesProvider>
        <Router>
            <div className="min-h-screen bg-gray-900 text-white">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:id" element={<GameDetails />} />
            </Routes>
            </div>
        </Router>
        </FavoritesProvider>
    );
}

export default App;