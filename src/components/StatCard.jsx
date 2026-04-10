import React from 'react';

const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="stat-card card">
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h2 className="stat-value">{value}</h2>
      </div>
      <div className="stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
        <Icon size={24} />
      </div>

    </div>
  );
};

export default StatCard;
