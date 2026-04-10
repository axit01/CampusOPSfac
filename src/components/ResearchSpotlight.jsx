import React from 'react';

const ProjectProgress = ({ title, subtitle, progress, color }) => (
  <div className="project-item">
    <div className="project-info">
      <h4 className="project-name">{title}</h4>
      <p className="project-sub">{subtitle}</p>
    </div>
    <div className="project-stats">
      <span className="progress-percent" style={{ color: color }}>{progress}% Complete</span>
      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

const ResearchSpotlight = () => {
  return (
    <div className="research-spotlight card">
      <h3 className="section-title">Research Spotlight</h3>
      <div className="projects-list">
        <ProjectProgress 
          title="Smart Material Resilience (SMR-2024)" 
          subtitle="Active Grant: NSF Infrastructure Grant" 
          progress={75} 
          color="#14b8a6"
        />
        <ProjectProgress 
          title="Neo-Brutalist Reclamation Study" 
          subtitle="Publication: International Journal of Urbanism" 
          progress={32} 
          color="#14b8a6"
        />
      </div>
    </div>
  );
};

export default ResearchSpotlight;
