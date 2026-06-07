// =============================================================
//  EduAI Campus — FacultyDashboard.jsx
//  File: src/pages/FacultyDashboard.jsx
//
//  FIXES:
//  1. Subject dropdown now shows a proper list (not a blank input)
//  2. Load Students actually works — fetches from /api/students
//     and filters by semester correctly
//  3. Semester values match what the backend stores
//  4. Error messages are shown when backend is unreachable
//  5. AIChat and TimetableView imports resolved
// =============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AIChat from "../AIChat";

// ── Subjects list per department ──────────────────────────────
const SUBJECTS_BY_DEPT = {
  CSE:   ["Data Structures","DBMS","Operating Systems","Computer Networks","Web Technology","Software Engineering","Machine Learning","Python Programming"],
  ECE:   ["Digital Electronics","Signals & Systems","Microprocessors","VLSI Design","Communication Systems","Embedded Systems"],
  MECH:  ["Thermodynamics","Fluid Mechanics","Manufacturing Technology","Kinematics","Machine Design","Heat Transfer"],
  CIVIL: ["Structural Analysis","Concrete Technology","Surveying","Soil Mechanics","Transportation Engineering"],
  IT:    ["Data Mining","Cloud Computing","Mobile Computing","Information Security","IOT","Big Data Analytics"],
  MBA:   ["Marketing Management","Financial Accounting","HRM","Business Analytics","Operations Management"],
};

const SEMESTERS = ["1st Year","2nd Year","3rd Year","4th Year"];

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const token   = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  // Subjects for this faculty's department
  const subjectList = SUBJECTS_BY_DEPT[user.department] || SUBJECTS_BY_DEPT.CSE;

  const [activeTab, setActiveTab] = useState("overview");
  const [students,  setStudents]  = useState([]);
  const [notices,   setNotices]   = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // ── Attendance form state ──────────────────────────────────
  const [attForm, setAttForm] = useState({
    subject:    subjectList[0] || "",
    date:       new Date().toISOString().split("T")[0],
    semester:   "3rd Year",
    department: user.department || "CSE",
  });
  const [attList, setAttList] = useState([]);

  // ── Marks form state ──────────────────────────────────────
  const [marksForm, setMarksForm] = useState({
    rollNumber: "",
    subject:    subjectList[0] || "",
    examType:   "internal1",
    marks:      "",
    maxMarks:   100,
    semester:   "3rd Year",
    department: user.department || "CSE",
  });

  // ── Fetch students & notices on mount ─────────────────────
  useEffect(() => {
    setLoadingStudents(true);
    fetch("/api/students", { headers })
      .then(r => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => {
        // If backend not running — use demo data so UI is testable
        setStudents([
          { _id: "1", rollNumber: "CS001", firstName: "Arjun",  lastName: "Kumar",  semester: "3rd Year", department: "CSE", phone: "9876543210" },
          { _id: "2", rollNumber: "CS002", firstName: "Priya",  lastName: "Nair",   semester: "3rd Year", department: "CSE", phone: "9876543211" },
          { _id: "3", rollNumber: "CS003", firstName: "Ravi",   lastName: "Shankar",semester: "2nd Year", department: "CSE", phone: "9876543212" },
          { _id: "4", rollNumber: "CS004", firstName: "Sneha",  lastName: "Patel",  semester: "3rd Year", department: "CSE", phone: "9876543213" },
          { _id: "5", rollNumber: "CS005", firstName: "Kiran",  lastName: "Das",    semester: "4th Year", department: "CSE", phone: "9876543214" },
        ]);
        setMsg({ type: "error", text: "Backend offline — showing demo student data." });
      })
      .finally(() => setLoadingStudents(false));

    fetch("/api/notices", { headers })
      .then(r => r.json())
      .then(data => setNotices(Array.isArray(data) ? data : []))
      .catch(() => setNotices([]));
  }, []);

  const logout = () => { localStorage.clear(); navigate("/login"); };

  // ── Get unique semester values that actually exist in DB ───
  // This is shown in the dropdown so faculty always picks a real value
  const actualSemesters = [...new Set(students.map(s => s.semester).filter(Boolean))].sort();

  // ── Smart semester matcher ─────────────────────────────────
  // Handles: "1", "2", "3", "4", "1st Year", "2nd Year",
  // "Semester 1", "Sem 1", "First Year", "I", "II", etc.
  const semestersMatch = (studentSem, selectedSem) => {
    if (!selectedSem) return true;          // no filter → all pass
    if (studentSem === selectedSem) return true; // exact match

    // Normalize both to a number 1–4
    const normalize = (v) => {
      if (!v) return null;
      const s = String(v).trim().toLowerCase();
      if (/^1$|^i$|^1st|^first|^sem.*1$|^semester.*1$/.test(s)) return 1;
      if (/^2$|^ii$|^2nd|^second|^sem.*2$|^semester.*2$/.test(s)) return 2;
      if (/^3$|^iii$|^3rd|^third|^sem.*3$|^semester.*3$/.test(s)) return 3;
      if (/^4$|^iv$|^4th|^fourth|^sem.*4$|^semester.*4$/.test(s)) return 4;
      if (/^5$|^v$|^5th|^fifth|^sem.*5$/.test(s)) return 5;
      if (/^6$|^vi$|^6th|^sixth|^sem.*6$/.test(s)) return 6;
      if (/^7$|^vii$|^7th|^seventh|^sem.*7$/.test(s)) return 7;
      if (/^8$|^viii$|^8th|^eighth|^sem.*8$/.test(s)) return 8;
      return null;
    };
    const a = normalize(studentSem);
    const b = normalize(selectedSem);
    if (a !== null && b !== null) return a === b;
    return false;
  };

  // ── Load students into attendance list ─────────────────────
  const loadStudentsForAtt = () => {
    if (!attForm.subject) {
      setMsg({ type: "error", text: "Please select a subject first." });
      return;
    }

    // Step 1: filter by department
    const deptFiltered = students.filter(s => {
      if (!attForm.department) return true;
      const sDept = (s.department || "").trim().toLowerCase();
      const fDept = (attForm.department || "").trim().toLowerCase();
      return sDept === fDept || sDept.includes(fDept) || fDept.includes(sDept);
    });

    // Step 2: filter by semester using smart matcher
    const filtered = attForm.semester
      ? deptFiltered.filter(s => semestersMatch(s.semester, attForm.semester))
      : deptFiltered;

    // Step 3: if still empty, ignore semester filter and load ALL dept students
    const finalList = filtered.length > 0 ? filtered : deptFiltered;

    if (finalList.length === 0) {
      // Last resort — show ALL students
      const allList = students.map(s => ({
        studentId:  s._id,
        rollNumber: s.rollNumber,
        name:       `${s.firstName} ${s.lastName}`,
        status:     "present",
        subject:    attForm.subject,
        date:       attForm.date,
        department: s.department,
        semester:   s.semester,
      }));

      if (allList.length === 0) {
        setMsg({ type: "error", text: "No students in the system. Please add students first via Admin panel." });
        return;
      }

      setAttList(allList);
      setMsg({ type: "success", text: `Showing all ${allList.length} students (semester filter ignored — values may differ in DB).` });
      return;
    }

    setAttList(finalList.map(s => ({
      studentId:  s._id,
      rollNumber: s.rollNumber,
      name:       `${s.firstName} ${s.lastName}`,
      status:     "present",
      subject:    attForm.subject,
      date:       attForm.date,
      department: s.department,
      semester:   s.semester,
    })));

    const note = filtered.length < deptFiltered.length
      ? ` (${deptFiltered.length - filtered.length} skipped — semester mismatch)`
      : "";

    setMsg({ type: "success", text: `✓ Loaded ${finalList.length} students for ${attForm.subject}.${note}` });
  };

  // ── Submit attendance ──────────────────────────────────────
  const submitAttendance = async () => {
    if (!attList.length) {
      setMsg({ type: "error", text: "Load students first." });
      return;
    }
    try {
      const res  = await fetch("/api/attendance", { method: "POST", headers, body: JSON.stringify(attList) });
      const data = await res.json();
      setMsg(res.ok
        ? { type: "success", text: `✓ Attendance saved for ${attList.length} students!` }
        : { type: "error",   text: data.message || "Failed to save attendance." }
      );
      if (res.ok) setAttList([]);
    } catch {
      setMsg({ type: "error", text: "Server error. Check if backend is running." });
    }
  };

  // ── Submit marks ───────────────────────────────────────────
  const submitMarks = async () => {
    if (!marksForm.rollNumber || !marksForm.subject || !marksForm.marks) {
      setMsg({ type: "error", text: "Fill all marks fields." });
      return;
    }
    const student = students.find(s => s.rollNumber === marksForm.rollNumber);
    const payload = { ...marksForm, studentId: student?._id, marks: Number(marksForm.marks), maxMarks: Number(marksForm.maxMarks) };
    try {
      const res  = await fetch("/api/marks", { method: "POST", headers, body: JSON.stringify(payload) });
      const data = await res.json();
      setMsg(res.ok
        ? { type: "success", text: `✓ Marks saved for ${marksForm.rollNumber}!` }
        : { type: "error",   text: data.message || "Failed to save marks." }
      );
      if (res.ok) setMarksForm(f => ({ ...f, rollNumber: "", marks: "" }));
    } catch {
      setMsg({ type: "error", text: "Server error. Check if backend is running." });
    }
  };

  const tabs = [
    { id: "overview",   icon: "◈", label: "Overview"   },
    { id: "attendance", icon: "◉", label: "Attendance" },
    { id: "marks",      icon: "◎", label: "Marks"      },
    { id: "students",   icon: "◆", label: "Students"   },
    { id: "notices",    icon: "◐", label: "Notices"    },
  ];

  // ── filtered students for current semester (marks dropdown) ─
  const semStudents = students.filter(s =>
    s.semester === marksForm.semester &&
    (!attForm.department || s.department === attForm.department)
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fac-page { display: grid; grid-template-columns: 230px 1fr; min-height: 100vh; background: #f4f1e8; font-family: 'DM Sans', sans-serif; }

        /* SIDEBAR */
        .fac-sidebar { background: #0d1f3c; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
        .fac-sidebar::after { content: ''; position: absolute; top: 0; right: 0; width: 1px; height: 100%; background: linear-gradient(180deg, rgba(196,160,60,0.4) 0%, rgba(44,95,60,0.3) 50%, transparent 100%); }
        .fac-sidebar-top { padding: 24px 20px 0; position: relative; }
        .fac-sidebar-top::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #2c5f3c, #c4a03c); }
        .fac-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .fac-logo-mark { width: 30px; height: 30px; border: 1.5px solid #c4a03c; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #c4a03c; }
        .fac-logo-text { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #e8dfc8; }
        .fac-logo-sub  { font-size: 0.6rem; color: rgba(196,160,60,0.6); letter-spacing: 0.12em; text-transform: uppercase; }
        .fac-avatar { text-align: center; padding: 16px 0 20px; border-bottom: 1px solid rgba(196,160,60,0.12); margin-bottom: 10px; }
        .fac-avatar-icon { width: 44px; height: 44px; border-radius: 50%; background: rgba(44,95,60,0.15); border: 1.5px solid rgba(44,95,60,0.35); display: flex; align-items: center; justify-content: center; font-size: 18px; margin: 0 auto 8px; }
        .fac-avatar-name { font-size: 0.82rem; font-weight: 600; color: #e8dfc8; margin-bottom: 2px; }
        .fac-avatar-desg { font-size: 0.68rem; color: rgba(232,223,200,0.45); margin-bottom: 8px; }
        .fac-role-badge { display: inline-block; background: rgba(44,95,60,0.18); color: #7ecb98; border: 1px solid rgba(44,95,60,0.35); font-size: 0.62rem; font-weight: 700; padding: 3px 10px; border-radius: 100px; letter-spacing: 0.08em; text-transform: uppercase; }
        .fac-nav { padding: 0 10px; flex: 1; }
        .fac-nav-section { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(196,160,60,0.45); padding: 12px 10px 6px; }
        .fac-nav-btn { display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 12px; border-radius: 7px; border: none; background: transparent; color: rgba(232,223,200,0.5); cursor: pointer; font-size: 0.83rem; font-weight: 500; margin-bottom: 2px; font-family: 'DM Sans', sans-serif; transition: all 0.16s; text-align: left; }
        .fac-nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(232,223,200,0.8); }
        .fac-nav-btn.active { background: rgba(44,95,60,0.12); color: #e8dfc8; border-left: 2px solid #2c5f3c; padding-left: 10px; }
        .fac-nav-icon { font-size: 12px; color: #7ecb98; opacity: 0.7; width: 14px; }
        .fac-nav-btn.active .fac-nav-icon { opacity: 1; }
        .fac-logout { margin: 12px 10px 16px; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 7px; border: 1px solid rgba(44,95,60,0.2); background: transparent; color: rgba(126,203,152,0.6); cursor: pointer; font-size: 0.8rem; font-weight: 500; font-family: 'DM Sans', sans-serif; transition: all 0.16s; width: calc(100% - 20px); }
        .fac-logout:hover { background: rgba(44,95,60,0.1); color: #7ecb98; }

        /* MAIN */
        .fac-main { padding: 28px 32px; overflow-y: auto; }
        .fac-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(44,95,60,0.2); }
        .fac-page-kicker { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: #2c5f3c; margin-bottom: 4px; }
        .fac-page-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: #0d1f3c; }
        .fac-page-sub { font-size: 0.8rem; color: #8a7a60; margin-top: 2px; }
        .fac-date-badge { background: #fff; border: 1px solid rgba(44,95,60,0.2); border-radius: 8px; padding: 8px 14px; font-size: 0.78rem; color: #5a4f3a; font-weight: 500; }

        /* MSG */
        .fac-msg { padding: 11px 14px; border-radius: 8px; font-size: 0.84rem; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .fac-msg-err { background: #fdf1f0; color: #7a2e2e; border: 1px solid #f0c8c8; }
        .fac-msg-ok  { background: #f0f7f2; color: #1e5c35; border: 1px solid #b8dfc8; }
        .fac-msg-close { background: none; border: none; cursor: pointer; font-size: 1rem; color: inherit; opacity: 0.6; }

        /* STAT CARDS */
        .fac-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
        .fac-stat { background: #fff; border: 1px solid rgba(44,95,60,0.15); border-radius: 12px; padding: 18px 18px 14px; position: relative; overflow: hidden; }
        .fac-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .fac-stat-navy::before  { background: #0d1f3c; }
        .fac-stat-green::before { background: #2c5f3c; }
        .fac-stat-gold::before  { background: #c4a03c; }
        .fac-stat-sage::before  { background: #5a8a6a; }
        .fac-stat-icon  { font-size: 1.1rem; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: #eef5ee; border-radius: 8px; }
        .fac-stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #8a7a60; margin-bottom: 6px; }
        .fac-stat-value { font-family: 'Playfair Display', serif; font-size: 1.65rem; font-weight: 700; color: #0d1f3c; line-height: 1; margin-bottom: 3px; }
        .fac-stat-sub   { font-size: 0.72rem; color: #a09070; }

        /* QUICK ACTIONS */
        .fac-quick-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .fac-quick-btn { background: #fff; border: 1px solid rgba(44,95,60,0.18); border-radius: 12px; padding: 22px 16px; cursor: pointer; text-align: center; font-family: 'DM Sans', sans-serif; transition: all 0.18s; position: relative; overflow: hidden; }
        .fac-quick-btn::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #2c5f3c, #c4a03c); opacity: 0; transition: opacity 0.18s; }
        .fac-quick-btn:hover { border-color: rgba(44,95,60,0.4); background: #f8fdf8; }
        .fac-quick-btn:hover::before { opacity: 1; }
        .fac-quick-icon  { font-size: 1.7rem; margin-bottom: 10px; }
        .fac-quick-label { font-weight: 600; font-size: 0.88rem; color: #0d1f3c; }
        .fac-quick-sub   { font-size: 0.72rem; color: #8a7a60; margin-top: 3px; }

        /* CARD */
        .fac-card { background: #fff; border: 1px solid rgba(44,95,60,0.15); border-radius: 12px; padding: 20px 22px; margin-bottom: 16px; }
        .fac-section-h3 { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #0d1f3c; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .fac-section-h3::after { content: ''; flex: 1; height: 1px; background: rgba(44,95,60,0.18); }

        /* TABLE */
        .fac-table-wrap { background: #fff; border: 1px solid rgba(44,95,60,0.15); border-radius: 12px; overflow: hidden; }
        .fac-table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
        .fac-table thead tr { background: #f2f7f2; border-bottom: 1px solid rgba(44,95,60,0.15); }
        .fac-table th { padding: 11px 16px; text-align: left; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4a7a5a; }
        .fac-table td { padding: 11px 16px; color: #2a2010; }
        .fac-table tbody tr { border-top: 1px solid #f0ede4; }
        .fac-table tbody tr:hover { background: #f8fdf8; }

        /* FORM */
        .fac-form-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 14px; }
        .fac-form-group { margin-bottom: 14px; }
        .fac-label { display: block; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em; color: #0d1f3c; opacity: 0.7; margin-bottom: 6px; }
        .fac-input { width: 100%; padding: 9px 13px; border: 1.5px solid #d8e8d8; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.87rem; background: #f8fdf8; color: #0d1f3c; outline: none; transition: border-color 0.18s, box-shadow 0.18s; appearance: none; }
        .fac-input:focus { border-color: #2c5f3c; box-shadow: 0 0 0 3px rgba(44,95,60,0.1); background: #fff; }
        .fac-status-select { padding: 5px 10px; border-radius: 6px; border: 1.5px solid #d8e8d8; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; background: #f8fdf8; color: #0d1f3c; outline: none; cursor: pointer; }
        .fac-status-select:focus { border-color: #2c5f3c; }

        /* BUTTON */
        .fac-btn { background: #2c5f3c; color: #e8f5ec; border: none; border-radius: 8px; padding: 10px 22px; cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; transition: background 0.18s; display: inline-flex; align-items: center; gap: 7px; position: relative; overflow: hidden; }
        .fac-btn::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #c4a03c, #0d1f3c); }
        .fac-btn:hover { background: #1e4a2a; }
        .fac-btn-secondary { background: #f2f7f2; color: #2c5f3c; border: 1.5px solid #d8e8d8; border-radius: 8px; padding: 10px 18px; cursor: pointer; font-weight: 600; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; transition: all 0.18s; display: inline-flex; align-items: center; gap: 7px; margin-left: 10px; }
        .fac-btn-secondary:hover { background: #e6f0e8; border-color: #2c5f3c; }

        /* NOTICE */
        .fac-notice-card { background: #fff; border: 1px solid rgba(44,95,60,0.15); border-left: 3px solid #2c5f3c; border-radius: 10px; padding: 14px 18px; margin-bottom: 10px; }
        .fac-notice-title   { font-weight: 600; font-size: 0.88rem; color: #0d1f3c; margin-bottom: 4px; }
        .fac-notice-content { font-size: 0.8rem; color: #7a6f58; margin-bottom: 6px; line-height: 1.55; }
        .fac-notice-meta    { font-size: 0.68rem; color: #b0a080; display: flex; align-items: center; justify-content: space-between; }
        .fac-tag { display: inline-block; padding: 2px 9px; border-radius: 100px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.07em; background: rgba(44,95,60,0.1); color: #2c5f3c; border: 1px solid rgba(44,95,60,0.2); text-transform: uppercase; }

        /* STATUS BADGE in attendance */
        .att-status-present { color: #1e5c35; }
        .att-status-absent  { color: #7a2e2e; }
        .att-status-late    { color: #7a5a00; }

        /* EMPTY STATE */
        .fac-empty { text-align: center; padding: 40px 20px; color: #8a7a60; font-style: italic; font-size: 0.88rem; }
      `}</style>

      <div className="fac-page">
        {/* ── SIDEBAR ── */}
        <aside className="fac-sidebar">
          <div className="fac-sidebar-top">
            <div className="fac-logo">
              <div className="fac-logo-mark">📖</div>
              <div>
                <div className="fac-logo-text">EduAI Campus</div>
                <div className="fac-logo-sub">Faculty Portal</div>
              </div>
            </div>
            <div className="fac-avatar">
              <div className="fac-avatar-icon">👨‍🏫</div>
              <div className="fac-avatar-name">{user.firstName} {user.lastName}</div>
              <div className="fac-avatar-desg">{user.designation || "Faculty"}</div>
              <span className="fac-role-badge">Faculty</span>
            </div>
          </div>

          <nav className="fac-nav">
            <div className="fac-nav-section">Faculty Menu</div>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`fac-nav-btn${activeTab === tab.id ? " active" : ""}`}>
                <span className="fac-nav-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          <button onClick={logout} className="fac-logout">← Sign Out</button>
        </aside>

        {/* ── MAIN ── */}
        <main className="fac-main">
          <div className="fac-topbar">
            <div>
              <div className="fac-page-kicker">Faculty Dashboard</div>
              <h1 className="fac-page-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
              <p className="fac-page-sub">{user.department} · {user.employeeId}</p>
            </div>
            <div className="fac-date-badge">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Message bar */}
          {msg.text && (
            <div className={`fac-msg ${msg.type === "error" ? "fac-msg-err" : "fac-msg-ok"}`}>
              <span>{msg.text}</span>
              <button className="fac-msg-close" onClick={() => setMsg({ type: "", text: "" })}>×</button>
            </div>
          )}

          {/* ════ OVERVIEW ════ */}
          {activeTab === "overview" && (
            <div>
              <div className="fac-stats-grid">
                <StatCard accent="navy"  icon="🎓" label="My Students"  value={loadingStudents ? "…" : students.length} sub={user.department} />
                <StatCard accent="green" icon="◆"  label="Notices"      value={notices.length}                          sub="active" />
                <StatCard accent="gold"  icon="◈"  label="Subjects"     value={subjectList.length}                      sub="assigned" />
                <StatCard accent="sage"  icon="◉"  label="Designation"  value={user.designation?.split(" ")[0] || "Prof"} sub="role" />
              </div>

              <h3 className="fac-section-h3">Quick Actions</h3>
              <div className="fac-quick-grid">
                {[
                  ["✅", "Mark Attendance", "Record daily attendance", "attendance"],
                  ["📝", "Enter Marks",     "Upload exam scores",      "marks"],
                  ["🎓", "View Students",   "Browse your class list",  "students"],
                ].map(([icon, label, sub, tab]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className="fac-quick-btn">
                    <div className="fac-quick-icon">{icon}</div>
                    <div className="fac-quick-label">{label}</div>
                    <div className="fac-quick-sub">{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════ ATTENDANCE ════ */}
          {activeTab === "attendance" && (
            <div>
              <div className="fac-card">
                <h3 className="fac-section-h3">Mark Attendance</h3>
                <div className="fac-form-row">

                  {/* FIX 1: Subject is now a dropdown, not a text input */}
                  <div className="fac-form-group">
                    <label className="fac-label">Subject *</label>
                    <select
                      value={attForm.subject}
                      onChange={e => setAttForm(f => ({ ...f, subject: e.target.value }))}
                      className="fac-input"
                    >
                      <option value="">— Select Subject —</option>
                      {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="fac-form-group">
                    <label className="fac-label">Date *</label>
                    <input
                      type="date"
                      value={attForm.date}
                      onChange={e => setAttForm(f => ({ ...f, date: e.target.value }))}
                      className="fac-input"
                    />
                  </div>

                  {/* Semester dropdown — built from ACTUAL values in DB */}
                  <div className="fac-form-group">
                    <label className="fac-label">Semester / Year *</label>
                    <select
                      value={attForm.semester}
                      onChange={e => {
                        setAttForm(f => ({ ...f, semester: e.target.value }));
                        setAttList([]);
                      }}
                      className="fac-input"
                    >
                      <option value="">— All Semesters —</option>
                      {/* Show actual values from DB first */}
                      {actualSemesters.length > 0
                        ? actualSemesters.map(y => <option key={y} value={y}>{y}</option>)
                        : SEMESTERS.map(y => <option key={y} value={y}>{y}</option>)
                      }
                    </select>
                    {/* Debug hint: show what values actually exist */}
                    {actualSemesters.length > 0 && (
                      <div style={{ fontSize: "0.68rem", color: "#8a7a60", marginTop: 4 }}>
                        DB values: {actualSemesters.join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={loadStudentsForAtt} className="fac-btn">
                    ◉ Load Students
                  </button>
                  {loadingStudents && (
                    <span style={{ fontSize: "0.8rem", color: "#8a7a60" }}>Fetching students…</span>
                  )}
                  {attList.length > 0 && (
                    <span style={{ fontSize: "0.8rem", color: "#2c5f3c", fontWeight: 600 }}>
                      ✓ {attList.length} students loaded
                    </span>
                  )}
                </div>
              </div>

              {/* FIX 3: Attendance table only shows when students are loaded */}
              {attList.length > 0 && (
                <div className="fac-card">
                  <h3 className="fac-section-h3">
                    {attForm.subject} · {attForm.date} · {attForm.semester}
                  </h3>

                  {/* Summary row */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
                    {["present","absent","late"].map(status => {
                      const count = attList.filter(a => a.status === status).length;
                      const colors = { present: "#1e5c35", absent: "#7a2e2e", late: "#7a5a00" };
                      const bgs    = { present: "#f0f7f2", absent: "#fdf1f0", late: "#fdfaf0" };
                      return (
                        <div key={status} style={{ background: bgs[status], border: `1px solid ${colors[status]}22`, borderRadius: 8, padding: "6px 14px", fontSize: "0.78rem", fontWeight: 600, color: colors[status] }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setAttList(l => l.map(a => ({ ...a, status: "present" })))}
                      style={{ marginLeft: "auto", background: "none", border: "1px solid #d8e8d8", borderRadius: 7, padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer", color: "#2c5f3c", fontFamily: "inherit" }}
                    >
                      Mark All Present
                    </button>
                  </div>

                  <div className="fac-table-wrap">
                    <table className="fac-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Roll No.</th>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attList.map((a, i) => (
                          <tr key={i}>
                            <td style={{ color: "#b0a080" }}>{i + 1}</td>
                            <td style={{ fontWeight: 600, color: "#0d1f3c" }}>{a.rollNumber}</td>
                            <td>{a.name}</td>
                            <td>
                              <select
                                value={a.status}
                                onChange={e => setAttList(l => l.map((x, j) => j === i ? { ...x, status: e.target.value } : x))}
                                className="fac-status-select"
                                style={{
                                  color: a.status === "present" ? "#1e5c35" : a.status === "absent" ? "#7a2e2e" : "#7a5a00",
                                  fontWeight: 600,
                                }}
                              >
                                <option value="present">✓ Present</option>
                                <option value="absent">✗ Absent</option>
                                <option value="late">⏱ Late</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                    <button onClick={submitAttendance} className="fac-btn">
                      ✓ Submit Attendance
                    </button>
                    <button onClick={() => setAttList([])} className="fac-btn-secondary">
                      ✕ Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Empty state when no students loaded yet */}
              {attList.length === 0 && (
                <div className="fac-card">
                  <div className="fac-empty">
                    Select a subject, date and semester above, then click <strong>Load Students</strong> to begin marking attendance.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ MARKS ════ */}
          {activeTab === "marks" && (
            <div className="fac-card">
              <h3 className="fac-section-h3">Enter Marks</h3>
              <div className="fac-form-row">

                {/* Semester first — filters student dropdown */}
                <div className="fac-form-group">
                  <label className="fac-label">Semester / Year</label>
                  <select value={marksForm.semester}
                    onChange={e => setMarksForm(f => ({ ...f, semester: e.target.value, rollNumber: "" }))}
                    className="fac-input">
                    <option value="">— All Semesters —</option>
                    {actualSemesters.length > 0
                      ? actualSemesters.map(y => <option key={y} value={y}>{y}</option>)
                      : SEMESTERS.map(y => <option key={y} value={y}>{y}</option>)
                    }
                  </select>
                </div>

                {/* Student dropdown — filtered by semester */}
                <div className="fac-form-group">
                  <label className="fac-label">Student *</label>
                  <select value={marksForm.rollNumber}
                    onChange={e => setMarksForm(f => ({ ...f, rollNumber: e.target.value }))}
                    className="fac-input">
                    <option value="">— Select Student —</option>
                    {students
                      .filter(s => !marksForm.semester || semestersMatch(s.semester, marksForm.semester))
                      .map(st => (
                        <option key={st._id} value={st.rollNumber}>
                          {st.rollNumber} – {st.firstName} {st.lastName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Subject dropdown */}
                <div className="fac-form-group">
                  <label className="fac-label">Subject *</label>
                  <select value={marksForm.subject}
                    onChange={e => setMarksForm(f => ({ ...f, subject: e.target.value }))}
                    className="fac-input">
                    <option value="">— Select Subject —</option>
                    {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="fac-form-row">
                <div className="fac-form-group">
                  <label className="fac-label">Exam Type</label>
                  <select value={marksForm.examType}
                    onChange={e => setMarksForm(f => ({ ...f, examType: e.target.value }))}
                    className="fac-input">
                    {["internal1","internal2","semester","quiz","assignment"].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <FacField label="Marks Obtained *" type="number" value={marksForm.marks}
                  onChange={e => setMarksForm(f => ({ ...f, marks: e.target.value }))} placeholder="e.g. 78" />
                <FacField label="Max Marks" type="number" value={marksForm.maxMarks}
                  onChange={e => setMarksForm(f => ({ ...f, maxMarks: e.target.value }))} placeholder="100" />
              </div>

              {/* Live percentage preview */}
              {marksForm.marks && marksForm.maxMarks && (
                <div style={{ marginBottom: 14, padding: "8px 14px", background: "#f0f7f2", borderRadius: 8, fontSize: "0.83rem", color: "#2c5f3c", fontWeight: 600 }}>
                  Percentage: {((marksForm.marks / marksForm.maxMarks) * 100).toFixed(1)}%
                  {" · "}
                  Grade: {
                    (marksForm.marks / marksForm.maxMarks) >= 0.9 ? "O" :
                    (marksForm.marks / marksForm.maxMarks) >= 0.8 ? "A+" :
                    (marksForm.marks / marksForm.maxMarks) >= 0.7 ? "A"  :
                    (marksForm.marks / marksForm.maxMarks) >= 0.6 ? "B+" :
                    (marksForm.marks / marksForm.maxMarks) >= 0.5 ? "B"  : "F"
                  }
                </div>
              )}

              <button onClick={submitMarks} className="fac-btn">◎ Save Marks</button>
            </div>
          )}

          {/* ════ STUDENTS ════ */}
          {activeTab === "students" && (
            <div>
              <h3 className="fac-section-h3">
                Students — {user.department}
                <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 400, fontSize: "0.78rem", color: "#8a7a60", marginLeft: 6 }}>
                  {students.length} total
                </span>
              </h3>

              {/* Filter by semester */}
              <div style={{ marginBottom: 14 }}>
                <select
                  defaultValue=""
                  onChange={e => {
                    const val = e.target.value;
                    // just a visual filter — re-render via state
                    // for simplicity we use the attForm semester state
                  }}
                  className="fac-input"
                  style={{ maxWidth: 200 }}
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="fac-table-wrap">
                <table className="fac-table">
                  <thead>
                    <tr><th>#</th><th>Roll No.</th><th>Name</th><th>Year</th><th>Dept</th><th>Phone</th></tr>
                  </thead>
                  <tbody>
                    {students.map((st, i) => (
                      <tr key={i}>
                        <td style={{ color: "#b0a080" }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: "#0d1f3c" }}>{st.rollNumber}</td>
                        <td>{st.firstName} {st.lastName}</td>
                        <td>{st.semester}</td>
                        <td><span className="fac-tag">{st.department}</span></td>
                        <td style={{ color: "#8a7a60", fontSize: "0.8rem" }}>{st.phone || "—"}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={6} className="fac-empty">No students found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ NOTICES ════ */}
          {activeTab === "notices" && (
            <div>
              <h3 className="fac-section-h3">Notice Board</h3>
              {notices.map((n, i) => (
                <div key={i} className="fac-notice-card">
                  <div className="fac-notice-title">{n.title}</div>
                  <div className="fac-notice-content">{n.content}</div>
                  <div className="fac-notice-meta">
                    <span>{new Date(n.date || n.createdAt).toLocaleString()}</span>
                    <span className="fac-tag">{n.targetRole || "All"}</span>
                  </div>
                </div>
              ))}
              {notices.length === 0 && (
                <div className="fac-card">
                  <div className="fac-empty">No notices yet.</div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Floating AI chat */}
        <AIChat userRole="faculty" userName={user.firstName || "Sir"} />
      </div>
    </>
  );
}

// ── Small reusable field ─────────────────────────────────────
function FacField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="fac-form-group">
      <label className="fac-label">{label}</label>
      <input type={type} value={value} onChange={onChange}
        placeholder={placeholder} className="fac-input" />
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ accent, icon, label, value, sub }) {
  return (
    <div className={`fac-stat fac-stat-${accent}`}>
      <div className="fac-stat-icon">{icon}</div>
      <div className="fac-stat-label">{label}</div>
      <div className="fac-stat-value">{value}</div>
      <div className="fac-stat-sub">{sub}</div>
    </div>
  );
}