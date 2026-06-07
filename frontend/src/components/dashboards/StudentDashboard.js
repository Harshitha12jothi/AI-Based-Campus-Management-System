// =============================================================
//  EduAI Campus — StudentDashboard.jsx
//  File: src/pages/StudentDashboard.jsx
//
//  FIXES:
//  1. Attendance fetches from correct endpoint /api/attendance/student/:roll
//  2. Falls back to demo data when backend is offline
//  3. Shows real-time attendance % with color coding
//  4. Marks, fees, placement all wired correctly
// =============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AIChat from "../AIChat";

// ── inject global style once ──────────────────────────────────
if (!document.getElementById("sd-style")) {
  const s = document.createElement("style");
  s.id = "sd-style";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&display=swap');
    :root {
      --navy:#0d1b3e; --navy-mid:#162248; --navy-light:#1e3060;
      --gold:#c9a227; --gold-light:#f0cd6a; --gold-pale:#fef6dc;
      --green:#1a6b3a; --green-mid:#228b4c; --green-pale:#e6f4ec;
      --red:#b83232; --red-pale:#fdeaea;
      --amber:#d97706; --amber-pale:#fff7e6;
      --parchment:#faf8f2; --ink:#1a1a2e; --muted:#6b7280;
      --border:#e5dfc8; --white:#ffffff;
      --shadow:0 2px 12px rgba(13,27,62,0.08);
      --shadow-lg:0 8px 32px rgba(13,27,62,0.14);
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--parchment);font-family:'Source Sans 3',sans-serif;}
    .sd-page{display:grid;grid-template-columns:250px 1fr;min-height:100vh;background:var(--parchment);}
    .sd-sidebar{background:var(--navy);color:#fff;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;border-right:3px solid var(--gold);}
    .sd-sidebar-header{padding:24px 20px;border-bottom:1px solid rgba(201,162,39,0.2);}
    .sd-logo{font-family:'Playfair Display',serif;font-weight:900;font-size:1.25rem;color:var(--gold-light);display:flex;align-items:center;gap:10px;margin-bottom:20px;}
    .sd-logo-icon{width:32px;height:32px;background:var(--gold);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1rem;}
    .sd-avatar{display:flex;align-items:center;gap:10px;}
    .sd-avatar-circle{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--amber));display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;border:2px solid rgba(240,205,106,0.4);}
    .sd-avatar-name{font-weight:700;font-size:0.88rem;color:#fff;}
    .sd-avatar-roll{font-size:0.72rem;color:rgba(255,255,255,0.45);margin-top:2px;}
    .sd-role-badge{display:inline-block;background:var(--gold);color:var(--navy);font-size:0.62rem;font-weight:700;padding:2px 8px;border-radius:100px;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;}
    .sd-nav{flex:1;padding:14px 10px;}
    .sd-nav-section{font-size:0.62rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:10px 12px 6px;}
    .sd-nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,0.55);cursor:pointer;font-size:0.875rem;font-weight:500;margin-bottom:2px;font-family:'Source Sans 3',sans-serif;transition:all 0.18s ease;text-align:left;}
    .sd-nav-btn:hover{background:rgba(201,162,39,0.12);color:var(--gold-light);}
    .sd-nav-btn.active{background:rgba(201,162,39,0.18);color:var(--gold-light);border-left:3px solid var(--gold);padding-left:9px;font-weight:600;}
    .sd-logout-btn{margin:12px;background:rgba(184,50,50,0.14);color:#e88;border:1px solid rgba(184,50,50,0.25);border-radius:8px;padding:10px 14px;cursor:pointer;font-size:0.85rem;font-weight:600;font-family:'Source Sans 3',sans-serif;display:flex;align-items:center;gap:8px;transition:all 0.18s ease;}
    .sd-logout-btn:hover{background:rgba(184,50,50,0.25);}
    .sd-main{padding:32px 36px;overflow-y:auto;}
    .sd-topbar{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid var(--border);}
    .sd-page-title{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:900;color:var(--navy);letter-spacing:-0.3px;}
    .sd-page-sub{color:var(--muted);font-size:0.85rem;margin-top:4px;}
    .sd-meta-pill{background:var(--gold-pale);border:1px solid var(--gold);color:var(--amber);font-size:0.8rem;font-weight:600;padding:6px 14px;border-radius:100px;}
    .sd-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;}
    .sd-stat-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:20px 22px;border-top:3px solid var(--navy);box-shadow:var(--shadow);transition:transform 0.15s ease,box-shadow 0.15s ease;}
    .sd-stat-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg);}
    .sd-stat-icon{font-size:1.5rem;margin-bottom:10px;}
    .sd-stat-label{font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;font-weight:600;}
    .sd-stat-value{font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:900;line-height:1;color:var(--navy);}
    .sd-stat-sub{font-size:0.75rem;color:var(--muted);margin-top:5px;}
    .sd-section-h3{font-family:'Playfair Display',serif;font-weight:700;font-size:1.05rem;color:var(--navy);margin-bottom:16px;margin-top:10px;display:flex;align-items:center;gap:8px;}
    .sd-section-h3::after{content:'';flex:1;height:1px;background:var(--border);}
    .sd-table-wrap{background:var(--white);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--shadow);}
    .sd-table{width:100%;border-collapse:collapse;}
    .sd-table thead tr{background:var(--navy);}
    .sd-table thead th{padding:12px 16px;text-align:left;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--gold-light);font-family:'Source Sans 3',sans-serif;}
    .sd-table tbody tr{border-top:1px solid #f0ede4;transition:background 0.12s;}
    .sd-table tbody tr:hover{background:#fdfbf5;}
    .sd-table tbody td{padding:12px 16px;font-size:0.85rem;color:var(--ink);}
    .sd-pill{display:inline-block;padding:3px 10px;border-radius:100px;font-size:0.7rem;font-weight:700;}
    .sd-pill-green{background:var(--green-pale);color:var(--green);}
    .sd-pill-red{background:var(--red-pale);color:var(--red);}
    .sd-pill-amber{background:var(--amber-pale);color:var(--amber);}
    .sd-pill-navy{background:#e8ecf5;color:var(--navy);}
    .sd-pill-gold{background:var(--gold-pale);color:#996600;}
    .sd-card{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:22px 24px;box-shadow:var(--shadow);}
    .sd-notice-card{background:var(--white);border:1px solid var(--border);border-left:4px solid var(--gold);border-radius:10px;padding:16px 20px;box-shadow:var(--shadow);transition:transform 0.12s ease;}
    .sd-notice-card:hover{transform:translateX(2px);}
    .sd-ai-card{background:linear-gradient(135deg,var(--navy) 0%,var(--navy-light) 100%);border-radius:14px;padding:28px;color:#fff;margin-bottom:24px;border:1px solid var(--gold);box-shadow:var(--shadow-lg);position:relative;overflow:hidden;}
    .sd-ai-card::before{content:'';position:absolute;right:-30px;top:-30px;width:140px;height:140px;background:var(--gold);opacity:0.07;border-radius:50%;}
    .sd-ai-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(201,162,39,0.2);border:1px solid rgba(201,162,39,0.35);color:var(--gold-light);padding:4px 12px;border-radius:100px;font-size:0.72rem;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:12px;}
    .sd-progress-track{height:6px;background:#e8e4d8;border-radius:100px;overflow:hidden;margin-top:6px;}
    .sd-progress-bar{height:100%;border-radius:100px;transition:width 0.5s ease;}
    .sd-fee-hero{background:linear-gradient(135deg,var(--green) 0%,var(--green-mid) 100%);border-radius:14px;padding:28px;color:#fff;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;box-shadow:var(--shadow-lg);}
    .sd-fee-item{text-align:center;}
    .sd-fee-label{font-size:0.72rem;opacity:0.75;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:600;}
    .sd-fee-value{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;line-height:1;}
    .sd-fee-divider{width:1px;background:rgba(255,255,255,0.2);}
    .sd-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .sd-profile-label{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px;}
    .sd-profile-value{font-size:0.95rem;font-weight:600;color:var(--ink);}
    .sd-att-summary{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;}
    .sd-att-box{flex:1;min-width:120px;background:var(--white);border:1px solid var(--border);border-radius:10px;padding:14px 16px;text-align:center;box-shadow:var(--shadow);}
    .sd-att-box-val{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:900;line-height:1;margin-bottom:4px;}
    .sd-att-box-lbl{font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-weight:600;}
    @media(max-width:900px){.sd-page{grid-template-columns:1fr;}.sd-sidebar{display:none;}.sd-main{padding:20px;}.sd-stats-grid{grid-template-columns:1fr 1fr;}}
  `;
  document.head.appendChild(s);
}

// ── helpers ───────────────────────────────────────────────────
function calcGrade(pct) {
  if (pct >= 90) return "O";
  if (pct >= 80) return "A+";
  if (pct >= 70) return "A";
  if (pct >= 60) return "B+";
  if (pct >= 50) return "B";
  return "F";
}

// ── Demo data (used when backend offline) ─────────────────────
function getDemoAttendance() {
  const records = [
    { date: "2025-01-06", subject: "DBMS",              status: "present" },
    { date: "2025-01-07", subject: "Operating Systems",  status: "present" },
    { date: "2025-01-08", subject: "Web Technology",     status: "absent"  },
    { date: "2025-01-09", subject: "DBMS",               status: "present" },
    { date: "2025-01-10", subject: "Computer Networks",  status: "late"    },
    { date: "2025-01-13", subject: "Operating Systems",  status: "present" },
    { date: "2025-01-14", subject: "DBMS",               status: "present" },
    { date: "2025-01-15", subject: "Web Technology",     status: "present" },
    { date: "2025-01-16", subject: "Computer Networks",  status: "absent"  },
    { date: "2025-01-17", subject: "Operating Systems",  status: "present" },
  ];
  const total   = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent  = records.filter(r => r.status === "absent").length;
  const late    = records.filter(r => r.status === "late").length;
  const percentage = Math.round(((present + late * 0.5) / total) * 100);
  return { summary: { total, present, absent, late, percentage }, records };
}

function getDemoMarks() {
  const records = [
    { subject: "DBMS",             examType: "internal1", marks: 42, maxMarks: 50, grade: "A+" },
    { subject: "Operating Systems",examType: "internal1", marks: 38, maxMarks: 50, grade: "A"  },
    { subject: "Web Technology",   examType: "quiz",      marks: 18, maxMarks: 20, grade: "O"  },
    { subject: "Computer Networks",examType: "internal1", marks: 35, maxMarks: 50, grade: "B+" },
    { subject: "DBMS",             examType: "internal2", marks: 44, maxMarks: 50, grade: "O"  },
  ];
  const avgPct = Math.round(records.reduce((a, r) => a + (r.marks / r.maxMarks) * 100, 0) / records.length);
  return { records, average: avgPct, grade: calcGrade(avgPct) };
}

function getDemoFees() {
  const fees = [
    { receiptNo: "REC001", feeType: "Tuition Fee", amount: 45000, paid: 45000, balance: 0,     status: "paid",    paymentDate: "2025-01-05" },
    { receiptNo: "REC002", feeType: "Lab Fee",      amount: 3000,  paid: 3000,  balance: 0,     status: "paid",    paymentDate: "2025-01-05" },
    { receiptNo: "REC003", feeType: "Exam Fee",     amount: 1500,  paid: 0,     balance: 1500,  status: "pending", paymentDate: null         },
    { receiptNo: "REC004", feeType: "Library Fee",  amount: 500,   paid: 0,     balance: 500,   status: "pending", paymentDate: null         },
  ];
  const total   = fees.reduce((a, f) => a + f.amount, 0);
  const paid    = fees.reduce((a, f) => a + f.paid,   0);
  const pending = total - paid;
  return { fees, summary: { total, paid, pending } };
}

// ── Component ─────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const user  = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [attendance, setAttendance] = useState(null);
  const [marks,      setMarks]      = useState(null);
  const [fees,       setFees]       = useState(null);
  const [notices,    setNotices]    = useState([]);
  const [placement,  setPlacement]  = useState(null);
  const [activeTab,  setActiveTab]  = useState("overview");
  const [offline,    setOffline]    = useState(false);

  const roll = user.rollNumber || user.roll;

  useEffect(() => {
    if (!roll) { setOffline(true); loadDemo(); return; }

    // Try backend — fall back to demo on any error
    Promise.all([
      fetch(`/api/attendance/student/${roll}`, { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/marks/student/${roll}`,      { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/fees/student/${roll}`,       { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/notices",                    { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/ai/placement/${roll}`,       { headers }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    ])
      .then(([att, mrk, fee, ntc, plc]) => {
        // Normalise attendance — backend may return different shapes
        setAttendance(normaliseAttendance(att));
        setMarks(normaliseMarks(mrk));
        setFees(normaliseFees(fee));
        setNotices(Array.isArray(ntc) ? ntc : []);
        setPlacement(plc);
      })
      .catch(() => { setOffline(true); loadDemo(); });
  }, []);

  function loadDemo() {
    setAttendance(getDemoAttendance());
    setMarks(getDemoMarks());
    setFees(getDemoFees());
    setNotices([
      { title: "Exam Schedule Released", content: "Internal exams start from Feb 10. Check timetable.", date: new Date() },
      { title: "Holiday Notice",         content: "Republic Day holiday on Jan 26.",                    date: new Date() },
    ]);
    setPlacement({ eligibleForCampus: true, average: 78, grade: "A", recommendedRoles: ["Software Engineer", "Data Analyst", "Web Developer"] });
  }

  // ── Normalise functions — handle whatever shape backend sends ─
  function normaliseAttendance(data) {
    if (!data) return getDemoAttendance();
    // already correct shape
    if (data.summary && data.records) return data;
    // flat array of records
    if (Array.isArray(data)) {
      const total   = data.length;
      const present = data.filter(r => r.status === "present").length;
      const absent  = data.filter(r => r.status === "absent").length;
      const late    = data.filter(r => r.status === "late").length;
      const percentage = total ? Math.round(((present + late * 0.5) / total) * 100) : 0;
      return { summary: { total, present, absent, late, percentage }, records: data };
    }
    return getDemoAttendance();
  }

  function normaliseMarks(data) {
    if (!data) return getDemoMarks();
    if (data.records) return data;
    if (Array.isArray(data)) {
      const avgPct = data.length
        ? Math.round(data.reduce((a, r) => a + (r.marks / r.maxMarks) * 100, 0) / data.length)
        : 0;
      return { records: data, average: avgPct, grade: calcGrade(avgPct) };
    }
    return getDemoMarks();
  }

  function normaliseFees(data) {
    if (!data) return getDemoFees();
    if (data.summary && data.fees) return data;
    if (Array.isArray(data)) {
      const total   = data.reduce((a, f) => a + (f.amount || 0), 0);
      const paid    = data.reduce((a, f) => a + (f.paid || (f.status === "paid" ? f.amount : 0)), 0);
      return { fees: data, summary: { total, paid, pending: total - paid } };
    }
    return getDemoFees();
  }

  const logout = () => { localStorage.clear(); navigate("/login"); };

  const tabs = ["overview","attendance","marks","fees","placement","notices","profile"];
  const tabIcons = { overview:"🏛", attendance:"📅", marks:"📖", fees:"💳", placement:"🎓", notices:"📢", profile:"👤" };

  // ── derived stats ──────────────────────────────────────────
  const attPct  = attendance?.summary?.percentage ?? null;
  const avgMark = marks?.average ?? null;

  return (
    <div className="sd-page">
      {/* ── SIDEBAR ── */}
      <aside className="sd-sidebar">
        <div className="sd-sidebar-header">
          <div className="sd-logo"><div className="sd-logo-icon">🎓</div>EduAI</div>
          <div className="sd-avatar">
            <div className="sd-avatar-circle">🎓</div>
            <div>
              <div className="sd-avatar-name">{user.firstName} {user.lastName}</div>
              <div className="sd-avatar-roll">{roll || "No Roll No."}</div>
              <div className="sd-role-badge">Student</div>
            </div>
          </div>
        </div>
        <nav className="sd-nav">
          <div className="sd-nav-section">Navigation</div>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`sd-nav-btn ${activeTab === tab ? "active" : ""}`}>
              <span>{tabIcons[tab]}</span>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="sd-logout-btn">← Sign Out</button>
      </aside>

      {/* ── MAIN ── */}
      <main className="sd-main">
        {/* Offline banner */}
        {offline && (
          <div style={{ background:"#fff7e6", border:"1px solid #f59e0b", borderRadius:10, padding:"10px 16px", marginBottom:20, fontSize:"0.83rem", color:"#92400e" }}>
            ⚠ Backend offline — showing demo data. Connect your backend to see real attendance.
          </div>
        )}

        <div className="sd-topbar">
          <div>
            <h1 className="sd-page-title">{tabIcons[activeTab]} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="sd-page-sub">Welcome back, {user.firstName}!</p>
          </div>
          <div className="sd-meta-pill">{user.department || "—"} · {user.semester || user.year || "—"}</div>
        </div>

        {/* ════ OVERVIEW ════ */}
        {activeTab === "overview" && (
          <div>
            <div className="sd-stats-grid">
              <StatCard icon="📅" label="Attendance"
                value={attPct !== null ? `${attPct}%` : "—"}
                color={attPct === null ? "var(--muted)" : attPct >= 75 ? "var(--green)" : "var(--red)"}
                sub={attPct === null ? "Loading…" : attPct >= 75 ? "✓ Safe" : "⚠ At Risk"} />
              <StatCard icon="📖" label="Avg Marks"
                value={avgMark !== null ? `${avgMark}%` : "—"}
                color="var(--navy)"
                sub={`Grade: ${marks?.grade || "—"}`} />
              <StatCard icon="💳" label="Fees Pending"
                value={fees ? `₹${(fees.summary.pending / 1000).toFixed(1)}K` : "—"}
                color={fees?.summary.pending > 0 ? "var(--red)" : "var(--green)"}
                sub={fees?.summary.pending > 0 ? "Action needed" : "All clear"} />
              <StatCard icon="🎓" label="Placement"
                value={placement ? (placement.eligibleForCampus ? "Eligible" : "Pending") : "—"}
                color={placement?.eligibleForCampus ? "var(--green)" : "var(--amber)"}
                sub="Campus drive status" />
            </div>

            {/* Attendance alert */}
            {attPct !== null && attPct < 75 && (
              <div style={{ background:"var(--red-pale)", border:"1px solid #f0c8c8", borderLeft:"4px solid var(--red)", borderRadius:10, padding:"14px 18px", marginBottom:20, fontSize:"0.85rem", color:"#8b3030" }}>
                <strong>⚠ Attendance Warning!</strong> Your attendance is {attPct}%, below the 75% minimum. You need{" "}
                {Math.ceil((0.75 * attendance.summary.total - attendance.summary.present) / 0.25)} more classes to be safe.
              </div>
            )}

            {/* Subject-wise performance */}
            {marks?.records?.length > 0 && (
              <>
                <h3 className="sd-section-h3">📊 Subject Performance</h3>
                <div className="sd-card" style={{ marginBottom: 24 }}>
                  {[...new Set(marks.records.map(r => r.subject))].map((subj, i) => {
                    const recs = marks.records.filter(r => r.subject === subj);
                    const avg  = Math.round(recs.reduce((a, r) => a + (r.marks / r.maxMarks) * 100, 0) / recs.length);
                    const color = avg >= 75 ? "var(--green)" : avg >= 50 ? "var(--amber)" : "var(--red)";
                    return (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:"0.85rem", fontWeight:600 }}>{subj}</span>
                          <span style={{ fontSize:"0.8rem", fontWeight:700, color }}>{avg}%</span>
                        </div>
                        <div className="sd-progress-track">
                          <div className="sd-progress-bar" style={{ width:`${avg}%`, background:color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <h3 className="sd-section-h3">📢 Latest Notices</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {notices.slice(0, 4).map((n, i) => (
                <div key={i} className="sd-notice-card">
                  <div style={{ fontWeight:700, fontSize:"0.92rem", color:"var(--navy)", marginBottom:4 }}>{n.title}</div>
                  <div style={{ fontSize:"0.83rem", color:"var(--muted)" }}>{n.content}</div>
                  <div style={{ fontSize:"0.72rem", color:"#aaa", marginTop:8 }}>{new Date(n.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ ATTENDANCE ════ */}
        {activeTab === "attendance" && (
          <div>
            {attendance ? (
              <>
                {/* Summary boxes */}
                <div className="sd-att-summary">
                  <div className="sd-att-box">
                    <div className="sd-att-box-val" style={{ color:"var(--navy)" }}>{attendance.summary.total}</div>
                    <div className="sd-att-box-lbl">Total Classes</div>
                  </div>
                  <div className="sd-att-box">
                    <div className="sd-att-box-val" style={{ color:"var(--green)" }}>{attendance.summary.present}</div>
                    <div className="sd-att-box-lbl">Present</div>
                  </div>
                  <div className="sd-att-box">
                    <div className="sd-att-box-val" style={{ color:"var(--red)" }}>{attendance.summary.absent}</div>
                    <div className="sd-att-box-lbl">Absent</div>
                  </div>
                  <div className="sd-att-box">
                    <div className="sd-att-box-val" style={{ color:"var(--amber)" }}>{attendance.summary.late ?? 0}</div>
                    <div className="sd-att-box-lbl">Late</div>
                  </div>
                  <div className="sd-att-box" style={{ borderTop:`3px solid ${attendance.summary.percentage >= 75 ? "var(--green)" : "var(--red)"}` }}>
                    <div className="sd-att-box-val" style={{ color: attendance.summary.percentage >= 75 ? "var(--green)" : "var(--red)" }}>
                      {attendance.summary.percentage}%
                    </div>
                    <div className="sd-att-box-lbl">{attendance.summary.percentage >= 75 ? "✓ Safe" : "⚠ At Risk"}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="sd-card" style={{ marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:"0.88rem" }}>
                    <span style={{ fontWeight:600 }}>Overall Attendance</span>
                    <span style={{ fontWeight:700, color: attendance.summary.percentage >= 75 ? "var(--green)" : "var(--red)" }}>
                      {attendance.summary.percentage}% (Min: 75%)
                    </span>
                  </div>
                  <div className="sd-progress-track" style={{ height:10 }}>
                    <div className="sd-progress-bar" style={{
                      width: `${attendance.summary.percentage}%`,
                      background: attendance.summary.percentage >= 75 ? "var(--green)" : "var(--red)"
                    }} />
                  </div>
                  {attendance.summary.percentage < 75 && (
                    <div style={{ fontSize:"0.78rem", color:"var(--red)", marginTop:6 }}>
                      ⚠ You need {Math.ceil((0.75 * attendance.summary.total - attendance.summary.present) / 0.25)} more classes to reach 75%
                    </div>
                  )}
                </div>

                {/* Per-subject breakdown */}
                {(() => {
                  const subjects = [...new Set(attendance.records.map(r => r.subject))];
                  if (subjects.length === 0) return null;
                  return (
                    <>
                      <h3 className="sd-section-h3">Subject-wise Attendance</h3>
                      <div className="sd-card" style={{ marginBottom:20 }}>
                        {subjects.map((subj, i) => {
                          const recs    = attendance.records.filter(r => r.subject === subj);
                          const present = recs.filter(r => r.status === "present").length;
                          const pct     = Math.round((present / recs.length) * 100);
                          const color   = pct >= 75 ? "var(--green)" : pct >= 65 ? "var(--amber)" : "var(--red)";
                          return (
                            <div key={i} style={{ marginBottom:14 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:"0.85rem" }}>
                                <span style={{ fontWeight:600 }}>{subj}</span>
                                <span style={{ fontWeight:700, color }}>{present}/{recs.length} — {pct}%</span>
                              </div>
                              <div className="sd-progress-track">
                                <div className="sd-progress-bar" style={{ width:`${pct}%`, background:color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}

                {/* Records table */}
                <h3 className="sd-section-h3">Attendance Records</h3>
                <div className="sd-table-wrap">
                  <table className="sd-table">
                    <thead>
                      <tr><th>Date</th><th>Subject</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {attendance.records.map((r, i) => (
                        <tr key={i}>
                          <td style={{ color:"var(--muted)", fontSize:"0.82rem" }}>
                            {r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}
                          </td>
                          <td style={{ fontWeight:600 }}>{r.subject}</td>
                          <td>
                            <span className={`sd-pill ${r.status === "present" ? "sd-pill-green" : r.status === "late" ? "sd-pill-amber" : "sd-pill-red"}`}>
                              {r.status === "present" ? "✓ Present" : r.status === "late" ? "⏱ Late" : "✗ Absent"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {attendance.records.length === 0 && (
                        <tr><td colSpan={3} style={{ textAlign:"center", color:"var(--muted)", padding:32, fontStyle:"italic" }}>No attendance records yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <LoadingState />}
          </div>
        )}

        {/* ════ MARKS ════ */}
        {activeTab === "marks" && (
          <div>
            {marks ? (
              <>
                <div className="sd-stats-grid">
                  <StatCard icon="📊" label="Average"  value={`${marks.average}%`}  color="var(--navy)"  sub="overall" />
                  <StatCard icon="🏅" label="Grade"    value={marks.grade}           color="var(--gold)"  sub="current standing" />
                  <StatCard icon="📖" label="Subjects" value={[...new Set(marks.records.map(r => r.subject))].length} color="var(--green)" sub="enrolled" />
                  <StatCard icon="📋" label="Exams"    value={marks.records.length}  color="var(--amber)" sub="recorded" />
                </div>
                <h3 className="sd-section-h3">Examination Results</h3>
                <div className="sd-table-wrap">
                  <table className="sd-table">
                    <thead><tr><th>Subject</th><th>Exam Type</th><th>Marks</th><th>Max</th><th>Score</th><th>Grade</th></tr></thead>
                    <tbody>
                      {marks.records.map((r, i) => {
                        const pct = Math.round((r.marks / r.maxMarks) * 100);
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight:600 }}>{r.subject}</td>
                            <td><span className="sd-pill sd-pill-navy">{r.examType}</span></td>
                            <td style={{ fontWeight:700, color:"var(--navy)" }}>{r.marks}</td>
                            <td style={{ color:"var(--muted)" }}>{r.maxMarks}</td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{ flex:1, height:5, background:"#eee", borderRadius:100, overflow:"hidden", minWidth:60 }}>
                                  <div style={{ height:"100%", width:`${pct}%`, borderRadius:100, background: pct>=75?"var(--green)":pct>=50?"var(--amber)":"var(--red)" }} />
                                </div>
                                <span style={{ fontSize:"0.78rem", fontWeight:700, color:"var(--muted)" }}>{pct}%</span>
                              </div>
                            </td>
                            <td><span className={`sd-pill ${pct>=75?"sd-pill-green":pct>=50?"sd-pill-amber":"sd-pill-red"}`}>{r.grade || calcGrade(pct)}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <LoadingState />}
          </div>
        )}

        {/* ════ FEES ════ */}
        {activeTab === "fees" && (
          <div>
            {fees ? (
              <>
                <div className="sd-fee-hero">
                  <div className="sd-fee-item"><div className="sd-fee-label">Total Fees</div><div className="sd-fee-value">₹{(fees.summary.total/1000).toFixed(0)}K</div></div>
                  <div className="sd-fee-divider" />
                  <div className="sd-fee-item"><div className="sd-fee-label">Paid</div><div className="sd-fee-value">₹{(fees.summary.paid/1000).toFixed(0)}K</div></div>
                  <div className="sd-fee-divider" />
                  <div className="sd-fee-item">
                    <div className="sd-fee-label">Pending</div>
                    <div className="sd-fee-value" style={{ color: fees.summary.pending > 0 ? "#fcd34d" : "#a7f3d0" }}>
                      ₹{(fees.summary.pending/1000).toFixed(0)}K
                    </div>
                  </div>
                </div>
                {fees.summary.pending > 0 && (
                  <div className="sd-card" style={{ marginBottom:20, borderLeft:"4px solid var(--amber)", background:"var(--amber-pale)" }}>
                    <div style={{ fontWeight:700, color:"var(--amber)", marginBottom:4 }}>💳 Payment Reminder</div>
                    <div style={{ fontSize:"0.85rem", color:"#7c4e00" }}>
                      You have ₹{fees.summary.pending.toLocaleString()} pending. Please clear before the deadline.
                    </div>
                  </div>
                )}
                <h3 className="sd-section-h3">Transaction History</h3>
                <div className="sd-table-wrap">
                  <table className="sd-table">
                    <thead><tr><th>Receipt</th><th>Type</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {fees.fees.map((f, i) => (
                        <tr key={i}>
                          <td style={{ fontSize:"0.78rem", color:"var(--muted)", fontFamily:"monospace" }}>{f.receiptNo || "—"}</td>
                          <td style={{ fontWeight:600 }}>{f.feeType}</td>
                          <td style={{ fontWeight:700 }}>₹{f.amount.toLocaleString()}</td>
                          <td style={{ color:"var(--green)", fontWeight:600 }}>₹{(f.paid||0).toLocaleString()}</td>
                          <td style={{ color: f.balance > 0 ? "var(--red)" : "var(--green)", fontWeight:600 }}>₹{(f.balance||0).toLocaleString()}</td>
                          <td><span className={`sd-pill ${f.status==="paid"?"sd-pill-green":f.status==="partial"?"sd-pill-amber":"sd-pill-red"}`}>{f.status}</span></td>
                          <td style={{ fontSize:"0.82rem", color:"var(--muted)" }}>{f.paymentDate || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <LoadingState />}
          </div>
        )}

        {/* ════ PLACEMENT ════ */}
        {activeTab === "placement" && (
          <div>
            {placement ? (
              <>
                <div className="sd-ai-card">
                  <div className="sd-ai-badge">✦ AI Analysis</div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:"1.6rem", fontWeight:900, marginBottom:8, lineHeight:1.2 }}>
                    {placement.eligibleForCampus ? "✅ You are Campus Eligible!" : "⏳ Not Yet Eligible"}
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.875rem" }}>
                    Academic Average: {placement.average}% · Grade: {placement.grade}
                  </div>
                </div>
                {placement.recommendedRoles?.length > 0 && (
                  <>
                    <h3 className="sd-section-h3">🎯 Recommended Career Paths</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                      {placement.recommendedRoles.map((role, i) => (
                        <div key={i} className="sd-card" style={{ textAlign:"center", padding:"28px 18px", borderTop:"3px solid var(--gold)" }}>
                          <div style={{ fontSize:"2rem", marginBottom:12 }}>💼</div>
                          <div style={{ fontFamily:"Playfair Display,serif", fontWeight:700, fontSize:"0.95rem", color:"var(--navy)", marginBottom:10 }}>{role}</div>
                          <span className="sd-pill sd-pill-gold">AI Match</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : <LoadingState />}
          </div>
        )}

        {/* ════ NOTICES ════ */}
        {activeTab === "notices" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {notices.map((n, i) => (
              <div key={i} className="sd-notice-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontWeight:700, fontSize:"0.95rem", color:"var(--navy)" }}>{n.title}</div>
                  {n.targetRole && <span className="sd-pill sd-pill-navy" style={{ fontSize:"0.68rem" }}>{n.targetRole}</span>}
                </div>
                <div style={{ fontSize:"0.85rem", color:"var(--muted)", lineHeight:1.6 }}>{n.content}</div>
                <div style={{ fontSize:"0.72rem", color:"#bbb", marginTop:10 }}>{new Date(n.date).toLocaleString()}</div>
              </div>
            ))}
            {notices.length === 0 && <p style={{ color:"var(--muted)" }}>No notices available.</p>}
          </div>
        )}

        {/* ════ PROFILE ════ */}
        {activeTab === "profile" && (
          <div>
            <div className="sd-card" style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:24, paddingBottom:20, borderBottom:"1px solid var(--border)" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,var(--gold),var(--amber))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2rem", border:"3px solid var(--border)" }}>🎓</div>
                <div>
                  <div style={{ fontFamily:"Playfair Display,serif", fontSize:"1.4rem", fontWeight:900, color:"var(--navy)" }}>{user.firstName} {user.lastName}</div>
                  <div style={{ color:"var(--muted)", fontSize:"0.85rem" }}>{user.email}</div>
                  <span className="sd-pill sd-pill-navy" style={{ marginTop:6, display:"inline-block" }}>Student</span>
                </div>
              </div>
              <div className="sd-profile-grid">
                {[
                  ["Roll Number", roll || "—"],
                  ["Department",  user.department || "—"],
                  ["Year / Sem",  user.semester || user.year || "—"],
                  ["Email",       user.email || "—"],
                  ["Overall Grade",  marks?.grade || "—"],
                  ["Attendance",  attPct !== null ? `${attPct}%` : "—"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="sd-profile-label">{label}</div>
                    <div className="sd-profile-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <AIChat userRole="student" userName={user.firstName} />
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="sd-stat-card" style={{ borderTopColor: color }}>
      <div className="sd-stat-icon">{icon}</div>
      <div className="sd-stat-label">{label}</div>
      <div className="sd-stat-value" style={{ color }}>{value}</div>
      <div className="sd-stat-sub">{sub}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
      <div style={{ fontSize:"2rem", marginBottom:12, opacity:0.4 }}>⏳</div>
      <div style={{ fontSize:"0.875rem" }}>Loading data…</div>
    </div>
  );
}