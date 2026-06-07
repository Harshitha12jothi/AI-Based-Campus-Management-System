// frontend/src/components/TimetableView.js

import React, { useState, useEffect } from 'react';

const TimetableView = ({ department, year, section }) => {

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  // Demo timetable data
  const demoData = [
    {
      day: 'Monday',
      periods: [
        { time:'9:00 - 10:00',  subject:'Data Structures',    faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'10:00 - 11:00', subject:'Computer Networks',  faculty:'Dr. Sangeetha', room:'R104', type:'Theory'    },
        { time:'11:15 - 12:15', subject:'OS Lab',             faculty:'Mr. Kumar',     room:'Lab1', type:'Lab'       },
        { time:'1:00 - 2:00',   subject:'DBMS',               faculty:'Dr. Anitha',    room:'R201', type:'Theory'    },
        { time:'2:00 - 3:00',   subject:'Operating Systems',  faculty:'Mr. Kumar',     room:'R305', type:'Theory'    },
      ]
    },
    {
      day: 'Tuesday',
      periods: [
        { time:'9:00 - 10:00',  subject:'DBMS',               faculty:'Dr. Anitha',    room:'R201', type:'Theory'    },
        { time:'10:00 - 11:00', subject:'Algorithms',         faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'11:15 - 12:15', subject:'DS Lab',             faculty:'Dr. Ramesh',    room:'Lab2', type:'Lab'       },
        { time:'1:00 - 2:00',   subject:'Computer Networks',  faculty:'Dr. Sangeetha', room:'R104', type:'Theory'    },
        { time:'2:00 - 3:00',   subject:'Sports / Activity',  faculty:'Physical Dir',  room:'Ground',type:'Activity' },
      ]
    },
    {
      day: 'Wednesday',
      periods: [
        { time:'9:00 - 10:00',  subject:'Algorithms',         faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'10:00 - 11:00', subject:'Library Hour',       faculty:'Self Study',    room:'Library',type:'Activity'},
        { time:'11:15 - 12:15', subject:'Algorithms',         faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'1:00 - 2:00',   subject:'Operating Systems',  faculty:'Mr. Kumar',     room:'R305', type:'Theory'    },
        { time:'2:00 - 3:00',   subject:'CN Lab',             faculty:'Dr. Sangeetha', room:'Lab4', type:'Lab'       },
      ]
    },
    {
      day: 'Thursday',
      periods: [
        { time:'9:00 - 10:00',  subject:'Computer Networks',  faculty:'Dr. Sangeetha', room:'R104', type:'Theory'    },
        { time:'10:00 - 11:00', subject:'DBMS',               faculty:'Dr. Anitha',    room:'R201', type:'Theory'    },
        { time:'11:15 - 12:15', subject:'Operating Systems',  faculty:'Mr. Kumar',     room:'R305', type:'Theory'    },
        { time:'1:00 - 2:00',   subject:'Seminar',            faculty:'Guest Lecture', room:'Hall', type:'Activity'  },
        { time:'2:00 - 3:00',   subject:'DBMS',               faculty:'Dr. Anitha',    room:'R201', type:'Theory'    },
      ]
    },
    {
      day: 'Friday',
      periods: [
        { time:'9:00 - 10:00',  subject:'Data Structures',    faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'10:00 - 11:00', subject:'Operating Systems',  faculty:'Mr. Kumar',     room:'R305', type:'Theory'    },
        { time:'11:15 - 12:15', subject:'DBMS Lab',           faculty:'Dr. Anitha',    room:'Lab3', type:'Lab'       },
        { time:'1:00 - 2:00',   subject:'Algorithms',         faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'2:00 - 3:00',   subject:'Club / Elective',    faculty:'Various',       room:'Rooms',type:'Activity'  },
      ]
    },
    {
      day: 'Saturday',
      periods: [
        { time:'9:00 - 10:00',  subject:'Data Structures',    faculty:'Dr. Ramesh',    room:'R301', type:'Theory'    },
        { time:'10:00 - 11:00', subject:'Computer Networks',  faculty:'Dr. Sangeetha', room:'R104', type:'Theory'    },
        { time:'11:15 - 12:15', subject:'Remedial Class',     faculty:'Various',       room:'R301', type:'Theory'    },
      ]
    },
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (department) params.append('dept', department);
        if (year)       params.append('year', year);
        if (section)    params.append('section', section);

        const res = await fetch(
          `http://localhost:5000/api/timetable?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setTimetable(data);
          } else {
            setTimetable(demoData); // use demo if empty
          }
        } else {
          setTimetable(demoData); // fallback to demo
        }
      } catch (err) {
        setTimetable(demoData); // offline fallback
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [department, year, section]);

  // Get today's day name
  const getTodayName = () => {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date().getDay()];
  };

  // Get periods for selected day
  const getPeriodsForDay = (dayName) => {
    const found = timetable.find(t => t.day === dayName);
    return found ? found.periods : [];
  };

  // Color based on type
  const getTypeColor = (type) => {
    switch(type) {
      case 'Lab':      return { bg:'#e8eeff', color:'#2244cc', label:'Lab' };
      case 'Activity': return { bg:'#e6f9f0', color:'#1a8050', label:'Activity' };
      case 'Theory':   return { bg:'#f0ede6', color:'#6b7280', label:'Theory' };
      default:         return { bg:'#f0ede6', color:'#6b7280', label:type };
    }
  };

  // Styles
  const styles = {
    container: {
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e0d8',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    },
    header: {
      background: '#0a0a12',
      color: '#ffffff',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
    },
    headerTitle: {
      fontFamily: "'Syne', sans-serif",
      fontWeight: 700,
      fontSize: '1rem',
      color: '#ffffff',
    },
    headerSub: {
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.5)',
      marginTop: '2px',
    },
    todayBadge: {
      background: '#ff5c35',
      color: '#fff',
      padding: '4px 12px',
      borderRadius: '100px',
      fontSize: '0.72rem',
      fontWeight: 600,
    },
    dayTabs: {
      display: 'flex',
      gap: '4px',
      padding: '12px 16px',
      background: '#f5f3ee',
      borderBottom: '1px solid #e2e0d8',
      overflowX: 'auto',
    },
    dayTab: (isActive, isToday) => ({
      padding: '7px 14px',
      borderRadius: '8px',
      border: 'none',
      background: isActive ? '#0a0a12' : isToday ? '#fff8e0' : '#ffffff',
      color: isActive ? '#ffffff' : isToday ? '#8a6800' : '#6b7280',
      fontWeight: isActive ? 700 : 500,
      fontSize: '0.82rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      border: isToday && !isActive ? '1px solid #f4c430' : '1px solid transparent',
      transition: 'all 0.15s',
    }),
    periodList: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    periodCard: (type) => {
      const c = getTypeColor(type);
      return {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        background: '#fafaf8',
        border: '1px solid #e2e0d8',
        borderRadius: '12px',
        borderLeft: `4px solid ${c.color}`,
        transition: 'all 0.15s',
      };
    },
    timeBox: {
      minWidth: '90px',
      textAlign: 'center',
      background: '#f0ede6',
      borderRadius: '8px',
      padding: '8px',
    },
    timeText: {
      fontSize: '0.72rem',
      fontWeight: 700,
      color: '#0a0a12',
    },
    subjectName: {
      fontWeight: 700,
      fontSize: '0.9rem',
      color: '#0a0a12',
      marginBottom: '3px',
    },
    facultyName: {
      fontSize: '0.78rem',
      color: '#8a8a9a',
    },
    roomBadge: {
      marginLeft: 'auto',
      background: '#f0ede6',
      color: '#6b7280',
      padding: '3px 10px',
      borderRadius: '100px',
      fontSize: '0.72rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    typeBadge: (type) => {
      const c = getTypeColor(type);
      return {
        background: c.bg,
        color: c.color,
        padding: '2px 8px',
        borderRadius: '100px',
        fontSize: '0.65rem',
        fontWeight: 600,
      };
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#8a8a9a',
    },
    loadingState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#8a8a9a',
    },
    lunchRow: {
      textAlign: 'center',
      padding: '10px',
      background: '#fff8e0',
      border: '1px dashed #f4c430',
      borderRadius: '8px',
      fontSize: '0.8rem',
      color: '#8a6800',
      fontWeight: 600,
    },
    summary: {
      display: 'flex',
      gap: '12px',
      padding: '12px 16px',
      background: '#f5f3ee',
      borderTop: '1px solid #e2e0d8',
      flexWrap: 'wrap',
    },
    summaryItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.78rem',
      color: '#6b7280',
    },
    summaryDot: (color) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }),
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <div>Loading timetable...</div>
        </div>
      </div>
    );
  }

  const todayName    = getTodayName();
  const periodsToShow = getPeriodsForDay(selectedDay);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>📅 Class Timetable</div>
          <div style={styles.headerSub}>
            {department || 'CSE'} · Year {year || 2} · Section {section || 'A'}
          </div>
        </div>
        <div style={styles.todayBadge}>
          Today: {todayName}
        </div>
      </div>

      {/* Day Tabs */}
      <div style={styles.dayTabs}>
        {days.map(day => (
          <button
            key={day}
            style={styles.dayTab(selectedDay === day, day === todayName)}
            onClick={() => setSelectedDay(day)}
          >
            {day === todayName ? `⭐ ${day}` : day}
          </button>
        ))}
      </div>

      {/* Periods */}
      <div style={styles.periodList}>
        {periodsToShow.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎉</div>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>No Classes!</div>
            <div style={{ fontSize: '0.85rem' }}>Enjoy your free day</div>
          </div>
        ) : (
          periodsToShow.map((period, index) => (
            <React.Fragment key={index}>
              {/* Lunch break after 3rd period */}
              {index === 3 && (
                <div style={styles.lunchRow}>
                  🍽️ Lunch Break — 12:15 PM to 1:00 PM
                </div>
              )}
              <div style={styles.periodCard(period.type)}>
                {/* Time */}
                <div style={styles.timeBox}>
                  <div style={styles.timeText}>
                    {period.time.split(' - ')[0]}
                  </div>
                  <div style={{ fontSize:'0.65rem', color:'#8a8a9a', marginTop:'2px' }}>
                    to {period.time.split(' - ')[1]}
                  </div>
                </div>

                {/* Subject Info */}
                <div style={{ flex: 1 }}>
                  <div style={styles.subjectName}>{period.subject}</div>
                  <div style={styles.facultyName}>
                    👨‍🏫 {period.faculty}
                  </div>
                  <span style={styles.typeBadge(period.type)}>
                    {getTypeColor(period.type).label}
                  </span>
                </div>

                {/* Room */}
                <div style={styles.roomBadge}>
                  📍 {period.room}
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div style={styles.summary}>
        <div style={styles.summaryItem}>
          <div style={styles.summaryDot('#2244cc')}></div>
          Lab Classes
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryDot('#6b7280')}></div>
          Theory Classes
        </div>
        <div style={styles.summaryItem}>
          <div style={styles.summaryDot('#1a8050')}></div>
          Activities
        </div>
        <div style={{ marginLeft:'auto', fontSize:'0.75rem', color:'#8a8a9a' }}>
          {periodsToShow.length} periods today
        </div>
      </div>

    </div>
  );
};
