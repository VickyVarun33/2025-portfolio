import React, { useState } from 'react';
import InceptionScene from './components/InceptionScene';
import StairPanel from './components/StairPanel';
import portfolioData from './data/portfolioData';
import './styles/stairs.css';

export default function App() {
  const [activeStair, setActiveStair] = useState(null);

  const handleStairClick = (id) => {
    setActiveStair(portfolioData[id]);
  };

  const closePanel = () => setActiveStair(null);

  return (
    <div className="app-container">
      <InceptionScene onStairClick={handleStairClick} />
      {activeStair && <StairPanel data={activeStair} onClose={closePanel} />}
    </div>
  );
}
