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
    <main className="container">
      <h1>FlowFix</h1>
      <p className="subtitle">AI-powered DevOps incident diagnosis tool</p>

      <label htmlFor="incident-json" className="label">
        Mock Incident JSON
      </label>
      <textarea
        id="incident-json"
        className="textarea"
        value={incidentText}
        onChange={(e) => setIncidentText(e.target.value)}
      />

      <button className="button" onClick={handleDiagnose} disabled={loading}>
        {loading ? 'Diagnosing...' : 'Diagnose Incident'}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="resultCard">
          <h2>Diagnosis Result</h2>
          <p>
            <strong>incident_type:</strong> {result.incident_type}
          </p>
          <p>
            <strong>severity:</strong> {result.severity}
          </p>
          <p>
            <strong>confidence:</strong> {result.confidence}
          </p>
          <p>
            <strong>root_cause:</strong> {result.root_cause}
          </p>
          <div>
            <strong>recommended_actions:</strong>
            <ul>
              {Array.isArray(result.recommended_actions) && result.recommended_actions.length > 0 ? (
                result.recommended_actions.map((action, index) => <li key={index}>{action}</li>)
              ) : (
                <li>No recommendations provided</li>
              )}
            </ul>
          </div>
          <p>
            <strong>requires_human_approval:</strong> {String(result.requires_human_approval)}
          </p>
        </section>
      )}
    </main>
  );
}

export default App;
