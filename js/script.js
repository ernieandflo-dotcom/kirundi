/* ═══════════════════════════════════════════
   IKIRUNDI — script.js
   ═══════════════════════════════════════════ */

// ─── DATA (populated after JSON load) ────────────────────────────────────────
let CATEGORIES = [];
let VOCAB      = {};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const I18N = {
  en: {
    tagline:         'Master the language of Burundi — one card at a time',
    stat_score:      'Score:',
    stat_streak:     'Best streak:',
    stat_learned:    'Learned:',
    label_category:  'Choose a category',
    label_cards:     'Number of cards',
    btn_select:      'Select a category to start →',
    btn_start:       '▶ Start learning →',
    flip_hint:       '👆 Tap the card to reveal the Kirundi word',
    btn_wrong:       '✗ Still learning',
    btn_correct:     '✓ Got it!',
    btn_retry:       '🔁 Study again',
    btn_home:        '← Back to home',
    btn_reintro_all: '🔄 Reintroduce all',
    btn_clear:       '🗑 Clear all',
    res_correct:     'CORRECT',
    res_learning:    'LEARNING',
    res_streak:      'BEST STREAK',
    card_tag_base:   'English',
    card_tag_ki:     'Kirundi',
    menu_study:      'Study',
    menu_home:       'Home',
    menu_learned:    'Learned Cards',
    menu_resources:  'Resources',
    menu_notes:      'Course Notes',
    menu_blog:       'Blog',
    menu_settings:   'Settings',
    menu_language:   'Base language',
    notes_title:     'Course Notes',
    notes_sub:       'Materials & photos from my tutoring sessions',
    notes_coming:    'Coming soon',
    notes_coming_sub:'Session notes will appear here',
    blog_title:      'Blog',
    blog_sub:        'Culture, language & immersion notes',
    blog_coming:     'First post coming soon',
    blog_coming_sub: 'This is where you\'ll write about Burundian culture, language nuances, and your learning journey.',
    result_outstanding: 'Outstanding!',
    result_welldone:    'Well done!',
    result_good:        'Good effort!',
    result_keep:        'Keep practicing!',
    result_sub:         (pct, total) => `You scored ${pct}% on ${total} cards`,
    toast_correct:      (streak) => streak > 2 ? `🔥 ${streak} streak!` : '✓ Correct! +10',
    toast_wrong:        'Keep going! You\'ll get it.',
    toast_learned:      '⭐ Added to learned cards!',
    toast_already:      'Already in learned cards',
    toast_reintro:      'Card reintroduced to deck!',
    toast_reintro_all:  'All cards reintroduced!',
    toast_cleared:      'Cleared.',
    toast_load_err:     '⚠️ Failed to load vocabulary data',
    confirm_clear:      'Clear all learned cards? This cannot be undone.',
    card_counter:       (cur, tot) => `Card ${cur} of ${tot}`,
    learned_badge:      (n) => `${n} word${n !== 1 ? 's' : ''}`,
    empty_learned:      '<span class="big-icon">🌱</span><p>No learned cards yet.</p><p style="margin-top:8px;font-size:.85rem">Star a card during study to save it here.</p>',
  },
  fr: {
    tagline:         'Maîtrisez la langue du Burundi — une carte à la fois',
    stat_score:      'Score :',
    stat_streak:     'Meilleure série :',
    stat_learned:    'Appris :',
    label_category:  'Choisissez une catégorie',
    label_cards:     'Nombre de cartes',
    btn_select:      'Sélectionnez une catégorie →',
    btn_start:       '▶ Commencer →',
    flip_hint:       '👆 Appuyez pour révéler le mot en Kirundi',
    btn_wrong:       '✗ En cours d\'apprentissage',
    btn_correct:     '✓ Compris !',
    btn_retry:       '🔁 Réétudier',
    btn_home:        '← Retour à l\'accueil',
    btn_reintro_all: '🔄 Tout réintroduire',
    btn_clear:       '🗑 Tout effacer',
    res_correct:     'CORRECT',
    res_learning:    'EN COURS',
    res_streak:      'MEILLEURE SÉRIE',
    card_tag_base:   'Français',
    card_tag_ki:     'Kirundi',
    menu_study:      'Étude',
    menu_home:       'Accueil',
    menu_learned:    'Cartes apprises',
    menu_resources:  'Ressources',
    menu_notes:      'Notes de cours',
    menu_blog:       'Blog',
    menu_settings:   'Paramètres',
    menu_language:   'Langue de base',
    notes_title:     'Notes de cours',
    notes_sub:       'Documents et photos de mes séances avec mon tuteur',
    notes_coming:    'Bientôt disponible',
    notes_coming_sub:'Les notes de séances apparaîtront ici',
    blog_title:      'Blog',
    blog_sub:        'Culture, langue et notes d\'immersion',
    blog_coming:     'Premier article bientôt',
    blog_coming_sub: 'C\'est ici que vous écrirez sur la culture burundaise, les nuances de la langue et votre parcours.',
    result_outstanding: 'Excellent !',
    result_welldone:    'Bien joué !',
    result_good:        'Bon effort !',
    result_keep:        'Continuez à pratiquer !',
    result_sub:         (pct, total) => `Vous avez obtenu ${pct}% sur ${total} cartes`,
    toast_correct:      (streak) => streak > 2 ? `🔥 Série de ${streak} !` : '✓ Correct ! +10',
    toast_wrong:        'Continuez ! Vous y arriverez.',
    toast_learned:      '⭐ Ajouté aux cartes apprises !',
    toast_already:      'Déjà dans les cartes apprises',
    toast_reintro:      'Carte réintroduite dans le jeu !',
    toast_reintro_all:  'Toutes les cartes réintroduites !',
    toast_cleared:      'Effacé.',
    toast_load_err:     '⚠️ Échec du chargement des données',
    confirm_clear:      'Effacer toutes les cartes apprises ? Cette action est irréversible.',
    card_counter:       (cur, tot) => `Carte ${cur} sur ${tot}`,
    learned_badge:      (n) => `${n} mot${n !== 1 ? 's' : ''}`,
    empty_learned:      '<span class="big-icon">🌱</span><p>Aucune carte apprise pour l\'instant.</p><p style="margin-top:8px;font-size:.85rem">Étoilez une carte pendant l\'étude pour la sauvegarder ici.</p>',
  },
};

// ─── APP STATE ────────────────────────────────────────────────────────────────
const state = {
  // Persistent
  score:        0,
  streak:       0,
  maxStreak:    0,
  learnedCards: [],
  baseLang:     'en',   // 'en' | 'fr'

  // Session
  currentCategory: null,
  currentCount:    10,
  deck:        [],
  deckIndex:   0,
  flipped:     false,
  correct:     0,
  wrong:       0,
  currentCard: null,
};

// Convenience getter for current translation map
const t = () => I18N[state.baseLang];


// ═══════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════
async function boot() {
  try {
    const res  = await fetch('json/flashcards.json');
    const data = await res.json();
    CATEGORIES = data.categories;
    VOCAB      = data.cards;
  } catch (err) {
    console.error('Could not load flashcards.json:', err);
    showToast('⚠️ Failed to load vocabulary data', 'error');
    return;
  }

  loadPersistedState();
  applyLang(state.baseLang, false); // render UI in saved language
  buildCategoryGrid();
  setupCountOptions();
  updateHomeDashboard();
}


// ═══════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════
function loadPersistedState() {
  try {
    const raw = localStorage.getItem('ikirundi_state');
    if (!raw) return;
    const s = JSON.parse(raw);
    state.score        = s.score        ?? 0;
    state.streak       = s.streak       ?? 0;
    state.maxStreak    = s.maxStreak    ?? 0;
    state.learnedCards = s.learnedCards ?? [];
    state.baseLang     = s.baseLang     ?? 'en';
  } catch (e) {}
}

function persistState() {
  try {
    localStorage.setItem('ikirundi_state', JSON.stringify({
      score:        state.score,
      streak:       state.streak,
      maxStreak:    state.maxStreak,
      learnedCards: state.learnedCards,
      baseLang:     state.baseLang,
    }));
  } catch (e) {}
}


// ═══════════════════════════════════════════
// LANGUAGE SYSTEM
// ═══════════════════════════════════════════
function setLang(lang) {
  if (lang === state.baseLang) return;
  state.baseLang = lang;
  persistState();
  applyLang(lang, true);
}

function applyLang(lang, rebuildGrid) {
  const tr = I18N[lang];

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (tr[key] && typeof tr[key] === 'string') el.textContent = tr[key];
  });

  // Update lang pill highlights
  document.querySelectorAll('.lang-pill').forEach(p => {
    p.classList.toggle('selected', p.dataset.lang === lang);
  });

  // Update start button text if it's in the "ready" state
  const startBtn = document.getElementById('start-btn');
  if (!startBtn.disabled) startBtn.textContent = tr.btn_start;

  // Rebuild grid so category names update
  if (rebuildGrid) {
    buildCategoryGrid();
    // Re-select previously selected category visually
    if (state.currentCategory) {
      const btn = document.querySelector(`.cat-btn[data-id="${state.currentCategory}"]`);
      if (btn) btn.classList.add('selected');
    }
  }

  updateHomeDashboard();
}


// ═══════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════
function openMenu() {
  document.getElementById('side-menu').classList.add('open');
  document.getElementById('menu-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  document.getElementById('side-menu').classList.remove('open');
  document.getElementById('menu-overlay').classList.remove('open');
  document.body.style.overflow = '';
}


// ═══════════════════════════════════════════
// SCREEN ROUTING
// ═══════════════════════════════════════════
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'home')           updateHomeDashboard();
  if (id === 'learned-screen') renderLearnedScreen();
}


// ═══════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'toast show ' + type;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = 'toast'; }, 2600);
}


// ═══════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════
function updateHomeDashboard() {
  document.getElementById('home-score').textContent   = state.score;
  document.getElementById('home-streak').textContent  = state.maxStreak;
  document.getElementById('home-learned').textContent = state.learnedCards.length;
}

function buildCategoryGrid() {
  const grid = document.getElementById('category-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const lang = state.baseLang;
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className  = 'cat-btn';
    btn.dataset.id = cat.id;
    const name = lang === 'fr' ? cat.name_fr : cat.name_en;
    btn.innerHTML  = `<span class="cat-emoji">${cat.emoji}</span><span class="cat-name">${name}</span>`;
    btn.addEventListener('click', () => selectCategory(cat.id, btn));
    if (cat.id === state.currentCategory) btn.classList.add('selected');
    grid.appendChild(btn);
  });
}

function selectCategory(id, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.currentCategory = id;
  const startBtn = document.getElementById('start-btn');
  startBtn.disabled    = false;
  startBtn.textContent = t().btn_start;
}

function setupCountOptions() {
  document.querySelectorAll('.count-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.count-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      state.currentCount = parseInt(opt.dataset.n, 10);
    });
  });
}


// ═══════════════════════════════════════════
// DECK
// ═══════════════════════════════════════════
function buildDeck(categoryId, count) {
  const learnedSet = new Set(state.learnedCards.map(c => c.ki));
  const pool       = (VOCAB[categoryId] || []).filter(c => !learnedSet.has(c.ki));
  const shuffled   = [...pool].sort(() => Math.random() - 0.5);

  const deck = [];
  let i = 0;
  while (deck.length < count && shuffled.length > 0) {
    deck.push(shuffled[i % shuffled.length]);
    i++;
  }
  return deck;
}


// ═══════════════════════════════════════════
// STUDY
// ═══════════════════════════════════════════
function startStudy() {
  if (!state.currentCategory) return;

  state.deck      = buildDeck(state.currentCategory, state.currentCount);
  state.deckIndex = 0;
  state.correct   = 0;
  state.wrong     = 0;
  state.flipped   = false;

  const cat  = CATEGORIES.find(c => c.id === state.currentCategory);
  const name = state.baseLang === 'fr' ? cat.name_fr : cat.name_en;
  document.getElementById('study-cat-title').textContent = `${cat.emoji} ${name}`;

  // Update static study screen i18n strings
  document.getElementById('flip-hint').textContent = t().flip_hint;
  document.querySelector('.btn-wrong').textContent  = t().btn_wrong;
  document.querySelector('.btn-correct').textContent = t().btn_correct;

  showScreen('study');
  loadCard();
}

function updateStudyHeader() {
  const idx   = state.deckIndex;
  const total = state.deck.length;
  document.getElementById('card-counter').textContent   = t().card_counter(Math.min(idx + 1, total), total);
  document.getElementById('live-score').textContent     = state.score;
  document.getElementById('live-streak').textContent    = `🔥${state.streak}`;
  document.getElementById('progress-fill').style.width = (total > 0 ? (idx / total) * 100 : 0) + '%';
}

function loadCard() {
  if (state.deckIndex >= state.deck.length) {
    showResults();
    return;
  }

  state.flipped   = false;
  state.currentCard = state.deck[state.deckIndex];

  const cardEl = document.getElementById('flashcard');
  cardEl.classList.remove('flipped');
  cardEl.classList.add('card-enter');
  setTimeout(() => cardEl.classList.remove('card-enter'), 400);

  document.getElementById('action-row').classList.add('hidden');
  document.getElementById('flip-hint').style.display = 'block';

  renderCardFaces(state.currentCard);
  updateStudyHeader();
}

function renderCardFaces(card) {
  const lang    = state.baseLang;
  const baseWord = card[lang] ?? card.en;
  const tagBase  = t().card_tag_base;
  const tagKi    = t().card_tag_ki;

  document.getElementById('card-front-face').innerHTML = `
    <span class="card-tag">${tagBase}</span>
    <div class="card-word">${baseWord}</div>
    <div class="card-hint">${t().flip_hint}</div>`;

  document.getElementById('card-back-face').innerHTML = `
    <span class="card-tag">${tagKi}</span>
    <div class="card-word">${card.ki}</div>
    ${card.pron ? `<div class="card-pronunciation">/${card.pron}/</div>` : ''}`;
}

function flipCard() {
  state.flipped = !state.flipped;
  document.getElementById('flashcard').classList.toggle('flipped', state.flipped);
  document.getElementById('flip-hint').style.display  = state.flipped ? 'none'  : 'block';
  document.getElementById('action-row').classList.toggle('hidden', !state.flipped);
}

function answerCard(correct) {
  const cardEl = document.getElementById('flashcard');

  if (correct) {
    state.score   += 10;
    state.streak  += 1;
    state.correct += 1;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    cardEl.classList.add('correct-flash');
    setTimeout(() => cardEl.classList.remove('correct-flash'), 400);
    showToast(t().toast_correct(state.streak), 'success');
  } else {
    state.streak = 0;
    state.wrong += 1;
    cardEl.classList.add('wrong-flash');
    setTimeout(() => cardEl.classList.remove('wrong-flash'), 400);
    showToast(t().toast_wrong, 'error');
  }

  persistState();
  state.deckIndex++;
  updateStudyHeader();
  setTimeout(loadCard, 350);
}

function markLearned() {
  const card = state.currentCard;
  if (!card) return;
  const already = state.learnedCards.some(c => c.ki === card.ki);
  if (already) { showToast(t().toast_already, ''); return; }
  state.learnedCards.push({ ...card, category: state.currentCategory });
  persistState();
  showToast(t().toast_learned, 'success');
}


// ═══════════════════════════════════════════
// RESULTS
// ═══════════════════════════════════════════
function showResults() {
  const total = state.deck.length;
  const pct   = total > 0 ? Math.round((state.correct / total) * 100) : 0;
  const tr    = t();

  let emoji = '😅', title = tr.result_keep;
  if      (pct >= 90) { emoji = '🏆'; title = tr.result_outstanding; }
  else if (pct >= 70) { emoji = '🎉'; title = tr.result_welldone;    }
  else if (pct >= 50) { emoji = '💪'; title = tr.result_good;        }

  document.getElementById('results-emoji').textContent     = emoji;
  document.getElementById('results-title').textContent     = title;
  document.getElementById('results-subtitle').textContent  = tr.result_sub(pct, total);
  document.getElementById('res-correct').textContent       = state.correct;
  document.getElementById('res-wrong').textContent         = state.wrong;
  document.getElementById('res-streak').textContent        = state.maxStreak;
  document.getElementById('res-correct').nextElementSibling.textContent = tr.res_correct;
  document.getElementById('res-wrong').nextElementSibling.textContent   = tr.res_learning;
  document.getElementById('res-streak').nextElementSibling.textContent  = tr.res_streak;
  document.getElementById('retry-btn').textContent         = tr.btn_retry;
  document.querySelector('#results .res-btn.secondary').textContent = tr.btn_home;

  document.getElementById('retry-btn').onclick = startStudy;
  showScreen('results');
}


// ═══════════════════════════════════════════
// LEARNED SCREEN
// ═══════════════════════════════════════════
function renderLearnedScreen() {
  const list  = document.getElementById('learned-list');
  const count = state.learnedCards.length;
  const badge = document.getElementById('learned-count-badge');
  if (badge) badge.textContent = t().learned_badge(count);

  if (count === 0) {
    list.innerHTML = `<div class="empty-state">${t().empty_learned}</div>`;
    return;
  }

  const lang = state.baseLang;
  list.innerHTML = state.learnedCards.map((card, i) => {
    const cat      = CATEGORIES.find(c => c.id === card.category);
    const baseWord = card[lang] ?? card.en;
    return `
      <div class="learned-item">
        <div class="l-word">${baseWord}</div>
        <div class="l-translation">${card.ki}</div>
        <div class="l-cat">${cat?.emoji ?? ''}</div>
        <button class="reintro-btn" onclick="reintroduceOne(${i})">↩</button>
      </div>`;
  }).join('');

  // Update panel action labels
  document.querySelectorAll('[data-i18n="btn_reintro_all"]').forEach(el => el.textContent = t().btn_reintro_all);
  document.querySelectorAll('[data-i18n="btn_clear"]').forEach(el => el.textContent = t().btn_clear);
}

function reintroduceOne(index) {
  state.learnedCards.splice(index, 1);
  persistState();
  renderLearnedScreen();
  showToast(t().toast_reintro, '');
}

function reintroduceAll() {
  state.learnedCards = [];
  persistState();
  renderLearnedScreen();
  showToast(t().toast_reintro_all, '');
}

function clearAllLearned() {
  if (!confirm(t().confirm_clear)) return;
  state.learnedCards = [];
  persistState();
  renderLearnedScreen();
  showToast(t().toast_cleared, '');
}


// ═══════════════════════════════════════════
// EVENT WIRING
// ═══════════════════════════════════════════
document.getElementById('start-btn').addEventListener('click', startStudy);
document.getElementById('back-to-home').addEventListener('click', () => showScreen('home'));

// Kick off
boot();
