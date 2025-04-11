import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import Home from './Pages/Home';
import GameDetails from './Pages/GameDetails';
import Header from './components/Header';
import forestBg from './assets/forest-bg.png';

const App: React.FC = () => {
  return (
    <FavoritesProvider>
      <Router>
        <div 
          className="min-h-screen text-white bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${forestBg})` }}
        >
          <div className="container mx-auto px-4 py-6">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:id" element={<GameDetails />} />
            </Routes>
          </div>
        </div>
      </Router>
    </FavoritesProvider>
  );
};

export default App;