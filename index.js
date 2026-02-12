const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

function generateMockMetrics() {
  // generate 12 months sample data
  const labels = [];
  const values = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    values.push(Math.round(200 + Math.random() * 800));
  }

  return {
    kpis: {
      users: 12456,
      revenue: 98765.43,
      churn: 2.4
    },
    timeseries: {
      labels,
      values
    },
    updatedAt: new Date().toISOString()
  };
}

app.get('/api/metrics', (req, res) => {
  const data = generateMockMetrics();
  res.json(data);
});

// Serve frontend build in production (optional)
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});