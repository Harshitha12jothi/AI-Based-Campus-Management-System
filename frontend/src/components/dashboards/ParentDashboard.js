import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIChat from '../AIChat';
import TimetableView from '../TimetableView';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState(null);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);
  const [childInfo, setChildInfo] = useState(null);

  const childRoll = user.childRoll;

  useEffect(() => {
    if (!childRoll) return;
    fetch(`/api/dashboard/student/${childRoll}`, { headers }).then(r => r.json()).then(setStats);
    fetch(`/api/attendance/student/${childRoll}`, { headers }).then(r => r.json()).then(setAttendance);
    fetch(`/api/marks/student/${childRoll}`, { headers }).then(r => r.json()).then(setMarks);
    fetch(`/api/fees/student/${childRoll}`, { headers }).then(r => r.json()).then(setFees);
    fetch('/api/notices', { headers }).then(r => r.json()).then(setNotices);
    fetch(`/api/students`, { headers }).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        const child = data.find(s => s.rollNumber === childRoll);
        if (child) setChildInfo(child);
      }
    });
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const tabs = [
    { id: 'overview',    icon: '◈', label: 'Overview'   },
    { id: 'attendance',  icon: '◉', label: 'Attendance' },
    { id: 'marks',       icon: '◎', label: 'Marks'      },
    { id: 'fees',        icon: '◆', label: 'Fees'       },
    { id: 'notices',     icon: '◐', label: 'Notices'    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .par-page {
          display: grid;
          grid-template-columns: 230px 1fr;
          min-height: 100vh;
          background: #f7f4ed;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SIDEBAR ── */
        .par-sidebar {
          background: #1a1208;
          display: flex; flex-direction: column;
          position: sticky; top: 0;
          height: 100vh; overflow-y: auto;
        }
        .par-sidebar::after {
          content: '';
          position: absolute; top: 0; right: 0;
          width: 1px; height: 100%;
          background: linear-gradient(180deg, rgba(196,160,60,0.5) 0%, rgba(196,160,60,0.15) 50%, transparent 100%);
        }

        .par-sidebar-top { padding: 24px 20px 0; position: relative; }
        .par-sidebar-top::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c4a03c, #e8c84a, #c4a03c);
        }

        .par-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .par-logo-mark {
          width: 30px; height: 30px;
          border: 1.5px solid rgba(196,160,60,0.6);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #c4a03c;
          background: rgba(196,160,60,0.08);
        }
        .par-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem; font-weight: 700;
          color: #f0e8d0; letter-spacing: 0.02em;
        }
        .par-logo-sub {
          font-size: 0.6rem; color: rgba(196,160,60,0.55);
          letter-spacing: 0.12em; text-transform: uppercase;
        }

        .par-avatar {
          text-align: center; padding: 16px 0 14px;
          border-bottom: 1px solid rgba(196,160,60,0.1);
          margin-bottom: 12px;
        }
        .par-avatar-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(196,160,60,0.1);
          border: 1.5px solid rgba(196,160,60,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin: 0 auto 8px;
        }
        .par-avatar-name { font-size: 0.82rem; font-weight: 600; color: #f0e8d0; margin-bottom: 2px; }
        .par-avatar-rel  { font-size: 0.68rem; color: rgba(240,232,208,0.4); margin-bottom: 8px; }
        .par-role-badge {
          display: inline-block;
          background: rgba(196,160,60,0.15);
          color: #d4a830;
          border: 1px solid rgba(196,160,60,0.3);
          font-size: 0.62rem; font-weight: 700;
          padding: 3px 10px; border-radius: 100px;
          letter-spacing: 0.08em; text-transform: uppercase;
        }

        /* Child monitor card */
        .par-child-card {
          background: rgba(196,160,60,0.07);
          border: 1px solid rgba(196,160,60,0.15);
          border-radius: 9px; padding: 11px 13px;
          margin: 0 10px 14px;
        }
        .par-child-label {
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(196,160,60,0.5); margin-bottom: 5px;
        }
        .par-child-name { font-size: 0.84rem; font-weight: 600; color: #f0e8d0; margin-bottom: 2px; }
        .par-child-meta { font-size: 0.72rem; color: rgba(240,232,208,0.4); }

        .par-nav { padding: 0 10px; flex: 1; }
        .par-nav-section {
          font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(196,160,60,0.4); padding: 10px 10px 6px;
        }
        .par-nav-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 12px;
          border-radius: 7px; border: none;
          background: transparent; color: rgba(240,232,208,0.45);
          cursor: pointer; font-size: 0.83rem; font-weight: 500;
          margin-bottom: 2px; font-family: 'DM Sans', sans-serif;
          transition: all 0.16s; text-align: left;
        }
        .par-nav-btn:hover { background: rgba(196,160,60,0.06); color: rgba(240,232,208,0.75); }
        .par-nav-btn.active {
          background: rgba(196,160,60,0.1);
          color: #f0e8d0;
          border-left: 2px solid #c4a03c;
          padding-left: 10px;
        }
        .par-nav-icon { font-size: 12px; color: #c4a03c; opacity: 0.65; width: 14px; }
        .par-nav-btn.active .par-nav-icon { opacity: 1; }

        .par-logout {
          margin: 12px 10px 16px;
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px; border-radius: 7px;
          border: 1px solid rgba(196,160,60,0.15);
          background: transparent; color: rgba(196,160,60,0.55);
          cursor: pointer; font-size: 0.8rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.16s; width: calc(100% - 20px);
        }
        .par-logout:hover { background: rgba(196,160,60,0.08); color: #c4a03c; }

        /* ── MAIN ── */
        .par-main { padding: 28px 32px; overflow-y: auto; }

        .par-topbar {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 24px; padding-bottom: 20px;
          border-bottom: 1px solid rgba(196,160,60,0.18);
        }
        .par-page-kicker {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #8a6f20; margin-bottom: 4px;
        }
        .par-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700;
          color: #1a1208; letter-spacing: -0.3px;
        }
        .par-page-sub { font-size: 0.8rem; color: #7a6a40; margin-top: 2px; }
        .par-page-sub strong { color: #1a1208; font-weight: 600; }
        .par-date-badge {
          background: #fff; border: 1px solid rgba(196,160,60,0.25);
          border-radius: 8px; padding: 8px 14px;
          font-size: 0.78rem; color: #5a4a20; font-weight: 500;
        }

        /* ── ALERTS ── */
        .par-alert-danger {
          background: #fdf1f0; border: 1px solid #f0c8c8;
          border-left: 3px solid #c0392b;
          border-radius: 10px; padding: 14px 18px;
          color: #7a2e2e; font-size: 0.84rem;
          margin-bottom: 16px; line-height: 1.55;
        }
        .par-alert-warn {
          background: #fdf8ec; border: 1px solid rgba(196,160,60,0.35);
          border-left: 3px solid #c4a03c;
          border-radius: 10px; padding: 14px 18px;
          color: #7a5a10; font-size: 0.84rem;
          margin-bottom: 16px; line-height: 1.55;
        }
        .par-alert-none {
          background: #f4f1e8; border: 1px solid rgba(196,160,60,0.2);
          border-radius: 10px; padding: 13px 18px;
          color: #7a6a40; font-size: 0.84rem; margin-bottom: 20px;
        }

        /* ── STAT CARDS ── */
        .par-stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 14px; margin-bottom: 20px;
        }
        .par-stat {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; padding: 18px 16px 14px;
          position: relative; overflow: hidden;
        }
        .par-stat::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
        }
        .par-stat-gold::before   { background: #c4a03c; }
        .par-stat-navy::before   { background: #0d1f3c; }
        .par-stat-green::before  { background: #2c5f3c; }
        .par-stat-danger::before { background: #c0392b; }
        .par-stat-amber::before  { background: #d4870a; }

        .par-stat-icon {
          font-size: 1.05rem; margin-bottom: 10px;
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          background: #f7f4ed; border-radius: 7px;
        }
        .par-stat-label {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #8a7a50; margin-bottom: 5px;
        }
        .par-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700;
          color: #1a1208; line-height: 1; margin-bottom: 3px;
        }
        .par-stat-sub { font-size: 0.72rem; color: #a09060; }

        /* ── SECTION HEADING ── */
        .par-section-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700;
          color: #1a1208; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .par-section-h3::after {
          content: ''; flex: 1;
          height: 1px; background: rgba(196,160,60,0.2);
        }

        /* ── CARDS ── */
        .par-card {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; padding: 18px 20px;
          margin-bottom: 16px;
        }

        /* ── PROGRESS ── */
        .par-progress-row {
          display: flex; justify-content: space-between;
          margin-bottom: 8px; font-size: 0.85rem;
        }
        .par-progress-label { font-weight: 600; color: #1a1208; }
        .par-progress-track {
          height: 8px; background: #f0ece0;
          border-radius: 4px; overflow: hidden; margin: 6px 0;
        }
        .par-progress-fill-safe   { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #2c5f3c, #5a9a6a); transition: width 0.8s ease; }
        .par-progress-fill-danger { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #c0392b, #e05050); transition: width 0.8s ease; }
        .par-progress-note { font-size: 0.75rem; color: #a09060; margin-top: 2px; }

        /* ── TABLE ── */
        .par-table-wrap {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; overflow: hidden;
        }
        .par-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
        .par-table thead tr {
          background: #faf6ea;
          border-bottom: 1px solid rgba(196,160,60,0.2);
        }
        .par-table th {
          padding: 11px 16px; text-align: left;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #8a6f20;
        }
        .par-table td { padding: 11px 16px; color: #2a1e08; }
        .par-table tbody tr { border-top: 1px solid #f4f0e4; }
        .par-table tbody tr:hover { background: #fdf9f0; }

        /* ── STATUS PILL ── */
        .par-pill {
          display: inline-block; padding: 3px 10px;
          border-radius: 100px; font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.04em;
        }
        .par-pill-ok      { background: #f0f7f2; color: #1e5c35; border: 1px solid #b8dfc8; }
        .par-pill-warn    { background: #fdf8ec; color: #8a5e10; border: 1px solid rgba(196,160,60,0.4); }
        .par-pill-danger  { background: #fdf1f0; color: #7a2e2e; border: 1px solid #f0c8c8; }

        /* ── NOTICE CARD ── */
        .par-notice-card {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-left: 3px solid #c4a03c;
          border-radius: 10px; padding: 14px 18px;
          margin-bottom: 10px;
        }
        .par-notice-title { font-weight: 600; font-size: 0.88rem; color: #1a1208; margin-bottom: 4px; }
        .par-notice-content { font-size: 0.8rem; color: #7a6a40; margin-bottom: 6px; line-height: 1.55; }
        .par-notice-meta { font-size: 0.68rem; color: #b0950a; opacity: 0.7; }
      `}</style>

      <div className="par-page">
        {/* ── SIDEBAR ── */}
        <aside className="par-sidebar">
          <div className="par-sidebar-top">
            <div className="par-logo">
              <div className="par-logo-mark">👨‍👩‍👦</div>
              <div>
                <div className="par-logo-text">EduAI Campus</div>
                <div className="par-logo-sub">Parent Portal</div>
              </div>
            </div>

            <div className="par-avatar">
              <div className="par-avatar-icon">👨‍👩‍👦</div>
              <div className="par-avatar-name">{user.firstName} {user.lastName}</div>
              <div className="par-avatar-rel">{user.relation}</div>
              <span className="par-role-badge">Parent</span>
            </div>
          </div>

          {childRoll && (
            <div className="par-child-card">
              <div className="par-child-label">Monitoring</div>
              <div className="par-child-name">
                {childInfo ? `${childInfo.firstName} ${childInfo.lastName}` : childRoll}
              </div>
              <div className="par-child-meta">
                {childInfo?.semester || ''}{childInfo?.department ? ` · ${childInfo.department.split(' ')[0]}` : ''}
              </div>
            </div>
          )}

          <nav className="par-nav">
            <div className="par-nav-section">Parent Menu</div>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`par-nav-btn${activeTab === tab.id ? ' active' : ''}`}
              >
                <span className="par-nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <button onClick={logout} className="par-logout">← Sign Out</button>
        </aside>

        {/* ── MAIN ── */}
        <main className="par-main">
          <div className="par-topbar">
            <div>
              <div className="par-page-kicker">Parent Dashboard</div>
              <h1 className="par-page-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className="par-page-sub">
                Tracking: <strong>{childInfo ? `${childInfo.firstName} ${childInfo.lastName}` : childRoll || 'No child linked'}</strong>
              </p>
            </div>
            <div className="par-date-badge">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {!childRoll && (
            <div className="par-alert-none">
              ⚠ No child roll number linked to your account. Please contact the administrator.
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <div className="par-stats-grid">
                <StatCard accent={stats?.attendancePct >= 75 ? 'green' : 'danger'} icon="◉" label="Attendance"  value={stats ? `${stats.attendancePct}%` : '—'} sub={stats?.attendancePct >= 75 ? 'Safe ✓' : 'At Risk ⚠'} />
                <StatCard accent="navy"  icon="◎" label="Avg Marks"   value={stats ? `${stats.avgMarks}%` : '—'}    sub={`Grade: ${stats?.grade || '—'}`} />
                <StatCard accent={stats?.pendingFees > 0 ? 'danger' : 'green'} icon="◆" label="Fee Pending" value={stats ? `₹${(stats.pendingFees / 1000).toFixed(0)}K` : '—'} sub={stats?.pendingFees > 0 ? 'Action needed' : 'All clear'} />
                <StatCard accent="gold"  icon="◈" label="Subjects"    value={marks ? [...new Set(marks.records.map(r => r.subject))].length : '—'} sub="enrolled" />
              </div>

              {stats?.attendancePct < 75 && (
                <div className="par-alert-danger">
                  <strong>Attendance Alert!</strong> Your child's attendance is {stats.attendancePct}%, below the 75% minimum. Please ensure regular attendance to avoid academic penalties.
                </div>
              )}
              {fees?.summary.pending > 0 && (
                <div className="par-alert-warn">
                  <strong>Fee Due:</strong> ₹{fees.summary.pending.toLocaleString()} is outstanding. Please clear dues to avoid late charges.
                </div>
              )}

              <h3 className="par-section-h3">Latest Notices</h3>
              {notices.slice(0, 4).map((n, i) => (
                <div key={i} className="par-notice-card">
                  <div className="par-notice-title">{n.title}</div>
                  <div className="par-notice-content">{n.content}</div>
                  <div className="par-notice-meta">{new Date(n.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {activeTab === 'attendance' && attendance && (
            <div>
              <div className="par-stats-grid">
                <StatCard accent="navy"   icon="◈" label="Total Classes" value={attendance.summary.total}   sub="recorded" />
                <StatCard accent="green"  icon="◉" label="Present"       value={attendance.summary.present}  sub="days" />
                <StatCard accent="danger" icon="◎" label="Absent"        value={attendance.summary.absent}   sub="days" />
                <StatCard accent={attendance.summary.percentage >= 75 ? 'green' : 'danger'} icon="◆" label="Percentage" value={`${attendance.summary.percentage}%`} sub={attendance.summary.percentage >= 75 ? 'Safe' : '⚠ At Risk'} />
              </div>

              <div className="par-card">
                <div className="par-progress-row">
                  <span className="par-progress-label">Overall Attendance</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: attendance.summary.percentage >= 75 ? '#2c5f3c' : '#c0392b' }}>
                    {attendance.summary.percentage}%
                  </span>
                </div>
                <div className="par-progress-track">
                  <div
                    className={attendance.summary.percentage >= 75 ? 'par-progress-fill-safe' : 'par-progress-fill-danger'}
                    style={{ width: `${attendance.summary.percentage}%` }}
                  />
                </div>
                <div className="par-progress-note">Minimum required: 75%</div>
              </div>

              <div className="par-table-wrap">
                <table className="par-table">
                  <thead><tr><th>Date</th><th>Subject</th><th>Status</th></tr></thead>
                  <tbody>
                    {attendance.records.slice(0, 15).map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: '#7a6a40', fontSize: '0.82rem' }}>{new Date(r.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 500 }}>{r.subject}</td>
                        <td>
                          <span className={`par-pill ${r.status === 'present' ? 'par-pill-ok' : r.status === 'late' ? 'par-pill-warn' : 'par-pill-danger'}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── MARKS ── */}
          {activeTab === 'marks' && marks && (
            <div>
              <div className="par-stats-grid">
                <StatCard accent="navy"  icon="◈" label="Average"  value={`${marks.average}%`}        sub="overall" />
                <StatCard accent="gold"  icon="◎" label="Grade"    value={marks.grade}                 sub="current" />
                <StatCard accent="green" icon="◉" label="Subjects" value={[...new Set(marks.records.map(r => r.subject))].length} sub="subjects" />
                <StatCard accent="amber" icon="◆" label="Exams"    value={marks.records.length}        sub="entries" />
              </div>
              <div className="par-table-wrap">
                <table className="par-table">
                  <thead><tr><th>Subject</th><th>Exam</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th></tr></thead>
                  <tbody>
                    {marks.records.map((r, i) => {
                      const pct = Math.round((r.marks / r.maxMarks) * 100);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 500 }}>{r.subject}</td>
                          <td style={{ textTransform: 'capitalize', color: '#7a6a40', fontSize: '0.82rem' }}>{r.examType}</td>
                          <td style={{ fontWeight: 600, color: '#1a1208' }}>{r.marks}</td>
                          <td style={{ color: '#a09060' }}>{r.maxMarks}</td>
                          <td style={{ fontWeight: 600, color: pct >= 75 ? '#2c5f3c' : pct >= 50 ? '#8a5e10' : '#c0392b' }}>{pct}%</td>
                          <td>
                            <span className={`par-pill ${pct >= 75 ? 'par-pill-ok' : pct >= 50 ? 'par-pill-warn' : 'par-pill-danger'}`}>
                              {r.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── FEES ── */}
          {activeTab === 'fees' && fees && (
            <div>
              <div className="par-stats-grid">
                <StatCard accent="navy"   icon="◈" label="Total"       value={`₹${(fees.summary.total / 1000).toFixed(0)}K`}   sub="this semester" />
                <StatCard accent="green"  icon="◉" label="Paid"        value={`₹${(fees.summary.paid / 1000).toFixed(0)}K`}    sub="cleared" />
                <StatCard accent="danger" icon="◎" label="Pending"     value={`₹${(fees.summary.pending / 1000).toFixed(0)}K`} sub="remaining" />
                <StatCard accent="gold"   icon="◆" label="Records"     value={fees.fees.length}                                sub="entries" />
              </div>

              <div className="par-card" style={{ marginBottom: '16px' }}>
                <div className="par-progress-row">
                  <span className="par-progress-label">Fee Collection Progress</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2c5f3c' }}>
                    {fees.summary.total ? `${Math.round(fees.summary.paid / fees.summary.total * 100)}%` : '0%'} paid
                  </span>
                </div>
                <div className="par-progress-track" style={{ height: '10px' }}>
                  <div
                    className="par-progress-fill-safe"
                    style={{ width: fees.summary.total ? `${(fees.summary.paid / fees.summary.total * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              <div className="par-table-wrap">
                <table className="par-table">
                  <thead><tr><th>Receipt</th><th>Type</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
                  <tbody>
                    {fees.fees.map((f, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: '0.78rem', color: '#a09060' }}>{f.receiptNo}</td>
                        <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>{f.feeType}</td>
                        <td style={{ fontWeight: 600, color: '#1a1208' }}>₹{f.amount.toLocaleString()}</td>
                        <td>
                          <span className={`par-pill ${f.status === 'paid' ? 'par-pill-ok' : 'par-pill-danger'}`}>
                            {f.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#7a6a40' }}>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── NOTICES ── */}
          {activeTab === 'notices' && (
            <div>
              <h3 className="par-section-h3">Notice Board</h3>
              {notices.map((n, i) => (
                <div key={i} className="par-notice-card">
                  <div className="par-notice-title">{n.title}</div>
                  <div className="par-notice-content">{n.content}</div>
                  <div className="par-notice-meta">{new Date(n.date).toLocaleString()}</div>
                </div>
              ))}
              {notices.length === 0 && (
                <p style={{ color: '#8a7a50', fontStyle: 'italic', fontSize: '0.88rem' }}>No notices available.</p>
              )}
            </div>
          )}
        </main>
        <AIChat userRole="parent"  userName={user.firstName} />
      </div>
    </>
  );
};

const StatCard = ({ accent, icon, label, value, sub }) => (
  <div className={`par-stat par-stat-${accent}`}>
    <div className="par-stat-icon">{icon}</div>
    <div className="par-stat-label">{label}</div>
    <div className="par-stat-value">{value}</div>
    <div className="par-stat-sub">{sub}</div>
  </div>
);

export default ParentDashboard;