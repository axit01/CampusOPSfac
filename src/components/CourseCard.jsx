import React from 'react';
import { Users, Clock } from 'lucide-react';

const CourseCard = ({ type, title, enrolled, description, nextTime, badgeColor }) => {
  return (
    <div className="course-card card">
      <div className="card-header">
        <span className="badge" style={{ backgroundColor: `${badgeColor}20`, color: badgeColor }}>
          {type}
        </span>
        <div className="enrolled">
          <Users size={14} />
          <span>{enrolled} Enrolled</span>
        </div>
      </div>
      
      <h3 className="course-title">{title}</h3>
      <p className="course-desc">{description}</p>
      
      <div className="course-footer">
        <div className="next-class">
          <Clock size={16} />
          <span>Next: {nextTime}</span>
        </div>
        <button className="btn-manage">Manage Course</button>
      </div>

    </div>
  );
};

export default CourseCard;
