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
import './styles/mobile.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CollectionsProvider>
          <Router>
            <div 
              className="min-h-screen text-white bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${forestBg})`,
                backgroundColor: 'rgba(17, 24, 39, 0.25)',
                backgroundBlendMode: 'multiply'
              }}
            >
              <div className="min-h-screen bg-gray-900 bg-opacity-25">
                <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6 max-w-7xl">
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game/:id" element={<GameDetails />} />
                    <Route path="/collection/:id" element={<CollectionDetail />} />
                  </Routes>
                  
                  {/* Mobile-friendly footer */}
                  <footer className="mt-8 sm:mt-12 text-center text-gray-400 text-xs sm:text-sm pb-6">
                    <p>GameMuse © {new Date().getFullYear()}</p>
                    <p className="mt-1">Powered by <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer" className="text-fae hover:underline">RAWG API</a></p>
                  </footer>
                </div>
              </div>
            </div>
          </Router>
        </CollectionsProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;