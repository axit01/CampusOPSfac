import React from 'react';
import { ExternalLink, Database, Globe, Landmark, Plus } from 'lucide-react';

const ResourceItem = ({ icon: Icon, label }) => (
  <div className="resource-item">
    <div className="resource-icon-box">
      <Icon size={18} />
    </div>
    <span className="resource-label">{label}</span>
    <ExternalLink size={14} className="external-icon" />
  </div>
);

const ResourceHub = () => {
  return (
    <div className="resource-hub card">
      <div className="hub-header">
        <h3 className="section-title">RESOURCE HUB</h3>
        <button className="add-btn">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="resource-list">
        <ResourceItem icon={Database} label="LMS Login" />
        <ResourceItem icon={Globe} label="Grant Portal" />
        <ResourceItem icon={Landmark} label="Library Archives" />
      </div>

    </div>
  );
};

export default ResourceHub;
