import React from 'react';
import { Search } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';

const HeroSearch = () => {
  return (
    <div className="hero-search">
      <div className="hero-content">
        <h2 className="hero-title">Searching for faculty resources?</h2>
        <p className="hero-subtitle">
          Access institutional datasets, sabbatical guidelines, and tenure tracking tools with one unified search.
        </p>
        
        <div className="search-box-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search the Architect network..." 
            className="hero-search-input"
          />
        </div>
      </div>
      
      <div className="hero-image-container">
         <img src={heroBg} alt="Network visualization" className="hero-viz" />
         <div className="circle-overlay"></div>
      </div>

    </div>
  );
};

export default HeroSearch;
