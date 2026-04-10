import React from 'react';

const AgendaItem = ({ time, title, location, isLast }) => (
  <div className="agenda-item">
    <div className="agenda-left">
      <div className="agenda-dot"></div>
      {!isLast && <div className="agenda-line"></div>}
    </div>
    <div className="agenda-right">
      <p className="agenda-time">{time}</p>
      <h4 className="agenda-title">{title}</h4>
      <p className="agenda-location">{location}</p>
    </div>
  </div>
);

const TodayAgenda = () => {
  const items = [
    { time: '09:00 - 10:30', title: 'Curriculum Committee Meeting', location: 'Conference Room A / Zoom' },
    { time: '11:00 - 12:00', title: 'Open Office Hours', location: 'Main Faculty Office - Suite 204' },
    { time: '13:30 - 15:00', title: 'Lecture: ARCH-101', location: 'Lyman Hall - Theater B' },
  ];

  return (
    <div className="agenda card">
      <h3 className="section-title">Today's Agenda</h3>
      <div className="agenda-list">
        {items.map((item, index) => (
          <AgendaItem key={index} {...item} isLast={index === items.length - 1} />
        ))}
      </div>

    </div>
  );
};

export default TodayAgenda;
