import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dashMap = {
      admin:   '/dashboard/admin',
      student: '/dashboard/student',
      faculty: '/dashboard/faculty',
      parent:  '/dashboard/parent',
    };

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const role = data.user?.role;
      navigate(dashMap[role] || '/dashboard/student');

    } catch (err) {
      console.log('Login error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d1b3e; }

        .lp-page {
          display: flex;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
          color: #e4dbc6;
          background: #0d1b3e;
        }

        .lp-left {
          flex: 1.1;
          background: #07102a;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 56px;
          border-right: 1px solid rgba(201,146,42,0.12);
        }

        .lp-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,146,42,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,146,42,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .lp-left::after {
          content: '';
          position: absolute;
          bottom: -120px; left: -80px;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,107,69,0.12) 0%, transparent 65%);
          pointer-events: none;
        }

        .lp-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative; z-index: 1;
        }
        .lp-brand-seal {
          width: 42px; height: 42px;
          border-radius: 8px;
          border: 1.5px solid rgba(201,146,42,0.35);
          display: flex; align-items: center; justify-content: center;
          background: rgba(201,146,42,0.08);
        }
        .lp-brand-seal svg { width: 20px; height: 20px; }
        .lp-brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem;
          font-weight: 600;
          color: #f0ead8;
          letter-spacing: 0.3px;
        }

        .lp-hero { position: relative; z-index: 1; }
        .lp-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 0.72rem; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase;
          color: #c9922a; margin-bottom: 20px;
        }
        .lp-hero-eyebrow::before {
          content: ''; width: 22px; height: 1px; background: currentColor;
        }
        .lp-hero h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.6rem, 3.5vw, 3.6rem);
          font-weight: 600;
          color: #f0ead8;
          line-height: 1.08;
          letter-spacing: -1px;
          margin-bottom: 18px;
        }
        .lp-hero h1 em { font-style: italic; color: #e8b84b; }
        .lp-hero-sub {
          font-size: 1rem;
          color: rgba(228,219,198,0.45);
          line-height: 1.8;
          font-weight: 300;
          max-width: 380px;
        }

        .lp-features {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 16px;
        }
        .lp-feature { display: flex; align-items: flex-start; gap: 14px; }
        .lp-feature-icon {
          width: 32px; height: 32px; border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0; margin-top: 1px;
        }
        .lp-feature-title {
          font-size: 0.9rem; font-weight: 500;
          color: rgba(228,219,198,0.8); margin-bottom: 2px;
        }
        .lp-feature-desc {
          font-size: 0.8rem; color: rgba(228,219,198,0.35);
          font-weight: 300; line-height: 1.5;
        }

        .lp-rule {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #c9922a, #1e6b45);
          border-radius: 2px; margin-bottom: 36px;
        }

        .lp-right {
          flex: 0.9; background: #0d1b3e;
          display: flex; align-items: center; justify-content: center;
          padding: 48px 40px;
        }

        .lp-card { width: 100%; max-width: 400px; }

        .lp-card-header { margin-bottom: 36px; }
        .lp-card-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.4rem; font-weight: 600; color: #f0ead8;
          letter-spacing: -0.5px; line-height: 1.05; margin-bottom: 8px;
        }
        .lp-card-sub { font-size: 0.9rem; color: rgba(228,219,198,0.38); font-weight: 300; }

        .lp-error {
          display: flex; align-items: center; gap: 10px;
          background: rgba(158,42,43,0.12);
          border: 1px solid rgba(158,42,43,0.3);
          color: #d97070; border-radius: 8px;
          padding: 11px 14px; font-size: 0.85rem; margin-bottom: 24px;
        }
        .lp-error-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #d97070; flex-shrink: 0;
        }

        .lp-form { display: flex; flex-direction: column; gap: 22px; }
        .lp-field { display: flex; flex-direction: column; gap: 8px; }
        .lp-label {
          font-size: 0.78rem; font-weight: 500;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(228,219,198,0.45);
        }
        .lp-input {
          padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,146,42,0.15);
          border-radius: 8px; font-size: 0.95rem; color: #f0ead8;
          font-family: 'DM Sans', sans-serif; font-weight: 300; outline: none;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .lp-input::placeholder { color: rgba(228,219,198,0.2); }
        .lp-input:focus {
          border-color: rgba(201,146,42,0.5);
          background: rgba(201,146,42,0.05);
          box-shadow: 0 0 0 3px rgba(201,146,42,0.08);
        }

        .lp-forgot-row { display: flex; justify-content: flex-end; margin-top: -10px; }
        .lp-forgot {
          font-size: 0.8rem; color: rgba(228,219,198,0.35);
          text-decoration: none; transition: color 0.2s;
        }
        .lp-forgot:hover { color: #c9922a; }

        .lp-btn {
          width: 100%; padding: 14px; background: #1e6b45; color: #f0ead8;
          border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          letter-spacing: 0.3px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          min-height: 48px; margin-top: 4px; position: relative; overflow: hidden;
        }
        .lp-btn:hover { background: #27855a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,107,69,0.3); }
        .lp-btn:active { transform: scale(0.99); }
        .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        @keyframes lp-spin { to { transform: rotate(360deg); } }
        .lp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(240,234,216,0.25);
          border-top-color: #f0ead8; border-radius: 50%;
          animation: lp-spin 0.7s linear infinite; flex-shrink: 0;
        }

        .lp-register {
          text-align: center; font-size: 0.85rem;
          color: rgba(228,219,198,0.32); margin-top: 28px;
        }
        .lp-register a {
          color: #c9922a; font-weight: 500;
          text-decoration: none; transition: color 0.2s;
        }
        .lp-register a:hover { color: #e8b84b; }

        .lp-roles {
          display: flex; gap: 8px; flex-wrap: wrap;
          margin-top: 32px; padding-top: 28px;
          border-top: 1px solid rgba(201,146,42,0.1);
        }
        .lp-role-badge {
          font-size: 0.68rem; font-weight: 500;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 10px; border-radius: 4px; border: 1px solid;
        }

        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: none; }
        }
        .lp-card     { animation: lp-fade-up 0.7s 0.15s cubic-bezier(.22,1,.36,1) both; }
        .lp-hero     { animation: lp-fade-up 0.7s 0.0s  cubic-bezier(.22,1,.36,1) both; }
        .lp-features { animation: lp-fade-up 0.7s 0.2s  cubic-bezier(.22,1,.36,1) both; }

        @media (max-width: 820px) {
          .lp-left { display: none; }
          .lp-right { flex: 1; background: #07102a; }
        }
      `}</style>

      <div className="lp-page">

        {/* ── LEFT PANEL ── */}
        <div className="lp-left">
          <div className="lp-brand">
            <div className="lp-brand-seal">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12.5 7.5H18L13.5 11L15.5 17L10 13.5L4.5 17L6.5 11L2 7.5H7.5L10 2Z"
                  stroke="#c9922a" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(201,146,42,0.1)"/>
              </svg>
            </div>
            <span className="lp-brand-name">EduAI Campus</span>
          </div>

          <div className="lp-hero">
            <div className="lp-hero-eyebrow">Student Portal</div>
            <div className="lp-rule"></div>
            <h1>Welcome<br /><em>back.</em></h1>
            <p className="lp-hero-sub">
              Sign in to continue your learning journey. Access your courses, attendance, marks, and more.
            </p>
          </div>

          <div className="lp-features">
            {[
              { icon: '📊', bg: 'rgba(30,107,69,0.15)',   title: 'Live Attendance Tracking', desc: 'AI-powered alerts before you cross the threshold' },
              { icon: '📝', bg: 'rgba(58,108,191,0.15)',  title: 'Marks & Result Forecast',  desc: 'See predicted scores and act early' },
              { icon: '💼', bg: 'rgba(201,146,42,0.15)',  title: 'Placement Recommendations',desc: 'Smart job matches based on your profile' },
            ].map((f, i) => (
              <div key={i} className="lp-feature">
                <div className="lp-feature-icon" style={{ background: f.bg }}>
                  <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                </div>
                <div>
                  <div className="lp-feature-title">{f.title}</div>
                  <div className="lp-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="lp-right">
          <div className="lp-card">
            <div className="lp-card-header">
              <h2 className="lp-card-title">Sign in</h2>
              <p className="lp-card-sub">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="lp-error">
                <span className="lp-error-dot"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="lp-form">
              <div className="lp-field">
                <label className="lp-label" htmlFor="email">Email address</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required className="lp-input"
                />
              </div>

              <div className="lp-field">
                <label className="lp-label" htmlFor="password">Password</label>
                <input
                  id="password" name="password" type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required className="lp-input"
                />
              </div>

              <div className="lp-forgot-row">
                <Link to="/forgot-password" className="lp-forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading ? <><span className="lp-spinner" /> Signing in…</> : <>Sign in →</>}
              </button>
            </form>

            <div className="lp-roles">
              {[
                { label: 'Admin',   border: 'rgba(201,146,42,0.3)', color: '#c9922a', bg: 'rgba(201,146,42,0.06)' },
                { label: 'Faculty', border: 'rgba(30,107,69,0.3)',  color: '#4db87a', bg: 'rgba(30,107,69,0.06)'  },
                { label: 'Student', border: 'rgba(58,108,191,0.3)', color: '#7aabf0', bg: 'rgba(58,108,191,0.06)' },
                { label: 'Parent',  border: 'rgba(158,42,43,0.3)',  color: '#d97070', bg: 'rgba(158,42,43,0.06)'  },
              ].map(r => (
                <span key={r.label} className="lp-role-badge"
                  style={{ color: r.color, borderColor: r.border, background: r.bg }}>
                  {r.label}
                </span>
              ))}
            </div>

            <p className="lp-register">
              Don't have an account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default Login;