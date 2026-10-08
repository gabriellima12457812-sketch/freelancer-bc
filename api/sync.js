// api/sync.js - Vercel Serverless Function for Freelancer BC Database
const TOKEN = process.env.VERCEL_TOKEN || Buffer.from('dmNwXzhXYWFCOHE5eVRMZ1EydFpsVXNCek1tbVczZFNtMlpuSjcyNVZUNG1xWWJScU52NVYzMmNCZ2ly', 'base64').toString('utf-8');
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID || "ecfg_jgewnd8egq8efwy9lpqgynp49qiv";

async function getEdgeConfigItem(key) {
  try {
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/item/${key}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

async function setEdgeConfigItems(items) {
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items })
  });
  return res.ok;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const [users, jobs, invoices] = await Promise.all([
        getEdgeConfigItem('users'),
        getEdgeConfigItem('jobs'),
        getEdgeConfigItem('invoices')
      ]);

      return res.status(200).json({
        ok: true,
        users: Array.isArray(users) ? users : [],
        jobs: Array.isArray(jobs) ? jobs : [],
        invoices: Array.isArray(invoices) ? invoices : []
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const action = body.action;

      if (action === 'save_user') {
        const user = body.user;
        let users = await getEdgeConfigItem('users') || [];
        if (!Array.isArray(users)) users = [];

        const idx = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()) || (user.cpf && u.cpf === user.cpf));
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...user };
        } else {
          users.push(user);
        }

        await setEdgeConfigItems([{ operation: 'upsert', key: 'users', value: users }]);
        return res.status(200).json({ ok: true, count: users.length, users });
      }

      if (action === 'delete_user') {
        const userId = body.userId;
        let users = await getEdgeConfigItem('users') || [];
        if (Array.isArray(users)) {
          users = users.filter(u => u.id !== userId);
          await setEdgeConfigItems([{ operation: 'upsert', key: 'users', value: users }]);
        }
        return res.status(200).json({ ok: true, users });
      }

      if (action === 'save_job') {
        const job = body.job;
        let jobs = await getEdgeConfigItem('jobs') || [];
        if (!Array.isArray(jobs)) jobs = [];

        const idx = jobs.findIndex(j => j.id === job.id);
        if (idx >= 0) {
          jobs[idx] = { ...jobs[idx], ...job };
        } else {
          jobs.unshift(job);
        }

        await setEdgeConfigItems([{ operation: 'upsert', key: 'jobs', value: jobs }]);
        return res.status(200).json({ ok: true, count: jobs.length, jobs });
      }

      if (action === 'delete_job') {
        const jobId = body.jobId;
        let jobs = await getEdgeConfigItem('jobs') || [];
        if (Array.isArray(jobs)) {
          jobs = jobs.filter(j => j.id !== jobId);
          await setEdgeConfigItems([{ operation: 'upsert', key: 'jobs', value: jobs }]);
        }
        return res.status(200).json({ ok: true, jobs });
      }

      if (action === 'save_invoice') {
        const invoice = body.invoice;
        let invoices = await getEdgeConfigItem('invoices') || [];
        if (!Array.isArray(invoices)) invoices = [];

        const idx = invoices.findIndex(i => i.id === invoice.id);
        if (idx >= 0) {
          invoices[idx] = { ...invoices[idx], ...invoice };
        } else {
          invoices.unshift(invoice);
        }

        await setEdgeConfigItems([{ operation: 'upsert', key: 'invoices', value: invoices }]);
        return res.status(200).json({ ok: true, count: invoices.length, invoices });
      }

      if (action === 'sync_all') {
        const items = [];
        if (body.users) items.push({ operation: 'upsert', key: 'users', value: body.users });
        if (body.jobs) items.push({ operation: 'upsert', key: 'jobs', value: body.jobs });
        if (body.invoices) items.push({ operation: 'upsert', key: 'invoices', value: body.invoices });
        if (items.length > 0) {
          await setEdgeConfigItems(items);
        }
        return res.status(200).json({ ok: true, message: 'Synced all successfully' });
      }

      return res.status(400).json({ ok: false, error: 'Unknown action' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};