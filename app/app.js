// Leonida Legend — offline GTA VI trophy guide and tracker.
// Loads app/data/trophies.json (a local file only), renders the checklist,
// saves earned trophies in localStorage, and exports/imports progress as JSON.

const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';
const DATA_URL = 'data/trophies.json';

const trophyGrid = document.getElementById('trophyGrid');
const searchInput = document.getElementById('search');
const kindFilter = document.getElementById('kindFilter');
const earnedFilter = document.getElementById('earnedFilter');
const missableOnly = document.getElementById('missableOnly');
const spoilerToggle = document.getElementById('spoilerToggle');
const resultCount = document.getElementById('resultCount');
const emptyNote = document.getElementById('emptyNote');
const statusLine = document.getElementById('statusLine');
const detailPane = document.getElementById('detailPane');
const detailBody = document.getElementById('detailBody');
const detailScrim = document.getElementById('detailScrim');

let trophyData = [];
let earned = new Set(loadProgress());
let activeGrade = 'all';
let spoilersHidden = loadSpoilerSetting();

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((name) => typeof name === 'string') : [];
  } catch {
    return [];
  }
}

function loadSpoilerSetting() {
  try {
    const raw = localStorage.getItem(SPOILER_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
  } catch {
    showStatus('Could not save progress in this browser.');
  }
}

function saveSpoilerSetting() {
  try {
    localStorage.setItem(SPOILER_KEY, String(spoilersHidden));
  } catch {
    // Spoiler preference is best-effort; the checklist still works without it.
  }
}

function showStatus(message) {
  statusLine.textContent = message;
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => { statusLine.textContent = ''; }, 4000);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function isStorySpoiler(trophy) {
  return trophy.hidden && trophy.kind === 'story';
}

function displayName(trophy) {
  if (spoilersHidden && isStorySpoiler(trophy) && !earned.has(trophy.name)) {
    return 'Hidden story trophy';
  }
  return trophy.name;
}

function displayDescription(trophy) {
  if (spoilersHidden && isStorySpoiler(trophy) && !earned.has(trophy.name)) {
    return 'Earn this trophy in the story to reveal its name and description.';
  }
  return trophy.description;
}

function renderProgressSummary() {
  const total = trophyData.length;
  const count = earned.size;
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  document.getElementById('progressText').textContent = `${count} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze'].map((grade) => {
    const inGrade = trophyData.filter((t) => t.grade === grade).length;
    const got = trophyData.filter((t) => t.grade === grade && earned.has(t.name)).length;
    return `<li><b>${got}/${inGrade}</b> ${gradeLabel(grade)}</li>`;
  });
  document.getElementById('gradeCounts').innerHTML = byGrade.join('');
}

function trophyMatchesFilters(trophy) {
  if (activeGrade !== 'all' && trophy.grade !== activeGrade) return false;
  if (kindFilter.value !== 'all' && trophy.kind !== kindFilter.value) return false;
  if (earnedFilter.value === 'earned' && !earned.has(trophy.name)) return false;
  if (earnedFilter.value === 'unearned' && earned.has(trophy.name)) return false;
  if (missableOnly.checked && !trophy.missable) return false;
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind} ${trophy.grade}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function renderTrophyGrid() {
  const visible = trophyData.filter(trophyMatchesFilters);
  trophyGrid.replaceChildren();
  for (const trophy of visible) {
    const card = document.createElement('article');
    card.className = 'trophy-card' + (earned.has(trophy.name) ? ' earned' : '');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open guide for ${displayName(trophy)}`);

    const top = document.createElement('div');
    top.className = 'card-top';
    const badge = document.createElement('span');
    badge.className = `grade-badge grade-${trophy.grade}`;
    badge.textContent = gradeLabel(trophy.grade);
    const check = document.createElement('label');
    check.className = 'card-check';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.name);
      else earned.delete(trophy.name);
      saveProgress();
      renderProgressSummary();
      renderTrophyGrid();
    });
    check.append(box, document.createTextNode(earned.has(trophy.name) ? 'Earned' : 'Not earned'));
    top.append(badge, check);

    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = displayName(trophy);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy);

    const tags = document.createElement('div');
    tags.className = 'card-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag kind';
    kindTag.textContent = kindLabel(trophy.kind);
    tags.append(kindTag);
    if (trophy.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'Possibly missable';
      tags.append(missTag);
    }
    if (trophy.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'tag hidden-tag';
      hiddenTag.textContent = 'Hidden';
      tags.append(hiddenTag);
    }

    card.append(top, name, desc, tags);
    card.addEventListener('click', () => openTrophyDetail(trophy));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openTrophyDetail(trophy);
      }
    });
    trophyGrid.append(card);
  }
  resultCount.textContent = `Showing ${visible.length} of ${trophyData.length} trophies`;
  emptyNote.hidden = visible.length !== 0;
}

function openTrophyDetail(trophy) {
  const isEarned = earned.has(trophy.name);
  detailBody.replaceChildren();

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = gradeLabel(trophy.grade);

  const title = document.createElement('h2');
  title.textContent = trophy.name;

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = trophy.description;

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  for (const label of [kindLabel(trophy.kind), trophy.hidden ? 'Hidden on PSN' : 'Visible on PSN', isEarned ? 'Earned' : 'Not earned yet']) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = label;
    meta.append(tag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = 'Possibly missable';
    meta.append(missTag);
  }

  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guideText = document.createElement('div');
  guideText.className = 'guide-text';
  const guidePara = document.createElement('p');
  guidePara.textContent = trophy.guide.replace(/\s*Sources:.*$/, '');
  guideText.append(guidePara);

  detailBody.append(badge, title, desc, meta);
  if (trophy.missable) {
    const warn = document.createElement('div');
    warn.className = 'detail-warn';
    warn.innerHTML = '<strong>Missable warning.</strong> This is the one trophy reported as possibly missable. Do Lucia&rsquo;s balcony meditation in Chapter 1 and keep a manual save from the start of that chapter.';
    detailBody.append(warn);
  }
  detailBody.append(guideHeading, guideText);

  const sourcesBlock = document.createElement('div');
  sourcesBlock.className = 'detail-sources';
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources for this guide';
  sourcesBlock.append(sourcesHeading);
  for (const source of trophy.sources || []) {
    const chip = document.createElement('span');
    chip.className = 'source-chip';
    chip.textContent = source;
    sourcesBlock.append(chip);
  }
  const sourcesNote = document.createElement('p');
  sourcesNote.className = 'fineprint';
  sourcesNote.textContent = 'Guide text is original writing for this entry. Names, descriptions and grades are the official ones; facts are drawn from the sources named above.';
  sourcesBlock.append(sourcesNote);
  detailBody.append(sourcesBlock);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = isEarned ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (earned.has(trophy.name)) earned.delete(trophy.name);
    else earned.add(trophy.name);
    saveProgress();
    renderProgressSummary();
    renderTrophyGrid();
    openTrophyDetail(trophy);
  });
  detailBody.append(toggle);

  detailPane.hidden = false;
  detailScrim.hidden = false;
  document.getElementById('detailClose').focus();
}

function closeTrophyDetail() {
  detailPane.hidden = true;
  detailScrim.hidden = true;
}

function showView(view) {
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === `view-${view}`);
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}

function renderRoadmap() {
  const stages = [
    {
      title: 'Play the story, and mind Chapter 1',
      count: '12 story trophies',
      text: 'Finish Chapters 1 to 4 and the named missions: Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory and the final mission. Before Chapter 1 ends, do Lucia\u2019s balcony meditation at Jason\u2019s house. Keep a manual save at the start of every chapter.',
    },
    {
      title: 'Strangers and side missions',
      count: '7 stranger trophies + the Silver for 8 strands',
      text: 'Complete the stranger strands for Andy, Kenton, Billy, Randy and Tyrone, plus Bret\u2019s hunt, until 8 strands are done for Strangers & Freaks. Stranger missions stay open in free roam, so finish any that are left after the story.',
    },
    {
      title: 'Activities and challenges',
      count: 'Shooting Range, races, stunts, bowling, fishing, arcade',
      text: 'Gold-medal all 42 Shooting Range challenges, win 20 different races and a Top Fun drone race at every location, beat Cal at fishing, finish an arcade game, play bowling, and build toward 250 stunts and 50 challenges. Try every activity type once for Master of None.',
    },
    {
      title: 'Collectibles and exploration',
      count: 'Cards, WAiNK, vehicles, meditation, garages',
      text: 'Complete 3 card sets, WAiNK It at 100 locations, discover 100 vehicles, meditate at every spot, explore all of Leonida, register 10 vehicles to Scooter Bros and buy every garage property. The exact card and meditation-spot locations are not yet fully mapped, so follow the in-game Collections tracker.',
    },
    {
      title: 'Robberies, money and mayhem',
      count: 'Vaults, trucks, shops, gangs, wanted levels',
      text: 'Rob 5 bank vaults, an armored truck and 3 shops back-to-back with your partner, rob an illegal operation of each gang, lose a 4-star wanted level with your partner, launder $250,000 of Marked Bills and spend $100,000 in shops. Use Combat Focus to take down 5 enemies in one use.',
    },
    {
      title: 'Cleanup: 100% and the Platinum',
      count: 'A Long Road, then Vice Got a Price!',
      text: 'After the story, work the in-game 100% checklist in the Progress menu until A Long Road pops, then mop up any trophies left behind. When the 54 others are earned, the Platinum, Vice Got a Price!, unlocks. Expect about 200 hours in total.',
    },
  ];
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  for (const stage of stages) {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = stage.count;
    const body = document.createElement('p');
    body.textContent = stage.text;
    item.append(heading, count, body);
    list.append(item);
  }
}

function renderMissables() {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  const missable = trophyData.filter((t) => t.missable);
  for (const trophy of missable) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = `${trophy.name} — ${gradeLabel(trophy.grade)}`;
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Possibly missable. Lucia\u2019s balcony meditation in Chapter 1 counts toward this trophy and disappears after that chapter.';
    const body = document.createElement('p');
    body.textContent = trophy.guide.replace(/\s*Sources:.*$/, '');
    const open = document.createElement('button');
    open.type = 'button';
    open.textContent = 'Open full guide';
    open.addEventListener('click', () => openTrophyDetail(trophy));
    card.append(heading, warn, body, open);
    list.append(card);
  }
  const safe = document.createElement('p');
  safe.className = 'lede';
  safe.textContent = `The other ${trophyData.length - missable.length} trophies are not reported as missable: they can all be earned in free roam after the story, since there is no mission replay and no New Game Plus to fall back on.`;
  list.append(safe);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned] }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  showStatus(`Exported ${earned.size} earned trophies.`);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('bad file');
    const known = new Set(trophyData.map((t) => t.name));
    const imported = names.filter((name) => typeof name === 'string' && known.has(name));
    earned = new Set(imported);
    saveProgress();
    renderProgressSummary();
    renderTrophyGrid();
    showStatus(`Imported ${imported.length} earned trophies.`);
  } catch {
    showStatus('That file could not be imported. It should be a progress JSON file from this guide.');
  }
}

function applyHashRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('trophy-')) {
    const id = Number(hash.slice('trophy-'.length));
    const trophy = trophyData.find((t) => t.id === id);
    if (trophy) {
      showView('checklist');
      openTrophyDetail(trophy);
      return;
    }
  }
  closeTrophyDetail();
  const view = ['checklist', 'roadmap', 'missables', 'about'].includes(hash) ? hash : 'checklist';
  showView(view);
}

async function loadTrophyData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
  const doc = await response.json();
  trophyData = doc.trophies || doc;
}

function wireControls() {
  document.getElementById('gradeChips').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-grade]');
    if (!chip) return;
    activeGrade = chip.dataset.grade;
    for (const button of document.querySelectorAll('#gradeChips .chip')) {
      button.classList.toggle('active', button === chip);
    }
    renderTrophyGrid();
  });
  searchInput.addEventListener('input', renderTrophyGrid);
  kindFilter.addEventListener('change', renderTrophyGrid);
  earnedFilter.addEventListener('change', renderTrophyGrid);
  missableOnly.addEventListener('change', renderTrophyGrid);
  spoilerToggle.checked = spoilersHidden;
  spoilerToggle.addEventListener('change', () => {
    spoilersHidden = spoilerToggle.checked;
    saveSpoilerSetting();
    renderTrophyGrid();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (event) => {
    importProgress(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    earned = new Set();
    saveProgress();
    renderProgressSummary();
    renderTrophyGrid();
    showStatus('Checklist reset.');
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      closeTrophyDetail();
      showView(tab.dataset.view);
      window.location.hash = tab.dataset.view;
    });
  });
  document.getElementById('detailClose').addEventListener('click', closeTrophyDetail);
  detailScrim.addEventListener('click', closeTrophyDetail);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeTrophyDetail();
  });
  window.addEventListener('hashchange', applyHashRoute);
}

try {
  await loadTrophyData();
  wireControls();
  renderRoadmap();
  renderMissables();
  renderProgressSummary();
  renderTrophyGrid();
  applyHashRoute();
} catch (error) {
  trophyGrid.replaceChildren();
  const note = document.createElement('p');
  note.className = 'empty-note';
  note.textContent = 'The trophy list could not be loaded. Open this guide from its own folder over HTTP (for example, node serve.ts) so data/trophies.json can load.';
  trophyGrid.append(note);
  emptyNote.hidden = true;
}
