import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [retrievedAt, setRetrievedAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    setError("");
    setResults([]);
    try {
      const response = await fetch(`/api/components/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setResults(data.results || []);
      setTotal(data.totalMatches || 0);
      setRetrievedAt(data.retrievedAt || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark">C</span> CircuitCraft</a>
        <span className="top-tag">BUILD SMARTER · BUILD BETTER</span>
      </header>

      <section className="hero">
        <div className="eyebrow">COMPONENT INTELLIGENCE</div>
        <h1>Find the right part<br /><span>for your next build.</span></h1>
        <p>Search electronic components using Nexar's Octopart supply database.</p>

        <form className="search-form" onSubmit={handleSearch}>
          <span className="search-icon">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by part number, e.g. LM358"
            aria-label="Component part number"
          />
          <button disabled={loading || query.trim().length < 2}>
            {loading ? "Searching…" : "Search parts"}
          </button>
        </form>
        <div className="search-hint">Try: LM358 · ESP32-WROOM-32 · ATmega328P</div>
      </section>

      <section className="results-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">PART DISCOVERY</div>
            <h2>Component results</h2>
          </div>
          {retrievedAt && <span className="result-count">{total.toLocaleString()} matches found</span>}
        </div>

        {error && <div className="notice error">{error}</div>}
        {!error && results.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">⌁</div>
            <strong>Your component search starts here</strong>
            <span>Enter a manufacturer part number above to explore matching components.</span>
          </div>
        )}
        {loading && <div className="empty-state"><span className="spinner" />Searching Nexar / Octopart…</div>}

        {results.length > 0 && (
          <>
            <div className="result-list">
              {results.map((part, index) => (
                <article className="part-card" key={`${part.manufacturerPartNumber}-${index}`}>
                  <div className="part-symbol">⌘</div>
                  <div className="part-info">
                    <strong>{part.manufacturerPartNumber}</strong>
                    <span>{part.manufacturer}</span>
                  </div>
                  <span className="source-pill">NEXAR</span>
                </article>
              ))}
            </div>
            <p className="timestamp">Data retrieved {new Date(retrievedAt).toLocaleString()} · Verify stock and pricing before purchasing.</p>
          </>
        )}
      </section>

      <footer> CIRCUITCRAFT <span>·</span> YOUR ELECTRONICS PROJECT, ENGINEERED WITH CLARITY</footer>
    </main>
  );
}
