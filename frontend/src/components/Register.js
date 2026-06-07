import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('student');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    department: '', phone: '', rollNumber: '', semester: '1st Year',
    employeeId: '', designation: 'Assistant Professor',
    childRoll: '', relation: 'Father', adminCode: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (form.password !== form.confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' }); return;
    }
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.department) {
      setMsg({ type: 'error', text: 'Please fill all required fields.' }); return;
    }
    setLoading(true);
    const payload = { ...form, role: selectedRole };
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) { setMsg({ type: 'error', text: data.message || 'Registration failed.' }); return; }
      setMsg({ type: 'success', text: 'Account created! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1800);
    } catch {
      setMsg({ type: 'error', text: 'Server error. Is the backend running?' });
    } finally { setLoading(false); }
  };

  const roles = [
    { id: 'student', icon: '🎓', label: 'Student',  desc: 'Enrolled learner' },
    { id: 'faculty', icon: '📖', label: 'Faculty',  desc: 'Teaching staff'   },
    { id: 'parent',  icon: '👨‍👩‍👦', label: 'Parent',   desc: 'Guardian access'  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-page {
          display: grid;
          grid-template-columns: 360px 1fr;
          height: 100vh;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .reg-left {
          background: #0d1f3c;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 32px 32px;
        }
        .reg-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 280px 280px at 10% 20%, rgba(196,160,60,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 200px 300px at 90% 80%, rgba(44,95,60,0.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .reg-left::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c4a03c, #2c5f3c, #c4a03c);
        }

        /* ornamental lines */
        .reg-left-lines {
          position: absolute;
          bottom: -60px; right: -60px;
          width: 320px; height: 320px;
          border: 1px solid rgba(196,160,60,0.08);
          border-radius: 50%;
          pointer-events: none;
        }
        .reg-left-lines::before {
          content: '';
          position: absolute;
          inset: 30px;
          border: 1px solid rgba(196,160,60,0.06);
          border-radius: 50%;
        }

        .reg-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
        }
        .reg-logo-crest {
          width: 36px; height: 36px;
          border: 1.5px solid #c4a03c;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .reg-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          color: #e8dfc8;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .reg-logo-sub {
          font-size: 0.65rem;
          color: rgba(196,160,60,0.7);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .reg-left-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 800;
          color: #e8dfc8;
          line-height: 1.12;
          letter-spacing: -0.5px;
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .reg-left-heading em {
          font-style: italic;
          color: #c4a03c;
        }

        .reg-left-desc {
          font-size: 0.82rem;
          color: rgba(232,223,200,0.5);
          line-height: 1.65;
          margin-bottom: 28px;
          position: relative;
          z-index: 1;
          max-width: 280px;
        }

        .reg-steps {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 14px;
          flex: 1;
        }
        .reg-step {
          display: flex; align-items: flex-start; gap: 12px;
        }
        .reg-step-num {
          width: 26px; height: 26px;
          border: 1px solid rgba(196,160,60,0.4);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.68rem;
          font-weight: 600;
          color: #c4a03c;
          flex-shrink: 0;
          letter-spacing: 0.05em;
        }
        .reg-step-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: #e8dfc8;
          margin-bottom: 2px;
        }
        .reg-step-sub {
          font-size: 0.72rem;
          color: rgba(232,223,200,0.38);
          line-height: 1.4;
        }

        .reg-left-footer {
          position: relative; z-index: 1;
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(196,160,60,0.12);
          display: flex; align-items: center; gap: 10px;
        }
        .reg-left-footer-dot {
          width: 6px; height: 6px;
          background: #2c5f3c; border-radius: 50%;
        }
        .reg-left-footer-text {
          font-size: 0.75rem;
          color: rgba(232,223,200,0.3);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── RIGHT PANEL ── */
        .reg-right {
          background: #faf8f3;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 28px 36px;
          overflow-y: auto;
          height: 100vh;
        }

        .reg-box {
          width: 100%;
          max-width: 480px;
        }

        .reg-box-header {
          margin-bottom: 18px;
        }
        .reg-box-kicker {
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2c5f3c;
          margin-bottom: 5px;
        }
        .reg-box-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0d1f3c;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .reg-box-sub {
          font-size: 0.82rem;
          color: #8a8070;
        }
        .reg-box-sub a {
          color: #0d1f3c;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid rgba(196,160,60,0.5);
          padding-bottom: 1px;
          transition: border-color 0.2s;
        }
        .reg-box-sub a:hover { border-color: #c4a03c; }

        /* ── MSG ── */
        .reg-msg {
          padding: 9px 13px;
          border-radius: 7px;
          font-size: 0.8rem;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .reg-msg-error { background: #fdf1f0; color: #8b2e2e; border: 1px solid #f0c8c8; }
        .reg-msg-success { background: #f0f7f2; color: #1e5c35; border: 1px solid #b8dfc8; }
        .reg-msg-icon { font-size: 13px; }

        /* ── ROLE SELECTOR ── */
        .reg-role-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0d1f3c;
          margin-bottom: 8px;
          opacity: 0.6;
        }
        .reg-roles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 18px;
        }
        .reg-role-btn {
          border: 1.5px solid #e6e0d0;
          background: #fff;
          border-radius: 8px;
          padding: 10px 6px;
          text-align: center;
          cursor: pointer;
          transition: all 0.18s;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .reg-role-btn:hover {
          border-color: rgba(196,160,60,0.5);
          background: #fdf9f0;
        }
        .reg-role-btn.active {
          border-color: #c4a03c;
          background: linear-gradient(135deg, #fdf9f0, #fdf5e0);
          box-shadow: 0 0 0 3px rgba(196,160,60,0.1);
        }
        .reg-role-icon { font-size: 1.15rem; }
        .reg-role-name {
          font-size: 0.72rem;
          font-weight: 600;
          color: #0d1f3c;
          letter-spacing: 0.03em;
        }
        .reg-role-desc {
          font-size: 0.64rem;
          color: #a09080;
        }

        /* ── DIVIDER ── */
        .reg-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 14px;
        }
        .reg-divider-line { flex: 1; height: 1px; background: #e6e0d0; }
        .reg-divider-text { font-size: 0.68rem; color: #a09080; letter-spacing: 0.08em; text-transform: uppercase; }

        /* ── FORM ── */
        .reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .reg-field { margin-bottom: 10px; }
        .reg-field-label {
          display: block;
          font-size: 0.73rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          color: #0d1f3c;
          margin-bottom: 5px;
          opacity: 0.75;
        }
        .reg-input {
          width: 100%;
          padding: 8px 12px;
          border: 1.5px solid #e6e0d0;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          background: #fff;
          color: #0d1f3c;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        .reg-input:focus {
          border-color: #c4a03c;
          box-shadow: 0 0 0 3px rgba(196,160,60,0.12);
        }
        .reg-input::placeholder { color: #c0b8a8; }

        /* ── ROLE EXTRA FIELDS ── */
        .reg-role-section {
          background: #f5f2ea;
          border: 1px solid #e6e0d0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .reg-role-section-label {
          font-size: 0.67rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2c5f3c;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 7px;
        }
        .reg-role-section-label::before {
          content: '';
          display: inline-block;
          width: 14px; height: 1px;
          background: #2c5f3c;
          opacity: 0.5;
        }

        /* ── SUBMIT ── */
        .reg-submit {
          width: 100%;
          padding: 11px;
          background: #0d1f3c;
          color: #e8dfc8;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.02em;
          margin-top: 6px;
          transition: background 0.18s, transform 0.12s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .reg-submit::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 4px; height: 100%;
          background: linear-gradient(180deg, #c4a03c, #2c5f3c);
        }
        .reg-submit:hover:not(:disabled) { background: #162e58; }
        .reg-submit:active:not(:disabled) { transform: scale(0.99); }
        .reg-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .reg-submit-arrow { font-size: 0.95rem; transition: transform 0.18s; }
        .reg-submit:hover .reg-submit-arrow { transform: translateX(3px); }
      `}</style>

      <div className="reg-page">
        {/* LEFT */}
        <div className="reg-left">
          <div className="reg-left-lines" />

          <div className="reg-logo">
            <div className="reg-logo-crest">🎓</div>
            <div>
              <div className="reg-logo-text">EduAI Campus</div>
              <div className="reg-logo-sub">Academic Management System</div>
            </div>
          </div>

          <h1 className="reg-left-heading">
            Begin your<br /><em>academic</em><br />journey
          </h1>
          <p className="reg-left-desc">
            Create your secure account and access AI-powered campus tools tailored to your role and department.
          </p>

          <div className="reg-steps">
            {[
              ['01', 'Select your role', 'Student, Faculty or Parent'],
              ['02', 'Enter your details', 'Name, email & department'],
              ['03', 'Secure your account', 'Create a strong password'],
              ['04', 'Access your dashboard', 'All modules unlocked instantly'],
            ].map(([n, title, sub]) => (
              <div className="reg-step" key={n}>
                <div className="reg-step-num">{n}</div>
                <div>
                  <div className="reg-step-title">{title}</div>
                  <div className="reg-step-sub">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="reg-left-footer">
            <div className="reg-left-footer-dot" />
            <span className="reg-left-footer-text">Secured & encrypted — FERPA compliant</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="reg-right">
          <div className="reg-box">
            <div className="reg-box-header">
              <div className="reg-box-kicker">New Account</div>
              <h2 className="reg-box-title">Create your account</h2>
              <p className="reg-box-sub">
                Already enrolled? <Link to="/login">Sign in instead</Link>
              </p>
            </div>

            {msg.text && (
              <div className={`reg-msg ${msg.type === 'error' ? 'reg-msg-error' : 'reg-msg-success'}`}>
                <span className="reg-msg-icon">{msg.type === 'error' ? '⚠' : '✓'}</span>
                {msg.text}
              </div>
            )}

            {/* Role Selector */}
            <div className="reg-role-label">I am a</div>
            <div className="reg-roles">
              {roles.map(r => (
                <div
                  key={r.id}
                  className={`reg-role-btn ${selectedRole === r.id ? 'active' : ''}`}
                  onClick={() => setSelectedRole(r.id)}
                >
                  <span className="reg-role-icon">{r.icon}</span>
                  <span className="reg-role-name">{r.label}</span>
                  <span className="reg-role-desc">{r.desc}</span>
                </div>
              ))}
            </div>

            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">Personal Details</span>
              <div className="reg-divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="reg-row">
                <Field label="First Name" name="firstName" placeholder="Arjun" value={form.firstName} onChange={handleChange} />
                <Field label="Last Name"  name="lastName"  placeholder="Kumar"  value={form.lastName}  onChange={handleChange} />
              </div>

              <Field label="Email Address" name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} />

              <div className="reg-field">
                <label className="reg-field-label">Department</label>
                <select name="department" value={form.department} onChange={handleChange} className="reg-input">
                  <option value="">Select Department</option>
                  {['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Information Technology','Business Administration','Administration'].map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Role-specific fields */}
              {selectedRole === 'student' && (
                <div className="reg-role-section">
                  <div className="reg-role-section-label">Student Details</div>
                  <div className="reg-row">
                    <Field label="Roll Number" name="rollNumber" placeholder="21CS001" value={form.rollNumber} onChange={handleChange} />
                    <div className="reg-field">
                      <label className="reg-field-label">Academic Year</label>
                      <select name="semester" value={form.semester} onChange={handleChange} className="reg-input">
                        {['1st Year','2nd Year','3rd Year','4th Year'].map(y => <option key={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'faculty' && (
                <div className="reg-role-section">
                  <div className="reg-role-section-label">Faculty Details</div>
                  <div className="reg-row">
                    <Field label="Employee ID" name="employeeId" placeholder="FAC-001" value={form.employeeId} onChange={handleChange} />
                    <div className="reg-field">
                      <label className="reg-field-label">Designation</label>
                      <select name="designation" value={form.designation} onChange={handleChange} className="reg-input">
                        {['Professor','Associate Professor','Assistant Professor','Lecturer','HOD'].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'parent' && (
                <div className="reg-role-section">
                  <div className="reg-role-section-label">Guardian Details</div>
                  <div className="reg-row">
                    <Field label="Child's Roll No." name="childRoll" placeholder="21CS001" value={form.childRoll} onChange={handleChange} />
                    <div className="reg-field">
                      <label className="reg-field-label">Relation</label>
                      <select name="relation" value={form.relation} onChange={handleChange} className="reg-input">
                        {['Father','Mother','Guardian'].map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <Field label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />

              <div className="reg-divider">
                <div className="reg-divider-line" />
                <span className="reg-divider-text">Security</span>
                <div className="reg-divider-line" />
              </div>

              <div className="reg-row">
                <Field label="Password"         name="password"        type="password" placeholder="Min 6 characters" value={form.password}        onChange={handleChange} />
                <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password"   value={form.confirmPassword} onChange={handleChange} />
              </div>

              <button type="submit" disabled={loading} className="reg-submit">
                {loading ? 'Creating account…' : 'Create Account'}
                {!loading && <span className="reg-submit-arrow">→</span>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const Field = ({ label, name, type = 'text', placeholder, value, onChange }) => (
  <div className="reg-field">
    <label className="reg-field-label">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="reg-input"
    />
  </div>
);

export default Register;