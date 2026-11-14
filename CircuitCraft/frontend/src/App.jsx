import { useMemo, useState } from "react";
import DemoProject from "./DemoProject.jsx";

const examples = [
  "Build a smart plant watering system with soil moisture sensing",
  "Make an obstacle avoiding robot using an ultrasonic sensor",
  "Create a temperature and humidity monitor with an OLED display"
];

function CircuitBoardArt() {
  return (
    <div className="board-art" aria-hidden="true">
      <svg className="circuit-lines" viewBox="0 0 560 250" fill="none">
        <path d="M0 80H115L150 45H250M0 150H85L125 190H245M340 30H420L460 70H560M350 210H430L470 170H560" />
        <path d="M35 115H105L140 80H190M390 120H465L500 85H560" />
        <circle cx="115" cy="80" r="5"/><circle cx="245" cy="45" r="5"/><circle cx="85" cy="150" r="5"/><circle cx="245" cy="190" r="5"/><circle cx="460" cy="70" r="5"/><circle cx="470" cy="170" r="5"/>
      </svg>
      <div className="dev-board">
        <div className="board-usb" />
        <div className="board-chip"><small>ESP</small><b>32</b></div>
        <div className="board-chip-small" />
        <div className="board-antenna" />
        <div className="board-pins">{Array.from({length: 12}, (_, i) => <i key={i} />)}</div>
        <div className="board-pins lower">{Array.from({length: 12}, (_, i) => <i key={i} />)}</div>
        <span className="board-label">DEVKIT V1</span>
      </div>
    </div>
  );
}

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
    setPlanning(true); setPlanError(""); setPlan(null);
    try {
      const response = await fetch("/api/projects/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName.trim(), idea: idea.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the plan.");
      setPlan(data);
    } catch (error) { setPlanError(error.message); }
    finally { setPlanning(false); }
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true); setSearchError(""); setResults([]);
    try {
      const response = await fetch(`/api/components/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []); setTotal(data.totalMatches || 0); setRetrievedAt(data.retrievedAt || "");
    } catch (error) { setSearchError(error.message); }
    finally { setSearching(false); }
  }

  const completedCount = useMemo(() => plan?.buildSteps?.length || 0, [plan]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={() => setTab("planner")}>
          <span className="brand-mark"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M25 5H13L6 12v12l7 7h12M14 11h10M11 18h13M14 25h10" /><circle cx="27" cy="5" r="2"/><circle cx="27" cy="31" r="2"/></svg></span>
          <span>Circuit<span className="brand-accent">Craft</span></span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={tab === "planner" ? "nav-link selected" : "nav-link"} onClick={() => setTab("planner")}><span>⌂</span> Workspace</button>
          <button className={tab === "parts" ? "nav-link selected" : "nav-link"} onClick={() => setTab("parts")}><span>▦</span> Components</button>
          <button className={tab === "builds" || tab === "demo" ? "nav-link selected" : "nav-link"} onClick={() => setTab("builds")}><span>▱</span> My Builds</button>
        </nav>
        <div className="profile-dot">C</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> ELECTRONICS PROJECT WORKSPACE</div>
          <h1>From idea to<br />working <span>hardware.</span></h1>
          <p>Plan, select components and build your next electronics project with CircuitCraft.</p>
        </div>
        <CircuitBoardArt />
      </section>

      {tab === "planner" && <>
        <section className="workspace">
          <div className="planner-panel">
            <div className="panel-heading">
              <span className="panel-icon">ϟ</span>
              <div><h2>Start a new project</h2><p>Describe your idea and get a structured build plan.</p></div>
            </div>
            <form onSubmit={generatePlan}>
              <label htmlFor="project-name">Project name <span className="optional">(optional)</span></label>
              <input id="project-name" className="text-input" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g. Smart Garden Buddy" maxLength={100} />
              <label htmlFor="project-idea">Your idea</label>
              <textarea id="project-idea" value={idea} onChange={e => setIdea(e.target.value)} placeholder="Describe what you want to build, its purpose and key functions..." rows={4} maxLength={2000} />
              <div className="form-bottom">
                <div className="examples-inline"><span>Try an example:</span>
                  <button type="button" onClick={() => setIdea(examples[0])}>♧ Auto Plant Watering</button>
                  <button type="button" onClick={() => setIdea(examples[1])}>⌁ Obstacle Rover</button>
                  <button type="button" onClick={() => setIdea(examples[2])}>◉ IoT Weather Station</button>
                </div>
                <button className="primary-button" disabled={planning || idea.trim().length < 12}>{planning ? "Creating plan…" : "Generate build plan →"}</button>
              </div>
            </form>
            {planError && <div className="notice error">{planError}</div>}
          </div>

          <aside className="how-panel">
            <h2><span className="stack-icon">▰</span> How it works</h2>
            <div className="workflow">
              <div className="workflow-item"><span className="workflow-icon">↗</span><div><strong>Describe</strong><p>Tell us your project idea and goal.</p></div></div>
              <div className="workflow-item"><span className="workflow-icon">▦</span><div><strong>Choose parts</strong><p>Get a suitable component list (BOM).</p></div></div>
              <div className="workflow-item"><span className="workflow-icon">▶</span><div><strong>Build</strong><p>Follow a clear build plan with connections and next steps.</p></div></div>
            </div>
          </aside>
        </section>

        <section className="capabilities"><span className="cap-label">Capabilities</span><div><b>▤</b> BOM</div><div><b>⌖</b> Pin mapping</div><div><b>ϟ</b> Power checks</div><div><b>‹ ›</b> Firmware</div><div><b>⚒</b> Troubleshooting</div></section>

        {plan && <section className="plan-results">
          <div className="plan-heading"><div><div className="panel-kicker">YOUR FIRST DRAFT</div><h2>{plan.name || "Untitled project"}</h2><p className="muted">{plan.summary}</p></div><span className="draft-tag">STARTER PLAN</span></div>
          <div className="plan-grid">
            <article className="result-panel"><h3>Key requirements</h3><ul>{plan.requirements.map((item, i) => <li key={i}>{item}</li>)}</ul></article>
            <article className="result-panel"><h3>Suggested components</h3><div className="bom-list">{plan.bom.map((item, i) => <div className="bom-row" key={i}><div><strong>{item.name}</strong><span>{item.reason}</span></div><b>× {item.quantity}</b></div>)}</div></article>
            <article className="result-panel build-panel"><h3>Suggested build sequence <span>{completedCount} steps</span></h3><ol>{plan.buildSteps.map((step, i) => <li key={i}>{step}</li>)}</ol></article>
          </div>
          <p className="safety-note">Before powering hardware, verify voltage levels, current limits, pinouts and component datasheets. This draft does not replace circuit review.</p>
        </section>}
      </>}

      {tab === "parts" && <section className="parts-workspace">
        <div className="panel-kicker">COMPONENT INTELLIGENCE</div><h2>Find a part for your build.</h2>
        <p className="muted">Search Nexar / Octopart by manufacturer part number or keyword.</p>
        <form className="search-form" onSubmit={handleSearch}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. ESP32-WROOM-32, LM358" aria-label="Component search" />
          <button className="primary-button" disabled={searching || query.trim().length < 2}>{searching ? "Searching…" : "Search parts"}</button>
        </form>
        {searchError && <div className="notice error">{searchError}</div>}
        {searching && <p className="muted">Searching Nexar / Octopart…</p>}
        {!searching && results.length === 0 && !searchError && <div className="empty-state">Search for a part to see matching manufacturer components here.</div>}
        {results.length > 0 && <div className="part-results"><div className="results-meta">{total.toLocaleString()} matches · Retrieved {retrievedAt ? new Date(retrievedAt).toLocaleString() : "just now"}</div>{results.map((part, index) => <article className="part-card" key={part.manufacturerPartNumber + index}><div><strong>{part.manufacturerPartNumber}</strong><span>{part.manufacturer || "Manufacturer not listed"}</span></div><span className="source-pill">NEXAR</span></article>)}<p className="safety-note">Availability and pricing can change. Verify current stock, price and datasheet before purchasing or designing around a part.</p></div>}
      </section>}

      {tab === "builds" && <section className="parts-workspace builds-empty"><div className="panel-kicker">YOUR WORKSPACE · DEMO BUILD</div><h2>See a complete project, start to finish.</h2><p className="muted">Explore a worked example of CircuitCraft turning an idea into a prototype: mechanism, components, wiring map, firmware logic, assembly and testing.</p><article className="demo-launch-card"><div><span className="source-pill">GUIDED DEMO</span><h3>Automatic Pani Puri Plate Dispenser</h3><p>Detect a customer, slide one plate to the pickup point, confirm pickup and reset for the next customer.</p><div className="demo-tags"><span>ESP32</span><span>Motorized tray</span><span>Sensor feedback</span><span>Prototype V1</span></div></div><button className="primary-button" onClick={() => setTab("demo")}>Open full project →</button></article><button className="text-action" onClick={() => setTab("planner")}>← Create my own project</button></section>}
      {tab === "demo" && <DemoProject onBack={() => setTab("builds")} />}

      <footer><span className="footer-mark">C</span> CIRCUITCRAFT <i /> PLAN IT. VERIFY IT. BUILD IT.</footer>
    </main>
  );
}
