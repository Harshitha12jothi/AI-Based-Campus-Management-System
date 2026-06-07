import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/*
  Academic Palette:
  --navy:    #0d1b3e  (Oxford/Cambridge deep navy — trust, intellect)
  --navy-2:  #112050  (slightly lighter navy for cards)
  --navy-3:  #162660  (section alt)
  --green:   #1e6b45  (forest green — growth, knowledge)
  --green-l: #27855a  (hover green)
  --amber:   #c9922a  (scholarly gold — achievement, excellence)
  --amber-l: #e8b84b  (stat numbers)
  --ivory:   #f0ead8  (aged parchment — warmth, scholarship)
  --ivory-2: #e4dbc6  (muted body text)
  --crimson: #9e2a2b  (academic crimson — Harvard/Yale accent)
*/

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible]   = useState({});
  const refs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true }));
      }),
      { threshold: 0.1 }
    );
    Object.values(refs.current).forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const ref = (id) => (el) => { refs.current[id] = el; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0d1b3e; }

        /* ── Base ── */
        .edu-page {
          font-family: 'DM Sans', sans-serif;
          font-size: 18px;
          color: #e4dbc6;
          background: #0d1b3e;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Animations ── */
        .reveal {
          opacity: 0; transform: translateY(32px);
          transition: opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1);
        }
        .reveal.in { opacity: 1; transform: none; }
        .reveal.d2 { transition-delay: 0.22s; }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 6vw;
          transition: background 0.4s, padding 0.3s, border-color 0.4s;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled {
          background: rgba(13,27,62,0.95);
          backdrop-filter: blur(20px);
          padding: 15px 6vw;
          border-bottom-color: rgba(201,146,42,0.2);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 600; letter-spacing: 0.5px;
          color: #f0ead8; display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo-mark {
          width: 9px; height: 9px; border-radius: 50%;
          background: #c9922a;
          box-shadow: 0 0 8px rgba(201,146,42,0.5);
        }
        .nav-links { display: flex; gap: 40px; align-items: center; }
        .nav-link {
          color: rgba(228,219,198,0.45); font-size: 0.9rem;
          letter-spacing: 0.5px; text-decoration: none; font-weight: 400; transition: color 0.2s;
        }
        .nav-link:hover { color: #f0ead8; }
        .nav-cta {
          font-size: 0.9rem; font-weight: 500; letter-spacing: 0.3px;
          color: #0d1b3e; background: #c9922a;
          padding: 10px 24px; border-radius: 4px; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .nav-cta:hover { background: #e8b84b; transform: translateY(-1px); }

        /* ── Hero ── */
        .hero {
          display: grid; grid-template-columns: 1.1fr 0.9fr;
          align-items: center; min-height: 100vh;
          padding: 130px 6vw 90px; gap: 80px;
          background: #0d1b3e;
        }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 2.5px;
          text-transform: uppercase; color: rgba(228,219,198,0.4); margin-bottom: 30px;
        }
        .hero-eyebrow::before {
          content: ''; display: block; width: 30px; height: 1px; background: #c9922a;
        }
        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3.8rem, 6vw, 5.8rem);
          font-weight: 600; line-height: 1.0; letter-spacing: -2px;
          margin-bottom: 30px; color: #f0ead8;
        }
        .hero-h1 em { font-style: italic; color: #e8b84b; }
        .hero-h1 .accent { display: inline-block; color: #f0ead8; position: relative; }
        .hero-h1 .accent::after {
          content: ''; position: absolute; bottom: 5px; left: 0; right: 0; height: 2px;
          background: #1e6b45;
          transform: scaleX(0); transform-origin: left;
          animation: underline-reveal 1.2s 1s cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes underline-reveal { to { transform: scaleX(1); } }
        .hero-sub {
          color: rgba(228,219,198,0.5); font-size: 1.1rem; line-height: 1.85;
          max-width: 460px; margin-bottom: 44px; font-weight: 300;
        }
        .hero-btns { display: flex; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          font-size: 0.95rem; font-weight: 500; letter-spacing: 0.3px;
          background: #1e6b45; color: #f0ead8;
          padding: 15px 30px; border-radius: 4px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #27855a; transform: translateY(-1px); }
        .btn-outline {
          font-size: 0.95rem; font-weight: 500; letter-spacing: 0.3px;
          background: transparent; color: rgba(228,219,198,0.65);
          padding: 15px 30px; border-radius: 4px;
          border: 1px solid rgba(201,146,42,0.3); text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-outline:hover { border-color: rgba(201,146,42,0.7); color: #f0ead8; transform: translateY(-1px); }

        /* ── Hero Cards ── */
        .hero-cards { display: flex; flex-direction: column; gap: 14px; }
        .hero-card {
          background: #112050;
          border: 1px solid rgba(201,146,42,0.15);
          border-radius: 12px; padding: 22px 26px;
          transition: border-color 0.3s, transform 0.3s;
          opacity: 0;
          animation: card-enter 0.7s cubic-bezier(.22,1,.36,1) forwards;
        }
        .hero-card:nth-child(1) { animation-delay: 0.4s; }
        .hero-card:nth-child(2) { animation-delay: 0.6s; margin-left: 32px; }
        .hero-card:nth-child(3) { animation-delay: 0.8s; }
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: none; }
        }
        .hero-card:hover { border-color: rgba(201,146,42,0.4); transform: translateY(-2px); }
        .card-label {
          font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(228,219,198,0.35); margin-bottom: 7px; font-weight: 500;
        }
        .card-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.1rem; font-weight: 700; line-height: 1; color: #f0ead8;
        }
        .card-tags { display: flex; gap: 7px; margin-top: 13px; flex-wrap: wrap; }
        .card-tag { font-size: 0.7rem; font-weight: 500; padding: 3px 11px; border-radius: 100px; }

        /* ── Stats Bar ── */
        .stats-bar {
          background: #07102a;
          border-top: 1px solid rgba(201,146,42,0.15);
          border-bottom: 1px solid rgba(201,146,42,0.15);
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .stat-item {
          padding: 48px 6vw; text-align: center;
          border-right: 1px solid rgba(201,146,42,0.1);
        }
        .stat-item:last-child { border-right: none; }
        .stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem; font-weight: 700; color: #e8b84b; line-height: 1; letter-spacing: -1px;
        }
        .stat-label {
          font-size: 0.78rem; letter-spacing: 1.8px; text-transform: uppercase;
          color: rgba(228,219,198,0.3); margin-top: 9px; font-weight: 400;
        }

        /* ── Sections ── */
        .section { padding: 110px 6vw; background: #0d1b3e; }
        .section-alt { background: #0a1632; }

        .section-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 0.72rem; font-weight: 500; letter-spacing: 3px;
          text-transform: uppercase; color: #c9922a; margin-bottom: 18px;
        }
        .section-eyebrow::before { content: ''; width: 22px; height: 1px; background: currentColor; }
        .section-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.3rem, 3.8vw, 3.4rem);
          font-weight: 600; letter-spacing: -0.5px; line-height: 1.1;
          color: #f0ead8; margin-bottom: 16px; max-width: 600px;
        }
        .section-sub {
          color: rgba(228,219,198,0.45); font-size: 1.05rem; line-height: 1.85;
          max-width: 500px; margin-bottom: 56px; font-weight: 300;
        }

        /* ── Feature Grid ── */
        .feature-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 1px; background: rgba(201,146,42,0.1);
          border: 1px solid rgba(201,146,42,0.1); border-radius: 14px; overflow: hidden;
        }
        .feature-card { background: #0a1632; padding: 36px 30px; transition: background 0.25s; }
        .feature-card:hover { background: #112050; }
        .feature-icon-wrap {
          width: 48px; height: 48px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; margin-bottom: 20px;
        }
        .feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem; font-weight: 600; color: #f0ead8; margin-bottom: 10px;
        }
        .feature-desc {
          font-size: 0.94rem; color: rgba(228,219,198,0.45); line-height: 1.75; font-weight: 300;
        }
        .feature-pill {
          display: inline-block; margin-top: 18px;
          font-size: 0.62rem; font-weight: 500; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 3px 10px; border-radius: 3px;
        }
        .pill-ai   { background: rgba(30,107,69,0.2); color: #4db87a; border: 1px solid rgba(30,107,69,0.4); }
        .pill-core { background: rgba(201,146,42,0.12); color: #c9922a; border: 1px solid rgba(201,146,42,0.25); }

        /* ── Module Grid ── */
        .module-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
        .module-card {
          background: #112050;
          border: 1px solid rgba(201,146,42,0.12);
          border-radius: 12px; padding: 28px 22px;
          text-align: center; text-decoration: none; color: inherit; display: block;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .module-card:hover {
          background: #162660; border-color: rgba(201,146,42,0.4); transform: translateY(-3px);
        }
        .module-emoji { font-size: 1.9rem; margin-bottom: 12px; display: block; }
        .module-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 600; color: #f0ead8; margin-bottom: 5px;
        }
        .module-sub { font-size: 0.8rem; color: rgba(228,219,198,0.32); letter-spacing: 0.3px; }

        /* ── Role Cards ── */
        .role-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .role-card {
          background: #112050;
          border: 1px solid rgba(201,146,42,0.12);
          border-radius: 12px; padding: 32px 26px;
          position: relative; overflow: hidden;
          transition: border-color 0.25s, transform 0.25s;
        }
        .role-card:hover { border-color: rgba(201,146,42,0.38); transform: translateY(-2px); }
        .role-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .role-card.admin::before   { background: #c9922a; }
        .role-card.faculty::before { background: #1e6b45; }
        .role-card.student::before { background: #3a6cbf; }
        .role-card.parent::before  { background: #9e2a2b; }
        .role-emoji { font-size: 1.9rem; margin-bottom: 16px; }
        .role-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem; font-weight: 700; color: #f0ead8; margin-bottom: 16px;
        }
        .role-perm {
          font-size: 0.9rem; color: rgba(228,219,198,0.45);
          margin-bottom: 8px; padding-left: 14px;
          position: relative; font-weight: 300; line-height: 1.45;
        }
        .role-perm::before { content: '–'; position: absolute; left: 0; color: rgba(201,146,42,0.4); }

        /* ── CTA ── */
        .cta-section {
          background: #07102a;
          border-top: 1px solid rgba(201,146,42,0.15);
          padding: 110px 6vw; text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-section::before {
          content: ''; position: absolute;
          top: -200px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(30,107,69,0.12) 0%, transparent 65%);
          pointer-events: none;
        }
        .cta-section::after {
          content: ''; position: absolute;
          top: -150px; left: 50%; transform: translateX(-50%);
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(201,146,42,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .cta-h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 5vw, 4.6rem);
          font-weight: 600; color: #f0ead8;
          letter-spacing: -1.5px; line-height: 1.05; margin-bottom: 20px;
        }
        .cta-h2 em { font-style: italic; color: #e8b84b; }
        .cta-sub {
          color: rgba(228,219,198,0.38); font-size: 1.05rem; margin-bottom: 48px; font-weight: 300;
        }
        .cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-warm {
          font-size: 0.95rem; font-weight: 500;
          background: #1e6b45; color: #f0ead8;
          padding: 15px 30px; border-radius: 4px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-warm:hover { background: #27855a; transform: translateY(-1px); }
        .btn-ghost {
          font-size: 0.95rem; font-weight: 500;
          background: transparent; color: rgba(228,219,198,0.55);
          padding: 15px 30px; border-radius: 4px;
          border: 1px solid rgba(201,146,42,0.25); text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .btn-ghost:hover { border-color: rgba(201,146,42,0.6); color: #f0ead8; transform: translateY(-1px); }

        /* ── Footer ── */
        .footer {
          background: #050d1e;
          border-top: 1px solid rgba(201,146,42,0.1);
          color: rgba(228,219,198,0.22);
          padding: 30px 6vw; text-align: center;
          font-size: 0.84rem; letter-spacing: 0.5px;
        }
        .footer strong { color: rgba(228,219,198,0.48); font-weight: 500; }

        /* ── Decorative rule ── */
        .rule {
          width: 48px; height: 2px;
          background: linear-gradient(90deg, #c9922a, #1e6b45);
          border-radius: 2px; margin-bottom: 48px;
        }

        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; padding-top: 110px; }
          .hero-cards { display: none; }
          .stats-bar { grid-template-columns: repeat(2,1fr); }
          .feature-grid { grid-template-columns: 1fr 1fr; }
          .module-grid { grid-template-columns: repeat(2,1fr); }
          .role-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="edu-page">

        {/* NAV */}
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
          <a href="/" className="nav-logo">
            <span className="nav-logo-mark"></span>
            EduAI Campus
          </a>
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modules"  className="nav-link">Modules</a>
            <a href="#roles"    className="nav-link">Access</a>
            <Link to="/login" className="nav-cta">Dashboard →</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div>
            <div className="hero-eyebrow">AI-Powered · MERN Stack · Real-time</div>
            <h1 className="hero-h1">
              Smart Campus<br />
              <em>Management</em><br />
              for <span className="accent">Modern</span> Education
            </h1>
            <p className="hero-sub">
              An intelligent platform unifying student records, attendance, marks, placements, fees, and communication — driven by AI prediction.
            </p>
            <div className="hero-btns">
              <Link to="/login"    className="btn-primary">Launch Dashboard →</Link>
              <Link to="/register" className="btn-outline">Create Account</Link>
            </div>
          </div>

          <div className="hero-cards">
            {[
              { label: 'Attendance Prediction', value: '87.4%', tags: [
                  { text: '421 Safe',   bg: 'rgba(30,107,69,0.18)',  color: '#4db87a' },
                  { text: '23 At Risk', bg: 'rgba(158,42,43,0.18)',  color: '#d97070' },
              ]},
              { label: 'AI Placement Matches', value: '156 Students', tags: [
                  { text: 'Software Eng.', bg: 'rgba(58,108,191,0.18)', color: '#7aabf0' },
                  { text: 'Data Analyst',  bg: 'rgba(201,146,42,0.18)', color: '#e8b84b' },
                  { text: 'UX Designer',   bg: 'rgba(30,107,69,0.18)',  color: '#4db87a' },
              ]},
              { label: 'Fee Collection · This Month', value: '₹12.4L', tags: [
                  { text: '78% Collected', bg: 'rgba(30,107,69,0.18)',  color: '#4db87a' },
                  { text: '22% Pending',   bg: 'rgba(201,146,42,0.18)', color: '#e8b84b' },
              ]},
            ].map((card, i) => (
              <div key={i} className="hero-card">
                <div className="card-label">{card.label}</div>
                <div className="card-value">{card.value}</div>
                <div className="card-tags">
                  {card.tags.map((t, j) => (
                    <span key={j} className="card-tag" style={{ background: t.bg, color: t.color }}>{t.text}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <div className="stats-bar">
          {[['10+','Integrated Modules'],['4','AI-Powered Features'],['∞','Student Records'],['MERN','Full Stack']].map(([n,l]) => (
            <div key={l} className="stat-item">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        {/* FEATURES */}
        <section id="features" className="section section-alt" ref={ref('feat')} data-id="feat">
          <div className={`reveal ${visible['feat'] ? 'in' : ''}`}>
            <div className="section-eyebrow">Core Capabilities</div>
            <h2 className="section-h2">Everything your campus needs, unified</h2>
            <p className="section-sub">From attendance tracking to AI-powered placement — one intelligent platform handles it all.</p>
          </div>
          <div className={`feature-grid reveal ${visible['feat'] ? 'in d2' : ''}`}>
            {[
              { icon: '🎓', bg: 'rgba(58,108,191,0.2)',  title: 'Student Management',    desc: 'Comprehensive profiles with QR-based identification and real-time tracking.', badge: 'core' },
              { icon: '📊', bg: 'rgba(30,107,69,0.2)',   title: 'Attendance Prediction', desc: 'AI flags students at risk before they breach the minimum threshold.',         badge: 'ai' },
              { icon: '📈', bg: 'rgba(201,146,42,0.2)',  title: 'Marks Prediction',      desc: 'Machine learning forecasts academic outcomes for early intervention.',        badge: 'ai' },
              { icon: '💼', bg: 'rgba(58,108,191,0.2)',  title: 'Placement Recommender', desc: 'Intelligent matching of students to job roles and internships.',              badge: 'ai' },
              { icon: '💬', bg: 'rgba(158,42,43,0.2)',   title: 'AI Chatbot Assistant',  desc: '24/7 query resolution for students and staff on all campus topics.',          badge: 'ai' },
              { icon: '💰', bg: 'rgba(201,146,42,0.2)',  title: 'Fee Management',        desc: 'Track payments, send reminders, generate receipts and analytics.',           badge: 'core' },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon-wrap" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
                <span className={`feature-pill ${f.badge === 'ai' ? 'pill-ai' : 'pill-core'}`}>
                  {f.badge === 'ai' ? 'AI Powered' : 'Core'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* MODULES */}
        <section id="modules" className="section" ref={ref('mod')} data-id="mod">
          <div className={`reveal ${visible['mod'] ? 'in' : ''}`}>
            <div className="section-eyebrow">System Modules</div>
            <h2 className="section-h2">Every module in one place</h2>
            <p className="section-sub">Sign in to navigate directly to any module from a unified dashboard.</p>
          </div>
          <div className={`module-grid reveal ${visible['mod'] ? 'in d2' : ''}`}>
            {[
              ['📊','Dashboard','Analytics'],['🎓','Students','Records & QR'],
              ['✅','Attendance','AI Prediction'],['📝','Marks','Result Forecast'],
              ['💼','Placement','AI Job Match'],['🤖','AI Chatbot','24/7 Assistant'],
              ['💰','Fee Management','Payments'],['📋','Examinations','Online Exams'],
            ].map(([e,n,s]) => (
              <Link to="/login" key={n} className="module-card">
                <span className="module-emoji">{e}</span>
                <div className="module-name">{n}</div>
                <div className="module-sub">{s}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ROLES */}
        <section id="roles" className="section section-alt" ref={ref('roles')} data-id="roles">
          <div className={`reveal ${visible['roles'] ? 'in' : ''}`}>
            <div className="section-eyebrow">Role-Based Access</div>
            <h2 className="section-h2">Secure, personalized access for everyone</h2>
            <p className="section-sub">Each role receives a tailored experience with precisely scoped permissions.</p>
          </div>
          <div className={`role-grid reveal ${visible['roles'] ? 'in d2' : ''}`}>
            {[
              { icon: '🛡️', cls: 'admin',   title: 'Administrator', perms: ['Full system access','User management','Fee & finance control','AI insights & reports','Announcements'] },
              { icon: '👨‍🏫', cls: 'faculty', title: 'Faculty',        perms: ['Mark attendance','Enter exam marks','View class analytics','Create exam papers','Send notifications'] },
              { icon: '🎓', cls: 'student', title: 'Student',        perms: ['View own attendance','Check results','Placement suggestions','Fee status & pay','AI chatbot access'] },
              { icon: '👨‍👩‍👦', cls: 'parent',  title: 'Parent',         perms: ["Child's attendance",'Academic progress','Fee notifications','Exam results','Campus alerts'] },
            ].map(r => (
              <div key={r.title} className={`role-card ${r.cls}`}>
                <div className="role-emoji">{r.icon}</div>
                <div className="role-title">{r.title}</div>
                {r.perms.map(p => <div key={p} className="role-perm">{p}</div>)}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <h2 className="cta-h2">Ready to transform<br />your <em>campus?</em></h2>
          <p className="cta-sub">Open the dashboard and experience AI-powered campus management firsthand.</p>
          <div className="cta-btns">
            <Link to="/login"    className="btn-warm">Launch Dashboard →</Link>
            <Link to="/register" className="btn-ghost">Register Now</Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <strong>EduAI Campus</strong> &nbsp;·&nbsp; AI-Powered Campus Management &nbsp;·&nbsp; MERN Stack + Anthropic AI
        </footer>

      </div>
    </>
  );
};

export default LandingPage;