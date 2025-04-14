import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { CollectionsProvider } from './context/CollectionsContext';
import Home from './Pages/Home';
import GameDetails from './Pages/GameDetails';
import CollectionDetail from './Pages/CollectionDetail';
import Header from './components/Header';
import forestBg from './assets/forest-bg.png';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CollectionsProvider>
          <Router>
            <div 
              className="min-h-screen text-white bg-cover bg-center bg-fixed"
              style={{ 
                backgroundImage: `url(${forestBg})`,
                backgroundColor: 'rgba(17, 24, 39, 0.85)',
                backgroundBlendMode: 'multiply'
              }}
            >
              <div className="container mx-auto px-4 py-6">
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/game/:id" element={<GameDetails />} />
                  <Route path="/collection/:id" element={<CollectionDetail />} />
                </Routes>
              </div>
            </div>
          </Router>
        </CollectionsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;