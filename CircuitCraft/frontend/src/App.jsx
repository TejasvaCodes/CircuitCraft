import { useMemo, useState } from "react";

const examples = [
  "Build a smart plant watering system with soil moisture sensing",
  "Make an obstacle avoiding robot using an ultrasonic sensor",
  "Create a temperature and humidity monitor with an OLED display"
];

export default function App() {
  const [tab, setTab] = useState("planner");
  const [projectName, setProjectName] = useState("");
  const [idea, setIdea] = useState("");
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState("");
  const [planning, setPlanning] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [retrievedAt, setRetrievedAt] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  async function generatePlan(event) {
    event.preventDefault();
    if (idea.trim().length < 12) return;
    setPlanning(true);
    setPlanError("");
    setPlan(null);
    try {
      const response = await fetch("/api/projects/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim(), idea: idea.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the plan.");
      setPlan(data);
    } catch (error) {
      setPlanError(error.message);
    } finally {
      setPlanning(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const response = await fetch(`/api/components/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []);
      setTotal(data.totalMatches || 0);
      setRetrievedAt(data.retrievedAt || "");
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setSearching(false);
    }
  }

  const completedCount = useMemo(() => plan?.buildSteps?.length || 0, [plan]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">C</span> CircuitCraft</a>
        <div className="topbar-right"><span className="status-dot" /> HARDWARE PROJECT WORKSPACE</div>
      </header>

      <section className="hero">
        <div className="eyebrow">FROM IDEA TO BUILD PLAN</div>
        <h1>Your next hardware idea,<br /><span.engineering>engineered step by step.</span></h1>
        <p>Turn a rough electronics idea into a clear starting plan, component list and build sequence.</p>
      </section>

      <nav className="tabs" aria-label="Workspace sections">
        <button className={tab === "planner" ? "tab active" : "tab"} onClick={() => setTab("planner")}>Project planner</button>
        <button className={tab === "parts" ? "tab active" : "tab"} onClick={() => setTab("parts")}>Component finder</button>
      </nav>

      {tab === "planner" ? (
        <section className="workspace">
          <div className="planner-panel">
            <div className="panel-kicker">01 / PROJECT BRIEF</div>
            <h2>What do you want to build?</h2>
            <p className="muted">Describe what it should do. You can start simple — CircuitCraft will organize the first draft.</p>
            <form onSubmit={generatePlan}>
              <label htmlFor="project-name">Project name <span className="optional">OPTIONAL</span></label>
              <input id="project-name" className="text-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Smart Garden Buddy" maxLength={100} />
              <label htmlFor="project-idea">Your idea</label>
              <textarea id="project-idea" value={idea} onChange={e => setIdea(e.target.value)} placeholder="I want to build a system that checks soil moisture and automatically waters my plant when the soil gets dry..." rows={6} maxLength={2000} />
              <div className="form-bottom"><span>{idea.length}/2000 characters</span><button className="primary-button" disabled={planning || idea.trim().length < 12}>{planning ? "Creating plan…" : "Generate build plan →"}</button></div>
            </form>
            {planError && <div className="notice error">{planError}</div>}
            <div className="examples"><span className="examples-title">NEED A STARTING POINT?</span>{examples.map(example => <button key={example} onClick={() => setIdea(example)}>{example} ↗</button>)}</div>
          </div>

          <aside className="how-panel">
            <div className="panel-kicker">HOW CIRCUITCRAFT HELPS</div>
            <h3>One workspace.<br />A clearer build.</h3>
            <div className="workflow">
              <div className="workflow-item"><span>01</span><div><strong>Understand the idea</strong><p>Identify the main functions and likely subsystems.</p></div></div>
              <div className="workflow-item"><span>02</span><div><strong>Draft a component list</strong><p>Get a first-pass bill of materials to research.</p></div></div>
              <div className="workflow-item"><span>03</span><div><strong>Plan the build</strong><p>Follow a practical sequence and verify connections.</p></div></div>
            </div>
            <div className="prototype-note"><strong>Prototype mode</strong><p>This first planner uses transparent starter rules. It is not yet an AI-validated circuit design.</p></div>
          </aside>

          {plan && <section className="plan-results">
            <div className="plan-heading"><div><div className="panel-kicker">02 / YOUR FIRST DRAFT</div><h2>{plan.name || "Untitled project"}</h2><p className="muted">{plan.summary}</p></div><span className="draft-tag">STARTER PLAN</span></div>
            <div className="plan-grid">
              <article className="result-panel"><h3>Key requirements</h3><ul>{plan.requirements.map((item, i) => <li key={i}>{item}</li>)}</ul></article>
              <article className="result-panel"><h3>Suggested components</h3><div className="bom-list">{plan.bom.map((item, i) => <div className="bom-row" key={i}><div><strong>{item.name}</strong><span>{item.reason}</span></div><b>× {item.quantity}</b></div>)}</div></article>
              <article className="result-panel build-panel"><h3>Suggested build sequence <span>{completedCount} steps</span></h3><ol>{plan.buildSteps.map((step, i) => <li key={i}>{step}</li>)}</ol></article>
            </div>
            <p className="safety-note">Before powering hardware, verify voltage levels, current limits, pinouts and component datasheets. This draft does not replace circuit review.</p>
          </section>}
        </section>
      ) : (
        <section className="parts-workspace">
          <div className="panel-kicker">COMPONENT INTELLIGENCE</div>
          <h2>Find a part for your build.</h2>
          <p className="muted">Search Nexar / Octopart by manufacturer part number or keyword.</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. ESP32-WROOM-32, LM358" aria-label="Component search" />
            <button className="primary-button" disabled={searching || query.trim().length < 2}>{searching ? "Searching…" : "Search parts"}</button>
          </form>
          {searchError && <div className="notice error">{searchError}</div>}
          {searching && <p className="muted">Searching Nexar / Octopart…</p>}
          {!searching && results.length === 0 && !searchError && <div className="empty-state">Search for a part to see matching manufacturer components here.</div>}
          {results.length > 0 && <div className="part-results"><div className="results-meta">{total.toLocaleString()} matches · Retrieved {retrievedAt ? new Date(retrievedAt).toLocaleString() : "just now"}</div>{results.map((part, index) => <article className="part-card" key={part.manufacturerPartNumber + index}><div><strong>{part.manufacturerPartNumber}</strong><span>{part.manufacturer || "Manufacturer not listed"}</span></div><span className="source-pill">NEXAR</span></article>)}<p className="safety-note">Availability and pricing can change. Verify current stock, price and datasheet before purchasing or designing around a part.</p></div>}
        </section>
      )}
      <footer>CIRCUITCRAFT <span>·</span> PLAN IT. VERIFY IT. BUILD IT.</footer>
    </main>
  );
}
