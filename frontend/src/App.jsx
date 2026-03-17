import { useState } from 'react';
import './App.css';

const sampleIncident = {
  event_id: 'evt-1001',
  source: 'deploy-pipeline',
  event_type: 'deployment_failure',
  service: 'payments-api',
  environment: 'production',
  timestamp: '2026-03-17T10:24:00Z',
  error_summary: 'Deployment failed: Missing ENV variable DATABASE_URL',
  log_excerpt: 'Process exited with code 1. Error: undefined DATABASE_URL'
};

function App() {
  const [incidentText, setIncidentText] = useState(JSON.stringify(sampleIncident, null, 2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatIncidentType = (value) => {
    if (!value) {
      return 'Not available';
    }

    return value
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatConfidence = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 'N/A';
    }

    return `${Math.round(value * 100)}%`;
  };

  const severityBadgeClass = (value) => {
    const severity = String(value || '').toLowerCase();
    if (severity === 'critical') return 'badge badgeCritical';
    if (severity === 'high') return 'badge badgeHigh';
    if (severity === 'medium') return 'badge badgeMedium';
    if (severity === 'low') return 'badge badgeLow';
    return 'badge';
  };

  const handleDiagnose = async () => {
    setError('');
    setResult(null);

    let parsedIncident;
    try {
      parsedIncident = JSON.parse(incidentText);
    } catch (parseError) {
      setError('Invalid JSON. Please fix the incident payload and try again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedIncident)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Diagnosis request failed. Please try again.');
        return;
      }

      setResult(data);
    } catch (requestError) {
      setError('Unable to reach backend. Make sure backend is running on http://localhost:4000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <main className="container">
        <section className="hero">
          <div className="heroContent">
            <p className="eyebrow">AI-powered incident diagnosis</p>
            <h1>Fix workflow failures before they become outages.</h1>
            <p className="subtitle">
              FlowFix detects engineering workflow failures, identifies likely root causes, and suggests
              safe next actions for teams under pressure.
            </p>
            <div className="heroActions">
              <a className="button primary" href="#live-demo">
                Run Live Demo
              </a>
              <a className="button secondary" href="#features">
                Explore Features
              </a>
            </div>
          </div>

          <aside className="previewCard">
            <p className="previewLabel">Sample Diagnosis</p>
            <h3>Configuration Error</h3>
            <p className="previewText">Missing environment variable caused deployment failure.</p>
            <div className="previewMeta">
              <span className="badge badgeHigh">high severity</span>
              <span className="badge">90% confidence</span>
            </div>
            <ul>
              <li>Set required env values in deployment config.</li>
              <li>Validate startup configuration in CI.</li>
            </ul>
          </aside>
        </section>

        <section id="live-demo" className="demoSection">
          <div className="sectionHeading">
            <h2>Live Demo</h2>
            <p>Paste a mock incident payload and run diagnosis instantly.</p>
          </div>

          <div className="demoGrid">
            <article className="card">
              <label htmlFor="incident-json" className="label">
                Mock Incident JSON
              </label>
              <textarea
                id="incident-json"
                className="textarea"
                value={incidentText}
                onChange={(e) => setIncidentText(e.target.value)}
              />

              <button className="button primary" onClick={handleDiagnose} disabled={loading}>
                {loading ? 'Diagnosing...' : 'Diagnose Incident'}
              </button>

              {error && <p className="error">{error}</p>}
            </article>

            <article className="card resultCard">
              <h3>Diagnosis Result</h3>
              {result ? (
                <>
                  <div className="resultRow">
                    <span className="resultLabel">Incident Type</span>
                    <span className="resultValue">{formatIncidentType(result.incident_type)}</span>
                  </div>
                  <div className="resultRow">
                    <span className="resultLabel">Severity</span>
                    <span className={severityBadgeClass(result.severity)}>{result.severity}</span>
                  </div>
                  <div className="resultRow">
                    <span className="resultLabel">Confidence</span>
                    <span className="resultValue">{formatConfidence(result.confidence)}</span>
                  </div>
                  <div className="resultRow stack">
                    <span className="resultLabel">Root Cause</span>
                    <p className="resultText">{result.root_cause}</p>
                  </div>
                  <div className="resultRow stack">
                    <span className="resultLabel">Recommended Actions</span>
                    <ul className="actionsList">
                      {Array.isArray(result.recommended_actions) && result.recommended_actions.length > 0 ? (
                        result.recommended_actions.map((action, index) => <li key={index}>{action}</li>)
                      ) : (
                        <li>No recommendations provided.</li>
                      )}
                    </ul>
                  </div>
                  <div className="resultRow">
                    <span className="resultLabel">Approval Required</span>
                    <span className="badge">
                      {result.requires_human_approval ? 'Requires approval' : 'No approval needed'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="placeholder">
                  Submit an incident to see severity, confidence, root cause, and recommended actions.
                </p>
              )}
            </article>
          </div>
        </section>

        <section id="features" className="featuresSection">
          <h2>Why teams choose FlowFix</h2>
          <div className="featuresGrid">
            <article className="featureCard">
              <h3>Detect failures</h3>
              <p>Catch workflow incidents early from noisy operational events.</p>
            </article>
            <article className="featureCard">
              <h3>Diagnose root cause</h3>
              <p>Classify incidents quickly with clear, explainable diagnosis output.</p>
            </article>
            <article className="featureCard">
              <h3>Recommend safe action</h3>
              <p>Guide responders with practical next steps and human approval safeguards.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">© 2026 FlowFix • Hackathon Demo</footer>
    </div>
  );
}

export default App;
