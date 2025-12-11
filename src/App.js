import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  // members: { id, name, gender, dob, fatherId, motherId }
  const [members, setMembers] = useState(() => {
    try {
      const raw = localStorage.getItem("family_members_v1");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("family_members_v1", JSON.stringify(members));
  }, [members]);

  // load Font Awesome for icons (optional)
  useEffect(() => {
    const faLink = document.createElement("link");
    faLink.rel = "stylesheet";
    faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    faLink.crossOrigin = "anonymous";
    document.head.appendChild(faLink);
    return () => document.head.removeChild(faLink);
  }, []);

  // helper: return icon element for gender (used in lists/details)
  function genderIcon(g) {
    if (!g) return null;
    const key = (g || "").toLowerCase();
    if (key === "male") return <i className="fa-solid fa-mars gicon male" title="Male" aria-hidden="true" />;
    if (key === "female") return <i className="fa-solid fa-venus gicon female" title="Female" aria-hidden="true" />;
    return <i className="fa-solid fa-circle-question gicon other" title="Other" aria-hidden="true" />;
  }

  // derived helpers
  function findChildren(id) {
    return members.filter((m) => m.fatherId === id || m.motherId === id);
  }

  function findParents(member) {
    const parents = [];
    if (!member) return parents;
    const f = members.find((m) => m.id === member.fatherId);
    const g = members.find((m) => m.id === member.motherId);
    if (f) parents.push(f);
    if (g) parents.push(g);
    return parents;
  }

  function findSiblings(member) {
    if (!member) return [];
    return members.filter(
      (m) => m.id !== member.id && (m.fatherId === member.fatherId || m.motherId === member.motherId)
    );
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (!form.name.trim()) return alert("Name is required");

    if (editingId) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...form, id: editingId } : m))
      );
      setEditingId(null);
      setForm(emptyForm());
    } else {
      const id = String(Date.now());
      const newMember = { id, ...form };
      setMembers((prev) => [...prev, newMember]);
      setForm(emptyForm());
      setSelectedId(id);
    }
  }

  function startEdit(id) {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id);
    setForm({ name: m.name || "", gender: m.gender || "", dob: m.dob || "", fatherId: m.fatherId || "", motherId: m.motherId || "" });
    setSelectedId(id);
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this member? Their children will lose the parent link.")) return;
    setMembers((prev) => prev
      .map((m) => ({ ...m, fatherId: m.fatherId === id ? "" : m.fatherId, motherId: m.motherId === id ? "" : m.motherId }))
      .filter((m) => m.id !== id)
    );
    if (selectedId === id) setSelectedId(null);
  }

  function renderFatherOptions() {
    const males = members.filter((m) => (m.gender || "").toLowerCase() === "male");
    return [
      <option key="_none" value="">None</option>,
      ...males.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}{m.dob ? ` — ${m.dob}` : ""}
        </option>
      )),
    ];
  }

  function renderMotherOptions() {
    const females = members.filter((m) => (m.gender || "").toLowerCase() === "female");
    return [
      <option key="_none2" value="">None</option>,
      ...females.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}{m.dob ? ` — ${m.dob}` : ""}
        </option>
      )),
    ];
  }

  function renderTree() {
    const visible = members.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));
    const rootCandidates = members.filter((m) => !m.fatherId && !m.motherId);
    const roots = rootCandidates.length ? rootCandidates : members.slice(0, 1);
    const seen = new Set();

    function nodeLines(member, prefix = "") {
      if (!member || seen.has(member.id)) return "";
      seen.add(member.id);
      const children = findChildren(member.id);
      const sym = member.gender === "Male" ? " ♂" : member.gender === "Female" ? " ♀" : " •";
      let line = `${prefix}${member.name}${sym}\n`;
      if (!children.length) return line;
      for (let i = 0; i < children.length; i++) {
        const ch = children[i];
        const isLast = i === children.length - 1;
        const childPrefix = prefix + (isLast ? "└─ " : "├─ ");
        line += nodeLines(ch, childPrefix);
      }
      return line;
    }

    let out = "";
    if (query.trim()) {
      visible.forEach((v) => { out += nodeLines(v, ""); });
      return out || "(no results)";
    }

    roots.forEach((r) => { out += nodeLines(r, ""); });
    return out || "(no members yet)";
  }

  function emptyForm() {
    return { name: "", gender: "", dob: "", fatherId: "", motherId: "" };
  }

  const selected = members.find((m) => m.id === selectedId) || null;

  return (
    <div className="app">
      <h2>Family Tree</h2>
      <p className="small">Add, edit, delete members.</p>

      <div className="grid" role="main">
        <div className="leftColumn">
          <div className="card">
            <strong>{editingId ? "Edit member" : "Add member"}</strong>
            <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
              <div className="form-row">
                <label>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="form-row">
                <label>Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <label>Date of birth</label>
                <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>

              <div className="form-row two-cols">
                <div>
                  <label>Father</label>
                  <select value={form.fatherId} onChange={(e) => setForm({ ...form, fatherId: e.target.value || "" })}>
                    {renderFatherOptions()}
                  </select>
                </div>
                <div>
                  <label>Mother</label>
                  <select value={form.motherId} onChange={(e) => setForm({ ...form, motherId: e.target.value || "" })}>
                    {renderMotherOptions()}
                  </select>
                </div>
              </div>

              <div className="actions">
                <button className="primary" type="submit">{editingId ? "Save" : "Add"}</button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => { setEditingId(null); setForm(emptyForm()); }}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Family Tree</strong>
              <input
                className="search"
                placeholder="Search by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <pre className="tree" style={{ marginTop: 12 }}>{renderTree()}</pre>

            <div style={{ marginTop: 12 }}>
              <strong>All members</strong>
              <div style={{ marginTop: 8 }}>
                {members.map((m) => (
                  <div key={m.id} className="member-row">
                    <div style={{ flex: 1 }}>
                      <button className="member-btn" onClick={() => setSelectedId(m.id)}>
                        {m.name} {genderIcon(m.gender)}
                      </button>
                      <div className="meta">{m.gender} · {m.dob || "-"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="member-btn" onClick={() => startEdit(m.id)}>Edit</button>
                      <button className="member-btn" onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                  </div>
                ))}
                {members.length === 0 && <div className="meta" style={{ padding: 8 }}>(no members yet)</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="rightColumn">
          <div className="card detail">
            <strong>Member details</strong>
            {!selected && <div style={{ marginTop: 10 }}>Select a member from the list to see details.</div>}
            {selected && (
              <div style={{ marginTop: 12 }}>
                <h3>{selected.name} {genderIcon(selected.gender)}</h3>
                <div className="meta">Gender: {selected.gender || "-"}</div>
                <div className="meta">DOB: {selected.dob || "-"}</div>

                <div style={{ marginTop: 12 }}>
                  <strong>Parents</strong>
                  {findParents(selected).length === 0 && <div className="meta" style={{ marginTop: 6 }}>(no parents recorded)</div>}
                  {findParents(selected).map((p) => (
                    <div key={p.id} className="member-row">
                      <div style={{ flex: 1 }}>{p.name} {genderIcon(p.gender)}<div className="meta">{p.gender} · {p.dob || "-"}</div></div>
                      <div><button className="member-btn" onClick={() => setSelectedId(p.id)}>View</button></div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Children</strong>
                  {findChildren(selected.id).length === 0 && <div className="meta" style={{ marginTop: 6 }}>(no children)</div>}
                  {findChildren(selected.id).map((c) => (
                    <div key={c.id} className="member-row">
                      <div style={{ flex: 1 }}>{c.name} {genderIcon(c.gender)}<div className="meta">{c.gender} · {c.dob || "-"}</div></div>
                      <div><button className="member-btn" onClick={() => setSelectedId(c.id)}>View</button></div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Siblings</strong>
                  {findSiblings(selected).length === 0 && <div className="meta" style={{ marginTop: 6 }}>(no siblings)</div>}
                  {findSiblings(selected).map((s) => (
                    <div key={s.id} className="member-row">
                      <div style={{ flex: 1 }}>{s.name} {genderIcon(s.gender)}<div className="meta">{s.gender} · {s.dob || "-"}</div></div>
                      <div><button className="member-btn" onClick={() => setSelectedId(s.id)}>View</button></div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="member-btn" onClick={() => startEdit(selected.id)}>Edit</button>
                  <button className="member-btn" onClick={() => handleDelete(selected.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <strong>Import / Export</strong>
            <div style={{ marginTop: 8 }}>
              <button
                className="member-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(members, null, 2));
                  alert("JSON copied to clipboard");
                }}
              >
                Copy JSON
              </button>
              <input
                style={{ display: "block", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #e8eef0" }}
                placeholder="Paste JSON here to import"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (!v) return;
                  try {
                    const parsed = JSON.parse(v);
                    if (!Array.isArray(parsed)) throw new Error("Expected array");
                    setMembers(parsed);
                    alert("Imported successfully");
                    e.target.value = "";
                  } catch (err) {
                    alert("Invalid JSON: " + err.message);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
