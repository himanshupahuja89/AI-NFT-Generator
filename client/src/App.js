import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ViewNFT from './components/ViewNFT';
import { useNFTDataContext } from './context/NFTDataContext';

function App() {
    const { isDarkMode } = useNFTDataContext();

    return (
        <div className={isDarkMode ? 'dark' : 'light'}>
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/view" element={<ViewNFT />} />
            </Routes>
        </Router>
        </div>
    );
}

export default App;
