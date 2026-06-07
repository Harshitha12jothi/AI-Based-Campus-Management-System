import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIChat from '../AIChat';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [fees, setFees] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', targetRole: 'all' });

  useEffect(() => {
    fetch('/api/dashboard/admin', { headers }).then(r => r.json()).then(setStats);
    fetch('/api/students', { headers }).then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : []));
    fetch('/api/notices', { headers }).then(r => r.json()).then(setNotices);
    fetch('/api/fees/stats', { headers }).then(r => r.json()).then(setFees);
  }, []);

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const postNotice = async () => {
    if (!noticeForm.title || !noticeForm.content) { setMsg({ type: 'error', text: 'Fill title and content.' }); return; }
    const res = await fetch('/api/notices', { method: 'POST', headers, body: JSON.stringify(noticeForm) });
    const data = await res.json();
    if (res.ok) {
      setMsg({ type: 'success', text: 'Notice posted!' });
      setNoticeForm({ title: '', content: '', targetRole: 'all' });
      fetch('/api/notices', { headers }).then(r => r.json()).then(setNotices);
    } else {
      setMsg({ type: 'error', text: data.message });
    }
  };

  const tabs = [
    { id: 'overview', icon: '◈', label: 'Overview'  },
    { id: 'students', icon: '◉', label: 'Students'  },
    { id: 'fees',     icon: '◎', label: 'Fees'      },
    { id: 'notices',  icon: '◆', label: 'Notices'   },
    { id: 'system',   icon: '◐', label: 'System'    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .adm-page {
          display: grid;
          grid-template-columns: 230px 1fr;
          min-height: 100vh;
          background: #f4f1e8;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── SIDEBAR ── */
        .adm-sidebar {
          background: #0d1f3c;
          display: flex;
          flex-direction: column;
          padding: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }
        .adm-sidebar::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 1px; height: 100%;
          background: linear-gradient(180deg, rgba(196,160,60,0.4) 0%, rgba(44,95,60,0.3) 50%, transparent 100%);
        }

        .adm-sidebar-top {
          padding: 24px 20px 0;
          position: relative;
        }
        .adm-sidebar-top::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c4a03c, #2c5f3c);
        }

        .adm-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
        }
        .adm-logo-mark {
          width: 30px; height: 30px;
          border: 1.5px solid #c4a03c;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; color: #c4a03c;
        }
        .adm-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #e8dfc8;
          letter-spacing: 0.02em;
        }
        .adm-logo-sub {
          font-size: 0.6rem;
          color: rgba(196,160,60,0.6);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .adm-avatar {
          text-align: center;
          padding: 16px 0 20px;
          border-bottom: 1px solid rgba(196,160,60,0.12);
          margin-bottom: 10px;
        }
        .adm-avatar-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(196,160,60,0.12);
          border: 1.5px solid rgba(196,160,60,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          margin: 0 auto 8px;
        }
        .adm-avatar-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #e8dfc8;
          margin-bottom: 2px;
        }
        .adm-avatar-email {
          font-size: 0.68rem;
          color: rgba(232,223,200,0.4);
          margin-bottom: 8px;
        }
        .adm-role-badge {
          display: inline-block;
          background: rgba(196,160,60,0.15);
          color: #c4a03c;
          border: 1px solid rgba(196,160,60,0.3);
          font-size: 0.62rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 100px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .adm-nav { padding: 0 10px; flex: 1; }
        .adm-nav-section {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(196,160,60,0.45);
          padding: 12px 10px 6px;
        }
        .adm-nav-btn {
          display: flex; align-items: center; gap: 10px;
          width: 100%; padding: 9px 12px;
          border-radius: 7px; border: none;
          background: transparent;
          color: rgba(232,223,200,0.5);
          cursor: pointer; font-size: 0.83rem;
          font-weight: 500; margin-bottom: 2px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.16s;
          text-align: left;
        }
        .adm-nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(232,223,200,0.8); }
        .adm-nav-btn.active {
          background: rgba(196,160,60,0.1);
          color: #e8dfc8;
          border-left: 2px solid #c4a03c;
          padding-left: 10px;
        }
        .adm-nav-icon {
          font-size: 12px; color: #c4a03c; opacity: 0.7; width: 14px;
        }
        .adm-nav-btn.active .adm-nav-icon { opacity: 1; }

        .adm-logout {
          margin: 12px 10px 16px;
          display: flex; align-items: center; gap: 8px;
          padding: 9px 12px;
          border-radius: 7px;
          border: 1px solid rgba(196,160,60,0.15);
          background: transparent;
          color: rgba(196,160,60,0.6);
          cursor: pointer; font-size: 0.8rem;
          font-weight: 500; font-family: 'DM Sans', sans-serif;
          transition: all 0.16s; width: calc(100% - 20px);
        }
        .adm-logout:hover { background: rgba(196,160,60,0.08); color: #c4a03c; }

        /* ── MAIN ── */
        .adm-main {
          padding: 28px 32px;
          overflow-y: auto;
        }

        .adm-topbar {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(196,160,60,0.2);
        }
        .adm-page-kicker {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #2c5f3c; margin-bottom: 4px;
        }
        .adm-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700;
          color: #0d1f3c; letter-spacing: -0.3px;
        }
        .adm-page-sub { font-size: 0.8rem; color: #8a7a60; margin-top: 2px; }

        .adm-date-badge {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.25);
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 0.78rem;
          color: #5a4f3a;
          font-weight: 500;
        }

        /* ── MSG ── */
        .adm-msg {
          padding: 11px 14px; border-radius: 8px;
          font-size: 0.84rem; margin-bottom: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .adm-msg-err { background: #fdf1f0; color: #7a2e2e; border: 1px solid #f0c8c8; }
        .adm-msg-ok  { background: #f0f7f2; color: #1e5c35; border: 1px solid #b8dfc8; }
        .adm-msg-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: inherit; opacity: 0.6; }

        /* ── STAT CARDS ── */
        .adm-stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 14px; margin-bottom: 20px;
        }
        .adm-stat {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; padding: 18px 18px 14px;
          position: relative; overflow: hidden;
        }
        .adm-stat::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
        }
        .adm-stat-navy::before  { background: #0d1f3c; }
        .adm-stat-gold::before  { background: #c4a03c; }
        .adm-stat-green::before { background: #2c5f3c; }
        .adm-stat-rust::before  { background: #8b3a2a; }
        .adm-stat-blue::before  { background: #1a4a7a; }

        .adm-stat-icon {
          font-size: 1.1rem; margin-bottom: 10px;
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px;
          background: #f4f1e8; border-radius: 8px;
        }
        .adm-stat-label {
          font-size: 0.68rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #8a7a60; margin-bottom: 6px;
        }
        .adm-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.65rem; font-weight: 700;
          color: #0d1f3c; line-height: 1; margin-bottom: 3px;
        }
        .adm-stat-sub { font-size: 0.72rem; color: #a09070; }

        /* ── CARDS ── */
        .adm-card {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; padding: 18px 20px;
        }
        .adm-card-label {
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #8a7a60; margin-bottom: 12px;
          display: flex; align-items: center; gap: 7px;
        }
        .adm-card-label::before {
          content: '';
          width: 14px; height: 1px;
          background: #c4a03c; opacity: 0.6;
        }
        .adm-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }

        /* ── PROGRESS BAR ── */
        .adm-progress-track {
          height: 7px; background: #f0ece0; border-radius: 4px;
          overflow: hidden; margin: 10px 0 8px;
        }
        .adm-progress-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, #c4a03c, #2c5f3c);
          transition: width 0.6s ease;
        }

        /* ── SECTION HEADING ── */
        .adm-section-h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700;
          color: #0d1f3c; margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .adm-section-h3::after {
          content: ''; flex: 1;
          height: 1px; background: rgba(196,160,60,0.2);
        }

        /* ── TABLE ── */
        .adm-table-wrap {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; overflow: hidden;
        }
        .adm-table {
          width: 100%; border-collapse: collapse;
          font-size: 0.84rem;
        }
        .adm-table thead tr {
          background: #f9f6ee;
          border-bottom: 1px solid rgba(196,160,60,0.2);
        }
        .adm-table th {
          padding: 11px 16px;
          text-align: left;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #8a7a60;
        }
        .adm-table td { padding: 11px 16px; color: #2a2010; }
        .adm-table tbody tr { border-top: 1px solid #f4f0e4; }
        .adm-table tbody tr:hover { background: #faf8f2; }

        /* ── FORM ── */
        .adm-form-card {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; padding: 22px;
          margin-bottom: 18px;
        }
        .adm-form-group { margin-bottom: 14px; }
        .adm-label {
          display: block; font-size: 0.75rem;
          font-weight: 600; letter-spacing: 0.03em;
          color: #0d1f3c; opacity: 0.7; margin-bottom: 6px;
        }
        .adm-input {
          width: 100%; padding: 9px 13px;
          border: 1.5px solid #e6dfc8;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.87rem; background: #fdfbf5;
          color: #0d1f3c; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .adm-input:focus {
          border-color: #c4a03c;
          box-shadow: 0 0 0 3px rgba(196,160,60,0.1);
          background: #fff;
        }

        /* ── BTN ── */
        .adm-btn {
          background: #0d1f3c; color: #e8dfc8;
          border: none; border-radius: 8px;
          padding: 10px 22px; cursor: pointer;
          font-weight: 600; font-size: 0.85rem;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.18s;
          display: inline-flex; align-items: center; gap: 7px;
          position: relative; overflow: hidden;
        }
        .adm-btn::before {
          content: ''; position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #c4a03c, #2c5f3c);
        }
        .adm-btn:hover { background: #162e58; }

        /* ── NOTICE CARD ── */
        .adm-notice-card {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-left: 3px solid #c4a03c;
          border-radius: 10px; padding: 14px 18px;
          margin-bottom: 10px;
        }
        .adm-notice-title {
          font-weight: 600; font-size: 0.88rem;
          color: #0d1f3c; margin-bottom: 4px;
        }
        .adm-notice-content {
          font-size: 0.8rem; color: #7a6f58; margin-bottom: 6px;
          line-height: 1.55;
        }
        .adm-notice-meta {
          font-size: 0.68rem; color: #b0a080;
          display: flex; align-items: center; justify-content: space-between;
        }
        .adm-tag {
          display: inline-block; padding: 2px 9px;
          border-radius: 100px; font-size: 0.65rem;
          font-weight: 700; letter-spacing: 0.07em;
          background: rgba(44,95,60,0.1);
          color: #2c5f3c; border: 1px solid rgba(44,95,60,0.2);
          text-transform: uppercase;
        }

        /* ── SYSTEM CARD ── */
        .adm-system-card {
          background: #fff;
          border: 1px solid rgba(196,160,60,0.18);
          border-radius: 12px; padding: 20px;
          text-align: center;
        }
        .adm-system-icon {
          width: 48px; height: 48px;
          background: #f4f1e8;
          border: 1px solid rgba(196,160,60,0.25);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; margin: 0 auto 12px;
        }
        .adm-system-label {
          font-weight: 700; font-size: 0.85rem;
          color: #0d1f3c; margin-bottom: 8px;
        }
        .adm-status-badge {
          display: inline-block; padding: 3px 10px;
          border-radius: 100px; font-size: 0.65rem;
          font-weight: 700; letter-spacing: 0.07em;
          background: rgba(44,95,60,0.1);
          color: #2c5f3c; border: 1px solid rgba(44,95,60,0.3);
          text-transform: uppercase;
        }

        /* ── KV ROW ── */
        .adm-kv-row {
          display: flex; padding: 9px 0;
          border-bottom: 1px solid #f4f0e4;
          font-size: 0.84rem;
        }
        .adm-kv-key { width: 160px; color: #8a7a60; flex-shrink: 0; font-size: 0.8rem; }
        .adm-kv-val { font-weight: 500; color: #1a1408; }

        .adm-summary-row {
          display: flex; justify-content: space-between;
          padding: 7px 0; border-bottom: 1px solid #f4f0e4;
          font-size: 0.84rem;
        }
        .adm-summary-key { color: #8a7a60; font-size: 0.8rem; }
        .adm-summary-val { font-weight: 600; color: #0d1f3c; }
      `}</style>

      <div className="adm-page">
        {/* ── SIDEBAR ── */}
        <aside className="adm-sidebar">
          <div className="adm-sidebar-top">
            <div className="adm-logo">
              <div className="adm-logo-mark">🎓</div>
              <div>
                <div className="adm-logo-text">EduAI Campus</div>
                <div className="adm-logo-sub">Admin Portal</div>
              </div>
            </div>

            <div className="adm-avatar">
              <div className="adm-avatar-icon">🛡️</div>
              <div className="adm-avatar-name">{user.firstName} {user.lastName}</div>
              <div className="adm-avatar-email">{user.email}</div>
              <span className="adm-role-badge">Administrator</span>
            </div>
          </div>

          <nav className="adm-nav">
            <div className="adm-nav-section">Main Menu</div>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`adm-nav-btn${activeTab === tab.id ? ' active' : ''}`}
              >
                <span className="adm-nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <button onClick={logout} className="adm-logout">
            ← Sign Out
          </button>
        </aside>

        {/* ── MAIN ── */}
        <main className="adm-main">
          <div className="adm-topbar">
            <div>
              <div className="adm-page-kicker">Admin Dashboard</div>
              <h1 className="adm-page-title">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="adm-page-sub">Full system access · Academic Management System</p>
            </div>
            <div className="adm-date-badge">
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {msg.text && (
            <div className={`adm-msg ${msg.type === 'error' ? 'adm-msg-err' : 'adm-msg-ok'}`}>
              <span>{msg.text}</span>
              <button className="adm-msg-close" onClick={() => setMsg({ type: '', text: '' })}>×</button>
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              <div className="adm-stats-grid">
                <StatCard accent="navy"  icon="🎓" label="Total Students" value={stats?.students ?? '—'}       sub="enrolled" />
                <StatCard accent="gold"  icon="📖" label="Faculty"         value={stats?.faculty ?? '—'}        sub="staff members" />
                <StatCard accent="green" icon="✓"  label="Avg Attendance"  value={stats ? `${stats.avgAttendance}%` : '—'} sub="campus-wide" />
                <StatCard accent="rust"  icon="◈"  label="Avg Marks"       value={stats ? `${stats.avgMarks}%` : '—'} sub="all students" />
              </div>

              <div className="adm-two-col">
                <div className="adm-card">
                  <div className="adm-card-label">Fee Collection</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', fontWeight: 700, color: '#0d1f3c', marginBottom: '6px' }}>
                    ₹{fees ? (fees.paid / 1000).toFixed(0) : 0}K
                  </div>
                  <div className="adm-progress-track">
                    <div className="adm-progress-fill" style={{ width: fees?.total ? `${(fees.paid / fees.total * 100)}%` : '0%' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#8a7a60' }}>
                    <span>Collected: ₹{fees ? (fees.paid / 1000).toFixed(0) : 0}K</span>
                    <span>Pending: ₹{fees ? (fees.pending / 1000).toFixed(0) : 0}K</span>
                  </div>
                </div>

                <div className="adm-card">
                  <div className="adm-card-label">System Summary</div>
                  {[
                    ['Total Notices',  notices.length],
                    ['Fee Records',    fees?.count ?? 0],
                    ['Departments',    '6'],
                    ['AI Modules',     '4'],
                  ].map(([l, v]) => (
                    <div key={l} className="adm-summary-row">
                      <span className="adm-summary-key">{l}</span>
                      <span className="adm-summary-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="adm-section-h3">Recently Registered Students</h3>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>Roll No.</th><th>Name</th><th>Department</th><th>Semester</th></tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 5).map((st, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: '#0d1f3c' }}>{st.rollNumber}</td>
                        <td>{st.firstName} {st.lastName}</td>
                        <td style={{ color: '#8a7a60', fontSize: '0.8rem' }}>{st.department}</td>
                        <td>{st.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STUDENTS ── */}
          {activeTab === 'students' && (
            <div>
              <h3 className="adm-section-h3">All Students ({students.length})</h3>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr><th>#</th><th>Roll No.</th><th>Name</th><th>Email</th><th>Department</th><th>Semester</th><th>Phone</th></tr>
                  </thead>
                  <tbody>
                    {students.map((st, i) => (
                      <tr key={i}>
                        <td style={{ color: '#b0a080' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#0d1f3c' }}>{st.rollNumber}</td>
                        <td>{st.firstName} {st.lastName}</td>
                        <td style={{ color: '#8a7a60', fontSize: '0.78rem' }}>{st.email}</td>
                        <td style={{ fontSize: '0.8rem' }}>{st.department}</td>
                        <td>{st.semester}</td>
                        <td style={{ color: '#8a7a60', fontSize: '0.78rem' }}>{st.phone || '—'}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: '#8a7a60', padding: '28px', fontStyle: 'italic' }}>
                          No students found.{' '}
                          <a href="/api/seed" target="_blank" style={{ color: '#2c5f3c', fontWeight: 600 }}>Seed demo data?</a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── FEES ── */}
          {activeTab === 'fees' && (
            <div>
              <div className="adm-stats-grid">
                <StatCard accent="navy"  icon="₹"  label="Total Fees"   value={`₹${fees ? (fees.total / 1000).toFixed(0) : 0}K`}   sub="all records" />
                <StatCard accent="green" icon="✓"  label="Collected"    value={`₹${fees ? (fees.paid / 1000).toFixed(0) : 0}K`}    sub="received" />
                <StatCard accent="rust"  icon="⏳" label="Pending"      value={`₹${fees ? (fees.pending / 1000).toFixed(0) : 0}K`} sub="outstanding" />
                <StatCard accent="gold"  icon="◈"  label="Transactions" value={fees?.count ?? 0} sub="records" />
              </div>
              <div className="adm-card">
                <div className="adm-card-label">Collection Progress</div>
                <div className="adm-progress-track" style={{ height: '10px' }}>
                  <div className="adm-progress-fill" style={{ width: fees?.total ? `${(fees.paid / fees.total * 100).toFixed(0)}%` : '0%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#8a7a60' }}>
                  <span>{fees?.total ? `${(fees.paid / fees.total * 100).toFixed(0)}% collected` : '0% collected'}</span>
                  <span>Target: ₹{fees ? (fees.total / 1000).toFixed(0) : 0}K</span>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTICES ── */}
          {activeTab === 'notices' && (
            <div>
              <div className="adm-form-card">
                <h3 className="adm-section-h3">Post New Notice</h3>
                <div className="adm-form-group">
                  <label className="adm-label">Title</label>
                  <input value={noticeForm.title} onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))} placeholder="Notice title..." className="adm-input" />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Content</label>
                  <textarea value={noticeForm.content} onChange={e => setNoticeForm(f => ({ ...f, content: e.target.value }))} placeholder="Notice content..." className="adm-input" style={{ height: '80px', resize: 'vertical' }} />
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Target Audience</label>
                  <select value={noticeForm.targetRole} onChange={e => setNoticeForm(f => ({ ...f, targetRole: e.target.value }))} className="adm-input">
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                    <option value="parent">Parents Only</option>
                  </select>
                </div>
                <button onClick={postNotice} className="adm-btn">◆ Post Notice</button>
              </div>

              <h3 className="adm-section-h3">All Notices</h3>
              {notices.map((n, i) => (
                <div key={i} className="adm-notice-card">
                  <div className="adm-notice-title">{n.title}</div>
                  <div className="adm-notice-content">{n.content}</div>
                  <div className="adm-notice-meta">
                    <span>{new Date(n.date).toLocaleString()}</span>
                    <span className="adm-tag">{n.targetRole}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── SYSTEM ── */}
          {activeTab === 'system' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px' }}>
                {[['🤖','AI Chatbot'],['📉','Attendance AI'],['🎯','Marks Predictor'],['🚀','Placement AI']].map(([icon, label]) => (
                  <div key={label} className="adm-system-card">
                    <div className="adm-system-icon">{icon}</div>
                    <div className="adm-system-label">{label}</div>
                    <span className="adm-status-badge">● Active</span>
                  </div>
                ))}
              </div>

              <div className="adm-form-card">
                <h3 className="adm-section-h3">System Information</h3>
                {[
                  ['Stack',         'MERN (MongoDB, Express, React, Node.js)'],
                  ['AI Engine',     'Anthropic Claude API'],
                  ['Auth',          'JWT + bcrypt'],
                  ['Database',      'MongoDB with Mongoose'],
                  ['Backend Port',  '5000'],
                  ['Frontend',      'React 18 + React Router v6'],
                ].map(([k, v]) => (
                  <div key={k} className="adm-kv-row">
                    <span className="adm-kv-key">{k}</span>
                    <span className="adm-kv-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="adm-form-card" style={{ marginTop: '16px' }}>
                <h3 className="adm-section-h3">Seed Demo Data</h3>
                <p style={{ fontSize: '0.84rem', color: '#8a7a60', marginBottom: '14px', lineHeight: 1.6 }}>
                  Populate the database with demo students, attendance, marks and fee records for testing.
                </p>
                <a href="/api/seed" target="_blank" style={{ textDecoration: 'none' }}>
                  <button className="adm-btn">◈ Run Seed Script</button>
                </a>
              </div>
            </div>
          )}
        </main>
        <AIChat userRole="admin"   userName={user.firstName} /> 
      </div>
    </>
  );
};

const StatCard = ({ accent, icon, label, value, sub }) => (
  <div className={`adm-stat adm-stat-${accent}`}>
    <div className="adm-stat-icon">{icon}</div>
    <div className="adm-stat-label">{label}</div>
    <div className="adm-stat-value">{value}</div>
    <div className="adm-stat-sub">{sub}</div>
  </div>
);

export default AdminDashboard;