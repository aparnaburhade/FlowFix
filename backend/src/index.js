const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/diagnose', (req, res) => {
  const requiredFields = [
    'event_id',
    'source',
    'event_type',
    'service',
    'environment',
    'timestamp',
    'error_summary',
    'log_excerpt'
  ];

  const payload = req.body || {};

  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing_fields: missingFields,
      required_fields: requiredFields
    });
  }

  const searchText = `${payload.error_summary} ${payload.log_excerpt}`.toLowerCase();

  let incident_type = 'unknown_failure';
  let severity = 'medium';
  let confidence = 0.55;
  let root_cause = 'Unknown failure pattern from current placeholder rules.';
  let recommended_actions = [
    'Review recent deploys and logs for the affected service.',
    'Add additional rule coverage for this failure pattern.'
  ];

  if (
    searchText.includes('missing env variable') ||
    searchText.includes('undefined database_url')
  ) {
    incident_type = 'configuration_error';
    severity = 'high';
    confidence = 0.9;
    root_cause = 'Service configuration is missing required environment variables.';
    recommended_actions = [
      'Set required environment variables (for example DATABASE_URL).',
      'Validate runtime configuration during startup.'
    ];
  } else if (searchText.includes('timeout') || searchText.includes('etimedout')) {
    incident_type = 'dependency_timeout';
    severity = 'high';
    confidence = 0.85;
    root_cause = 'A downstream dependency timed out while handling requests.';
    recommended_actions = [
      'Check dependency health and network connectivity.',
      'Increase timeout/retry settings where appropriate.'
    ];
  } else if (searchText.includes('permission denied') || searchText.includes('eacces')) {
    incident_type = 'permission_error';
    severity = 'medium';
    confidence = 0.88;
    root_cause = 'The service lacks required file, system, or resource permissions.';
    recommended_actions = [
      'Review IAM/role or filesystem permissions for the service.',
      'Apply least-privilege updates and re-test access.'
    ];
  }

  return res.json({
    incident_type,
    severity,
    confidence,
    root_cause,
    recommended_actions,
    requires_human_approval: true
  });
});

app.listen(PORT, () => {
  console.log(`FlowFix backend listening on port ${PORT}`);
});
