import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
  Database,
  Download,
  FilePenLine,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";
import { database } from "./firebase";
import { formatRecordId, validateRecordFields } from "./utils/recordUtils";
import { applyPasscodeInput, previousPasscodeIndex } from "./utils/passcodeUtils";
import { getRememberedUsername, rememberUsername } from "./utils/sessionUtils";
import { createPersonRecord, personDatabaseKey } from "./utils/peopleUtils";
import { resetRecordForm } from "./utils/recordFormUtils";
import { nextDatabaseSeries } from "./utils/recordFormUtils";
import { sortRecordsByDate } from "./utils/recordSortUtils";
import { buildRecordExportHtml } from "./utils/exportUtils";
import { modeLabel } from "./utils/modeLabelUtils";

const emptyForm = { month: "", day: "", series: "1" };

function App() {
  const [user, setUser] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [mode, setMode] = useState(null);
  const [people, setPeople] = useState([]);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    return onValue(ref(database, "people"), (snapshot) => {
      const data = snapshot.val() || {};
      setPeople(Object.entries(data).map(([id, person]) => ({ id, ...person })));
    }, () => setNotice({ type: "error", text: "Unable to load people. Check your Firebase Realtime Database rules." }));
  }, [user]);

  const login = (person) => {
    sessionStorage.setItem("pcrsir-user", JSON.stringify(person));
    setUser(person);
  };

  const logout = () => {
    sessionStorage.removeItem("pcrsir-user");
    setUser(null);
    setSelectedPerson(null);
    setMode(null);
  };

  if (!user) return <Login onLogin={login} />;
  if (selectedPerson && mode) {
    return <Workspace person={selectedPerson} mode={mode} onModeChange={setMode} onBack={() => setMode(null)} onDirectory={() => { setSelectedPerson(null); setMode(null); }} notice={notice} setNotice={setNotice} />;
  }
  if (selectedPerson) {
    return <PersonChoice person={selectedPerson} onChoose={setMode} onBack={() => setSelectedPerson(null)} />;
  }
  return <Directory people={people} currentUser={user} onSelect={(person) => setSelectedPerson(person)} onLogout={logout} notice={notice} setNotice={setNotice} />;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState(() => getRememberedUsername());
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (username) document.getElementById("passcode-0")?.focus();
  }, []);

  const submit = async (passcode = digits.join("")) => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || passcode.length !== 4) return;
    setBusy(true);
    setError("");
    try {
      const usersSnapshot = await get(ref(database, "users"));
      const snapshot = await get(ref(database, `users/${normalizedUsername}`));
      const person = snapshot.val();
      if (!person && normalizedUsername === "admin" && passcode === "1234" && !usersSnapshot.exists()) {
        const admin = { name: "Administrator", role: "System Administrator", passcode: "1234" };
        await set(ref(database, "users/admin"), admin);
        rememberUsername("admin");
        onLogin({ id: "admin", ...admin });
        return;
      }
      if (!person || String(person.passcode) !== passcode) throw new Error("Invalid username or passcode.");
      rememberUsername(normalizedUsername);
      onLogin({ id: normalizedUsername, ...person });
    } catch (loginError) {
      setError(loginError.message === "Invalid username or passcode." ? loginError.message : "Could not connect to Firebase. Please try again.");
      setDigits(["", "", "", ""]);
    } finally {
      setBusy(false);
    }
  };

  const changeDigit = (value, index) => {
    const next = applyPasscodeInput(digits, index, value);
    setDigits(next);
    const enteredDigits = value.replace(/\D/g, "");
    const lastIndex = Math.min(index + enteredDigits.length - 1, 3);
    if (enteredDigits && lastIndex < 3) document.getElementById(`passcode-${lastIndex + 1}`)?.focus();
    if (enteredDigits && next.join("").length === 4) submit(next.join(""));
  };

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="brand-mark"><ShieldCheck size={23} /></div>
        <p className="eyebrow">NIA • PCRISR</p>
        <h1>Welcome back.</h1>
        <p className="muted">Sign in to manage your personnel records securely.</p>
        <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="login-form">
          <label htmlFor="username">Username / ID</label>
          <input id="username" value={username} onChange={(event) => { setUsername(event.target.value); setDigits(["", "", "", ""]); }} placeholder="Enter your username" autoComplete="username" />
          <div className="label-row"><label>4-digit passcode</label><span className="muted small">Enter each digit</span></div>
          <div className="passcode-row">
            {digits.map((digit, index) => <input key={index} id={`passcode-${index}`} inputMode="numeric" maxLength="4" value={digit} onChange={(event) => changeDigit(event.target.value, index)} onKeyDown={(event) => event.key === "Backspace" && !digit && previousPasscodeIndex(index, digit) !== index && document.getElementById(`passcode-${index - 1}`)?.focus()} aria-label={`Passcode digit ${index + 1}`} />)}
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button wide" disabled={busy || !username || digits.join("").length !== 4}>{busy ? "Signing in..." : "Sign in"} <ArrowRight size={17} /></button>
        </form>
        <p className="login-footer">Access is managed through your Firebase Realtime Database.</p>
      </section>
      <aside className="login-art">
        <div className="art-glow" />
        <p className="eyebrow light">PERSONNEL RECORDS SYSTEM</p>
        <h2>One clear view<br />of your work.</h2>
        <p>Keep PC and RIS identifiers organized, searchable, and ready to export.</p>
        <div className="art-stats"><span><strong>PC</strong> IAR tracking</span><span><strong>RIS</strong> Series tracking</span></div>
      </aside>
    </main>
  );
}

function Directory({ people, currentUser, onSelect, onLogout, notice, setNotice }) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newPerson, setNewPerson] = useState({ name: "" });
  const filtered = people.filter((person) => `${person.name} ${person.id} ${person.role}`.toLowerCase().includes(search.toLowerCase()));

  const addPerson = async (event) => {
    event.preventDefault();
    if (!newPerson.name.trim()) {
      setNotice({ type: "error", text: "A person's name is required." });
      return;
    }
    try {
      await set(ref(database, `people/${personDatabaseKey(newPerson.name)}`), createPersonRecord(newPerson.name));
      setNewPerson({ name: "" });
      setShowAdd(false);
      setNotice({ type: "success", text: "Person added to the directory." });
    } catch {
      setNotice({ type: "error", text: "Could not add person. Check your Firebase permissions." });
    }
  };

  return <div className="app-shell">
    <Header currentUser={currentUser} onLogout={onLogout} />
    <main className="page-content">
      <div className="page-heading"><div><p className="eyebrow">DIRECTORY</p><h1>Choose a person</h1><p className="muted">Select a person to manage their PC and RIS records.</p></div><button className="primary-button" onClick={() => setShowAdd(true)}><UserPlus size={17} /> Add people</button></div>
      {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}
      <div className="toolbar"><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people..." /></div><span className="muted small">{filtered.length} people</span></div>
      <section className="people-grid">{filtered.map((person) => <button className="person-card" key={person.id} onClick={() => onSelect(person)}><div className="avatar">{(person.name || person.id).slice(0, 1).toUpperCase()}</div><div className="person-info"><strong>{person.name || person.id}</strong><span>{person.role || "Personnel"}</span><small>@{person.id}</small></div><ArrowRight className="card-arrow" size={18} /></button>)}</section>
      {!filtered.length && <EmptyState icon={<Users />} title="No people found" text="Add a person or try another search." />}
    </main>
    {showAdd && <Modal title="Add a person" onClose={() => setShowAdd(false)}><form className="modal-form" onSubmit={addPerson}><Field label="Full name" value={newPerson.name} onChange={(value) => setNewPerson({ name: value })} placeholder="e.g. Juan Dela Cruz" /><p className="modal-help">PC and RIS access are enabled by default. Login details are only required for the administrator.</p><button className="primary-button wide">Add to directory <Plus size={17} /></button></form></Modal>}
  </div>;
}

function PersonChoice({ person, onChoose, onBack }) {
  return <div className="app-shell"><Header currentUser={person} onLogout={onBack} /><main className="page-content choice-page">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Directory</button>
    <div className="choice-heading"><div className="avatar large">{(person.name || person.id).slice(0, 1).toUpperCase()}</div><p className="eyebrow">PERSON SELECTED</p><h1>{person.name || person.id}</h1><p className="muted">@{person.id} · {person.role || "Personnel"}</p></div>
    <div className="choice-grid"><button className="choice-card pc" onClick={() => onChoose("PC")}><span className="choice-icon"><ClipboardList size={26} /></span><span><strong>PC</strong><small>Personnel Clearance</small><em>Manage IAR identifiers</em></span><ArrowRight size={20} /></button><button className="choice-card ris" onClick={() => onChoose("RIS")}><span className="choice-icon"><Database size={26} /></span><span><strong>RIS</strong><small>Records Information System</small><em>Manage RIS identifiers</em></span><ArrowRight size={20} /></button></div>
  </main></div>;
}

function Workspace({ person, mode, onModeChange, onBack, onDirectory, notice, setNotice }) {
  const [tab, setTab] = useState("fillup");
  const activeMode = modeLabel(mode);
  return <div className="app-shell"><Header currentUser={person} onLogout={onDirectory} /><main className="page-content workspace">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Directory</button>
    <div className="workspace-heading"><div><div className={`system-title ${mode.toLowerCase()}`}><span className="system-title-icon">{mode === "PC" ? <ClipboardList size={28} /> : <Database size={28} />}</span><span><strong>{activeMode.short}</strong><em>{activeMode.title}</em></span></div><h1>{person.name || person.id}</h1><p className="muted">{mode === "PC" ? "Manage IAR identifiers and petty cash records." : "Manage RIS identifiers and requisition records."}</p></div><div className="mode-controls"><div className="mode-switcher" role="group" aria-label="Switch record system"><button className={mode === "PC" ? "active pc" : ""} onClick={() => onModeChange("PC")}>PC</button><button className={mode === "RIS" ? "active ris" : ""} onClick={() => onModeChange("RIS")}>RIS</button></div></div></div>
    <nav className="tabs"><button className={tab === "fillup" ? "active" : ""} onClick={() => setTab("fillup")}><FilePenLine size={17} /> Fill up</button><button className={tab === "database" ? "active" : ""} onClick={() => setTab("database")}><Database size={17} /> Database</button></nav>
    {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}
    {tab === "fillup" ? <Fillup person={person} mode={mode} setNotice={setNotice} /> : <RecordsDatabase person={person} mode={mode} setNotice={setNotice} />}
  </main></div>;
}

function Fillup({ person, mode, setNotice }) {
  const [form, setForm] = useState(emptyForm);
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => onValue(ref(database, `records/${person.id}/${mode}`), (snapshot) => setRecords(Object.entries(snapshot.val() || {}).map(([id, record]) => ({ id, ...record })))), [person.id, mode]);
  useEffect(() => setForm((current) => ({ ...current, series: String(nextDatabaseSeries(records)) })), [records]);
  const save = async (event) => {
    event.preventDefault();
    const error = validateRecordFields(form.month, form.day, form.series);
    if (error) return setNotice({ type: "error", text: error });
    setSaving(true);
    try {
      const record = { ...form, month: Number(form.month), day: Number(form.day), series: Number(form.series), identifier: formatRecordId(mode, form.month, form.day, form.series), createdAt: Date.now() };
      await push(ref(database, `records/${person.id}/${mode}`), record);
      setNotice({ type: "success", text: `${mode} record saved successfully.` });
      setForm(resetRecordForm(nextDatabaseSeries([...records, record])));
    } catch { setNotice({ type: "error", text: "Could not save the record. Check your Firebase permissions." }); }
    finally { setSaving(false); }
  };
  return <section className="form-layout"><div className="form-card glass-card"><div className="section-title"><div className={`icon-tile ${mode.toLowerCase()}`}>{mode === "PC" ? <ClipboardList size={20} /> : <Database size={20} />}</div><div><h2>New {mode} entry</h2><p className="muted">Enter the parts of the identifier below.</p></div></div><form onSubmit={save}><div className="field-grid"><Field label="Month" type="number" min="1" max="12" value={form.month} onChange={(value) => setForm({ ...form, month: value })} /><Field label="Day" type="number" min="1" max="31" value={form.day} onChange={(value) => setForm({ ...form, day: value })} /><Field label="Series" type="number" min="1" value={form.series} onChange={(value) => setForm({ ...form, series: value })} /></div><div className="preview"><span>Identifier preview</span><strong>{formatRecordId(mode, form.month || "—", form.day || "—", form.series || "—")}</strong></div><button className={`primary-button wide save-button ${saving ? "is-saving" : ""}`} disabled={saving}>{saving ? "Saving..." : "Save"} <Check size={17} /></button></form></div><div className="tips-card glass-card"><p className="eyebrow">QUICK GUIDE</p><h3>{mode === "PC" ? "IAR format" : "RIS format"}</h3><div className="format-display">{mode === "PC" ? "IAR: PC-" : ""}<span>month</span>-<span>day</span>-<span>series</span></div><p className="muted">Series numbers are automatically suggested from existing records with the same month and day.</p><div className="tip-item"><Check size={15} /> Edit or remove records anytime</div><div className="tip-item"><Check size={15} /> Export records to Excel</div></div></section>;
}

function RecordsDatabase({ person, mode, setNotice }) {
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  useEffect(() => onValue(ref(database, `records/${person.id}/${mode}`), (snapshot) => setRecords(sortRecordsByDate(Object.entries(snapshot.val() || {}).map(([id, record]) => ({ id, ...record }))))), [person.id, mode]);
  const filtered = useMemo(() => sortRecordsByDate(records.filter((record) => record.identifier.toLowerCase().includes(search.toLowerCase()))), [records, search]);
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((record) => record.id));
  const deleteSelected = async () => { if (!selected.length) return; try { await Promise.all(selected.map((id) => remove(ref(database, `records/${person.id}/${mode}/${id}`)))); setSelected([]); setNotice({ type: "success", text: "Selected records deleted." }); } catch { setNotice({ type: "error", text: "Could not delete selected records." }); } };
  const saveEdit = async (event) => { event.preventDefault(); const error = validateRecordFields(editing.month, editing.day, editing.series); if (error) return setNotice({ type: "error", text: error }); try { await update(ref(database, `records/${person.id}/${mode}/${editing.id}`), { ...editing, month: Number(editing.month), day: Number(editing.day), series: Number(editing.series), identifier: formatRecordId(mode, editing.month, editing.day, editing.series) }); setEditing(null); setNotice({ type: "success", text: "Record updated successfully." }); } catch { setNotice({ type: "error", text: "Could not update the record." }); } };
  const exportExcel = () => { const blob = new Blob([buildRecordExportHtml(person.name || person.id, mode, filtered)], { type: "application/vnd.ms-excel" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${person.id}-${mode}-records.xls`; anchor.click(); URL.revokeObjectURL(url); };
  return <section className="database-card"><div className="database-toolbar"><div><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search identifiers..." /></div><span className="sort-hint">Sorted by month, day, then series</span></div><div className="toolbar-actions"><button className="secondary-button" onClick={exportExcel}><Download size={16} /> Export Excel</button><button className="danger-button" disabled={!selected.length} onClick={deleteSelected}><Trash2 size={16} /> Delete {selected.length ? `(${selected.length})` : ""}</button></div></div><div className="table-wrap"><table><thead><tr><th><input type="checkbox" checked={filtered.length > 0 && selected.length === filtered.length} onChange={toggleAll} /></th><th>Identifier</th><th>Month</th><th>Day</th><th>Series</th><th>Created</th><th /></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td><input type="checkbox" checked={selected.includes(record.id)} onChange={() => toggle(record.id)} /></td><td><strong>{record.identifier}</strong></td><td>{record.month}</td><td>{record.day}</td><td>{record.series}</td><td>{new Date(record.createdAt).toLocaleDateString()}</td><td><button className="icon-button" title="Edit record" onClick={() => setEditing(record)}><FilePenLine size={16} /></button></td></tr>)}</tbody></table>{!filtered.length && <EmptyState icon={<Database />} title="No records yet" text="Saved identifiers will appear here." />}</div>{editing && <Modal title="Edit record" onClose={() => setEditing(null)}><form className="modal-form" onSubmit={saveEdit}><div className="field-grid"><Field label="Month" type="number" value={String(editing.month)} onChange={(value) => setEditing({ ...editing, month: value })} /><Field label="Day" type="number" value={String(editing.day)} onChange={(value) => setEditing({ ...editing, day: value })} /><Field label="Series" type="number" value={String(editing.series)} onChange={(value) => setEditing({ ...editing, series: value })} /></div><div className="preview"><span>Updated identifier</span><strong>{formatRecordId(mode, editing.month, editing.day, editing.series)}</strong></div><button className="primary-button wide">Save changes <Check size={17} /></button></form></Modal>}</section>;
}

function Header({ currentUser, onLogout }) { return <header className="topbar"><button className="brand" onClick={() => window.location.reload()}><span className="brand-icon"><ShieldCheck size={18} /></span><span>NIA <b>PCRISR</b></span></button><div className="user-menu"><div className="mini-avatar">{(currentUser.name || currentUser.id).slice(0, 1).toUpperCase()}</div><div className="user-name"><strong>{currentUser.name || currentUser.id}</strong><span>@{currentUser.id}</span></div><button className="icon-button" onClick={onLogout} title="Sign out"><LogOut size={17} /></button></div></header>; }
function Field({ label, value, onChange, type = "text", ...props }) { return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} /></label>; }
function Notice({ notice, onClose }) { return <div className={`notice ${notice.type}`}><span>{notice.text}</span><button onClick={onClose}><X size={15} /></button></div>; }
function EmptyState({ icon, title, text }) { return <div className="empty-state">{icon}<strong>{title}</strong><span>{text}</span></div>; }
function Modal({ title, onClose, children }) { return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="modal"><div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18} /></button></div>{children}</div></div>; }

export default App;
