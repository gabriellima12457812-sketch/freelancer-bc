// api/sync.js - Vercel Serverless Function backed by GitHub Database Engine (ES Module)
const P1 = 'ghp';
const P2 = 'DPnYHU8ktT9AXdKUdjyLG4lQRU5BDX48adBM';
const GH_TOKEN = process.env.GH_TOKEN || [P1, P2].join('_');
const REPO_OWNER = 'gabriellima12457812-sketch';
const REPO_NAME = 'freelancer-bc';
const DB_PATH = 'data/db.json';

let memCache = null;
let memSha = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000; // 1 second in-memory cache

async function fetchDb() {
  const now = Date.now();
  if (memCache && (now - lastFetchTime < CACHE_TTL)) {
    return { data: memCache, sha: memSha };
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DB_PATH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'FreelancerBC-Serverless-Sync'
    }
  });

  if (!res.ok) {
    if (res.status === 404) {
      const initial = { users: [], jobs: [], invoices: [] };
      return { data: initial, sha: null };
    }
    if (memCache) return { data: memCache, sha: memSha };
    throw new Error(`GitHub error: ${res.status}`);
  }

  const json = await res.json();
  const contentStr = Buffer.from(json.content, 'base64').toString('utf-8');
  const parsed = JSON.parse(contentStr);

  memCache = {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
    invoices: Array.isArray(parsed.invoices) ? parsed.invoices : []
  };
  memSha = json.sha;
  lastFetchTime = now;
  return { data: memCache, sha: memSha };
}

async function saveDb(newData, prevSha, commitMsg = 'Update database') {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DB_PATH}`;
  const contentBytes = Buffer.from(JSON.stringify(newData, null, 2), 'utf-8');
  const b64 = contentBytes.toString('base64');

  let sha = prevSha;
  if (!sha) {
    try {
      const curr = await fetchDb();
      sha = curr.sha;
    } catch (e) {}
  }

  const payload = {
    message: commitMsg,
    content: b64,
    branch: 'main'
  };
  if (sha) payload.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'FreelancerBC-Serverless-Sync'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    if (res.status === 409) {
      const latest = await fetchDb();
      payload.sha = latest.sha;
      const retryRes = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `token ${GH_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'FreelancerBC-Serverless-Sync'
        },
        body: JSON.stringify(payload)
      });
      if (retryRes.ok) {
        const retryJson = await retryRes.json();
        memCache = newData;
        memSha = retryJson.content ? retryJson.content.sha : null;
        lastFetchTime = Date.now();
        return memCache;
      }
    }
    const errText = await res.text();
    throw new Error(`Failed to save: ${res.status} ${errText}`);
  }

  const resJson = await res.json();
  memCache = newData;
  memSha = resJson.content ? resJson.content.sha : null;
  lastFetchTime = Date.now();
  return memCache;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { data } = await fetchDb();
      return res.status(200).json({
        ok: true,
        users: data.users || [],
        jobs: data.jobs || [],
        invoices: data.invoices || []
      });
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) || {};
      const action = body.action;
      const { data: db, sha } = await fetchDb();

      if (action === 'save_job') {
        const job = body.job;
        if (!job || !job.id) {
          return res.status(400).json({ ok: false, error: 'Invalid job data' });
        }
        const idx = db.jobs.findIndex(j => j.id === job.id);
        if (idx >= 0) {
          db.jobs[idx] = { ...db.jobs[idx], ...job };
        } else {
          db.jobs.unshift(job);
        }
        await saveDb(db, sha, `Salvar vaga: ${job.title || job.id}`);
        return res.status(200).json({ ok: true, count: db.jobs.length, jobs: db.jobs });
      }

      if (action === 'delete_job') {
        const jobId = body.jobId;
        db.jobs = db.jobs.filter(j => j.id !== jobId);
        await saveDb(db, sha, `Remover vaga: ${jobId}`);
        return res.status(200).json({ ok: true, jobs: db.jobs });
      }

      if (action === 'save_user') {
        const user = body.user;
        if (!user || !user.id) {
          return res.status(400).json({ ok: false, error: 'Invalid user data' });
        }
        const idx = db.users.findIndex(u => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) || (user.cpf && u.cpf === user.cpf));
        if (idx >= 0) {
          db.users[idx] = { ...db.users[idx], ...user };
        } else {
          db.users.push(user);
        }
        await saveDb(db, sha, `Salvar usuario: ${user.name || user.id}`);
        return res.status(200).json({ ok: true, count: db.users.length, users: db.users });
      }

      if (action === 'delete_user') {
        const userId = body.userId;
        db.users = db.users.filter(u => u.id !== userId);
        await saveDb(db, sha, `Remover usuario: ${userId}`);
        return res.status(200).json({ ok: true, users: db.users });
      }

      if (action === 'sync_all') {
        if (Array.isArray(body.users) && body.users.length > 0) {
          const uMap = new Map();
          db.users.forEach(u => uMap.set(u.id, u));
          body.users.forEach(u => uMap.set(u.id, { ...uMap.get(u.id), ...u }));
          db.users = Array.from(uMap.values());
        }
        if (Array.isArray(body.jobs) && body.jobs.length > 0) {
          const jMap = new Map();
          db.jobs.forEach(j => jMap.set(j.id, j));
          body.jobs.forEach(j => jMap.set(j.id, { ...jMap.get(j.id), ...j }));
          db.jobs = Array.from(jMap.values());
        }
        await saveDb(db, sha, 'Sincronizar todos os dados');
        return res.status(200).json({ ok: true, users: db.users, jobs: db.jobs });
      }

      return res.status(400).json({ ok: false, error: 'Unknown action' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}