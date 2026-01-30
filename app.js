// Simple dashboard UI logic with mock data and fetch placeholders.
// Replace fetchRepos/fetchRepoDetails with real backend calls (see notes).
const state = {
  repos: [],
  selectedRepo: null,
  user: { login: 'guest' },
};

const dom = {
  repoTableBody: document.querySelector('#repoTable tbody'),
  totalRepos: document.getElementById('totalRepos'),
  openIssues: document.getElementById('openIssues'),
  openPRs: document.getElementById('openPRs'),
  lastSync: document.getElementById('lastSync'),
  detailsTitle: document.getElementById('detailsTitle'),
  detailsBody: document.getElementById('detailsBody'),
  globalSearch: document.getElementById('globalSearch'),
  repoFilter: document.getElementById('repoFilter'),
  userLogin: document.getElementById('userLogin'),
  btnSync: document.getElementById('btnSync'),
  btnNewIssue: document.getElementById('btnNewIssue'),
  btnOpenInGithub: document.getElementById('btnOpenInGithub'),
  navItems: document.querySelectorAll('.nav-item'),
};

function mockData(){
  return [
    { id:1, name:'backend-github-manager', description:'Manager for GitHub backend tasks', stars:42, issues:6, prs:2, updated:'2026-01-25T10:32:00Z', url:'https://github.com/vidhidarji7778-afk/backend-github-manager', fork:false, starred:true },
    { id:2, name:'api-gateway', description:'API gateway for internal services', stars:18, issues:0, prs:1, updated:'2026-01-22T09:10:00Z', url:'#', fork:false, starred:false },
    { id:3, name:'automation-scripts', description:'CI scripts and helpers', stars:7, issues:3, prs:0, updated:'2026-01-20T15:02:00Z', url:'#', fork:true, starred:false },
  ];
}

// Fetch functions: replace these with actual backend fetches.
// Example backend endpoints your server could expose:
// GET /api/repos
// GET /api/repos/:name
async function fetchRepos(){
  // placeholder: simulate network
  await new Promise(r => setTimeout(r, 120));
  // To integrate with your backend, uncomment and adapt:
  // const res = await fetch('/api/repos', { headers: { Authorization: 'Bearer <TOKEN>' }});
  // return await res.json();
  return mockData();
}

async function fetchRepoDetails(repoName){
  await new Promise(r => setTimeout(r, 100));
  // Replace with backend call that returns issues/PRs/activity
  return {
    issues: [
      { id:101, title:'Bug: cannot sync tokens', state:'open', created_at:'2026-01-29T12:00:00Z' },
      { id:102, title:'Improve logs for webhook failures', state:'open', created_at:'2026-01-28T08:40:00Z' },
    ],
    prs: [
      { id:201, title:'feat: add actions UI', state:'open', created_at:'2026-01-26T09:30:00Z' }
    ],
    activity: [
      { type:'push', text:'CI: build passed on main', at:'2026-01-29T10:50:00Z' },
      { type:'issue', text:'New issue created', at:'2026-01-28T08:40:00Z' }
    ]
  };
}

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

function renderRepoTable(repos){
  dom.repoTableBody.innerHTML = '';
  repos.forEach(r => {
    const tr = document.createElement('tr');
    tr.dataset.repo = r.name;
    tr.innerHTML = `
      <td>
        <div style="font-weight:600">${r.name}</div>
        <div class="muted" style="font-size:12px">${r.description || ''}</div>
      </td>
      <td>${r.stars}</td>
      <td>${r.issues}</td>
      <td>${r.prs}</td>
      <td class="muted">${formatDate(r.updated)}</td>
    `;
    tr.addEventListener('click', () => selectRepo(r));
    dom.repoTableBody.appendChild(tr);
  });
}

async function selectRepo(repo){
  state.selectedRepo = repo;
  dom.detailsTitle.textContent = repo.name;
  dom.detailsBody.innerHTML = '<div class="muted">Loading details…</div>';
  try{
    const details = await fetchRepoDetails(repo.name);
    renderRepoDetails(repo, details);
  }catch(err){
    dom.detailsBody.innerHTML = `<div class="muted">Error: ${err.message}</div>`;
  }
}

function renderRepoDetails(repo, details){
  const issuesHtml = details.issues.length ? details.issues.map(i => `<li><strong>${i.title}</strong> <span class="muted">(${i.state})</span></li>`).join('') : '<li class="muted">No issues</li>';
  const prsHtml = details.prs.length ? details.prs.map(p => `<li><strong>${p.title}</strong> <span class="muted">(${p.state})</span></li>`).join('') : '<li class="muted">No PRs</li>';
  const activityHtml = details.activity.length ? details.activity.map(a => `<li class="muted">${formatDate(a.at)} — ${a.text}</li>`).join('') : '<li class="muted">No recent activity</li>';

  dom.detailsBody.innerHTML = `
    <p class="muted">${repo.description || ''}</p>
    <h4>Open issues</h4>
    <ul>${issuesHtml}</ul>
    <h4>Open PRs</h4>
    <ul>${prsHtml}</ul>
    <h4>Recent activity</h4>
    <ul>${activityHtml}</ul>
  `;

  dom.btnOpenInGithub.onclick = () => window.open(repo.url, '_blank');
  dom.btnNewIssue.onclick = () => openCreateIssue(repo);
}

function openCreateIssue(repo){
  const title = prompt(`New issue for ${repo.name} — title:`);
  if(!title) return;
  // Replace with API call to create issue:
  // await fetch(`/api/repos/${repo.name}/issues`, { method:'POST', body: JSON.stringify({title}), headers:{'Content-Type':'application/json'} })
  alert(`(Demo) would create issue "${title}" in ${repo.name}`);
}

function updateSummary(repos){
  const total = repos.length;
  const issues = repos.reduce((s,r) => s + (r.issues || 0), 0);
  const prs = repos.reduce((s,r) => s + (r.prs || 0), 0);
  dom.totalRepos.textContent = total;
  dom.openIssues.textContent = issues;
  dom.openPRs.textContent = prs;
  dom.lastSync.textContent = new Date().toLocaleString();
}

async function sync(){
  dom.btnSync.textContent = 'Syncing…';
  dom.btnSync.disabled = true;
  try{
    const repos = await fetchRepos();
    state.repos = repos;
    renderRepoTable(repos);
    updateSummary(repos);
  }catch(e){
    console.error(e);
    alert('Sync failed: ' + e.message);
  }finally{
    dom.btnSync.textContent = 'Sync';
    dom.btnSync.disabled = false;
  }
}

function wireFilters(){
  dom.globalSearch.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = state.repos.filter(r => r.name.toLowerCase().includes(q) || (r.description||'').toLowerCase().includes(q));
    renderRepoTable(filtered);
  });

  dom.repoFilter.addEventListener('change', () => {
    const val = dom.repoFilter.value;
    let filtered = state.repos;
    if(val === 'starred') filtered = filtered.filter(r => r.starred);
    if(val === 'forked') filtered = filtered.filter(r => r.fork);
    renderRepoTable(filtered);
  });

  dom.navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
      document.getElementById(view + 'View').classList.remove('hidden');
    });
  });

  dom.userLogin.textContent = state.user.login;
}

async function init(){
  wireFilters();
  await sync();
  // preselect first repo
  if(state.repos[0]) selectRepo(state.repos[0]);
}

document.addEventListener('DOMContentLoaded', init);