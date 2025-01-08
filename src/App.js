import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import logo from './logoa.png';
import CountriesPage from './CountriesPage';
import MapPage from './MapPage';
import titleImage from './titleImage.png';

function App() {
  const navigateToMap = () => {
    console.log("Navigating to the map...");
  };

  const navigateToList = () => {
    console.log("Navigating to the list...");
  };

  return (
    // Add basename to Router
    <Router basename="/LeirerenMundua">
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <header className="App-header">
                <img src={titleImage} alt="Title" className="title-image" />
                <img src={logo} alt="Travel" className="center-image" />
                <div className="button-container">
                  <Link to="/countries">
                    <button className="main-button">Zerrenda</button>
                  </Link>
                  <Link to="/map">
                    <button className="main-button">Mapa</button>
                  </Link>
                </div>
              </header>
            }
          />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
