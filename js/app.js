// ══════════════════════════════════════════════════════════
//  MAIN APP INITIALIZATION & LOGIC
// ══════════════════════════════════════════════════════════

import { initializeApp }        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged }
                                from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { firebaseConfig, APP } from './config.js';
import { signInWithGoogle, handleSignOut, configureGoogleProvider } from './auth.js';
import { EventManager, isUpcoming, formatDate, formatTime } from './events.js';
import {
  toast, openModal, closeModal, getCatStyle, getCatLabel, getCatIcon,
  populateStaticText, renderStats, renderFilters, renderEvents,
  updateUserUI, setView
} from './ui.js';

/* ── Firebase init ────────────────────────────────────── */
const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = configureGoogleProvider(new GoogleAuthProvider());

/* ────────────────────────────────────────────────────── */
/*  APP STATE                                             */
/* ────────────────────────────────────────────────────── */
let currentUser   = null;
let eventManager  = null;
let editingId     = null;
let currentView   = "dashboard";
let currentFilter = "all";
let selectedColor = APP.colors[0].hex;
let pendingDeleteId = null;
let isGridView    = true;

/* ────────────────────────────────────────────────────── */
/*  MODAL FUNCTIONS                                       */
/* ────────────────────────────────────────────────────── */

function openCreateModal() {
  editingId = null;
  document.getElementById("modal-title").textContent = APP.strings.createModal;
  document.getElementById("ev-title").value    = "";
  document.getElementById("ev-desc").value     = "";
  document.getElementById("ev-date").value     = "";
  document.getElementById("ev-time").value     = "";
  document.getElementById("ev-location").value = "";
  document.getElementById("ev-attendees").value= "";
  document.getElementById("ev-category").value = APP.categories[0].id;
  selectedColor = APP.colors[0].hex;
  document.querySelectorAll(".color-swatch").forEach((sw,i) => {
    sw.classList.toggle("selected", i === 0);
  });
  openModal("event-modal-overlay");
  document.getElementById("ev-title").focus();
}

function openEditModal(id) {
  const ev = eventManager.getEvent(id);
  if (!ev) return;
  editingId = id;
  document.getElementById("modal-title").textContent = APP.strings.editModal;
  document.getElementById("ev-title").value    = ev.title || "";
  document.getElementById("ev-desc").value     = ev.desc  || "";
  document.getElementById("ev-date").value     = ev.date  || "";
  document.getElementById("ev-time").value     = ev.time  || "";
  document.getElementById("ev-location").value = ev.location || "";
  document.getElementById("ev-attendees").value= ev.attendees || "";
  document.getElementById("ev-category").value = ev.category || APP.categories[0].id;
  selectedColor = ev.color || APP.colors[0].hex;
  document.querySelectorAll(".color-swatch").forEach(sw => {
    sw.classList.toggle("selected", sw.style.background === selectedColor || sw.style.backgroundColor === selectedColor);
  });
  closeModal("detail-modal-overlay");
  openModal("event-modal-overlay");
  document.getElementById("ev-title").focus();
}

function saveEvent() {
  const title    = document.getElementById("ev-title").value.trim();
  const desc     = document.getElementById("ev-desc").value.trim();
  const date     = document.getElementById("ev-date").value;
  const time     = document.getElementById("ev-time").value;
  const location = document.getElementById("ev-location").value.trim();
  const category = document.getElementById("ev-category").value;
  const attendees= document.getElementById("ev-attendees").value;

  if (!title || !date) {
    toast("Please fill in the title and date.", "error");
    return;
  }

  if (editingId) {
    eventManager.updateEvent(editingId, { title, desc, date, time, location, category, attendees, color: selectedColor });
    toast(APP.strings.toastUpdated, "success");
  } else {
    eventManager.addEvent({ title, desc, date, time, location, category, attendees, color: selectedColor });
    toast(APP.strings.toastCreated, "success");
  }

  closeModal("event-modal-overlay");
  renderAll();
}

function openDetailModal(id) {
  const ev = eventManager.getEvent(id);
  if (!ev) return;
  const s = getCatStyle(ev.category);
  const icon = getCatIcon(ev.category);
  document.getElementById("detail-banner").style.background = ev.color || APP.colors[0].hex;
  document.getElementById("detail-tag").innerHTML = `<div class="event-tag" style="background:${s.bg};color:${s.color}"><i class="fas ${icon}"></i> ${getCatLabel(ev.category)}</div>`;
  document.getElementById("detail-title").textContent     = ev.title || "Untitled Event";
  document.getElementById("detail-desc").textContent      = ev.desc  || "";
  document.getElementById("detail-date").textContent      = formatDate(ev.date);
  document.getElementById("detail-time").textContent      = formatTime(ev.time);
  document.getElementById("detail-location").textContent  = ev.location || "—";
  document.getElementById("detail-attendees").textContent = ev.attendees ? `${ev.attendees} attendees` : "—";
  document.getElementById("detail-edit-btn").onclick   = () => openEditModal(ev.id);
  document.getElementById("detail-delete-btn").onclick = () => { closeModal("detail-modal-overlay"); openConfirmDelete(ev.id); };
  openModal("detail-modal-overlay");
}

function openConfirmDelete(id) {
  pendingDeleteId = id;
  openModal("confirm-overlay");
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  eventManager.deleteEvent(pendingDeleteId);
  pendingDeleteId = null;
  closeModal("confirm-overlay");
  toast(APP.strings.toastDeleted, "info");
  renderAll();
}

/* ────────────────────────────────────────────────────── */
/*  RENDER FUNCTIONS                                      */
/* ────────────────────────────────────────────────────── */

function renderAll() {
  const events = eventManager.getEvents();
  renderStats(events);
  renderFilters(events, currentFilter, (filter) => {
    currentFilter = filter;
    renderFilters(events, currentFilter, arguments.callee);
    renderEvents(events, currentView, currentFilter, selectedColor, openDetailModal, openEditModal, openConfirmDelete);
  });
  renderEvents(events, currentView, currentFilter, selectedColor, openDetailModal, openEditModal, openConfirmDelete);
  document.getElementById("upcoming-badge").textContent = events.filter(isUpcoming).length;
}

function handleSetView(view) {
  currentView = setView(view, currentView, currentFilter);
  const events = eventManager.getEvents();
  renderAll();
}

/* ────────────────────────────────────────────────────── */
/*  COLOR PICKER                                          */
/* ────────────────────────────────────────────────────── */

function initColorPicker() {
  const cp = document.getElementById("color-picker");
  APP.colors.forEach(c => {
    const sw = document.createElement("div");
    sw.className = "color-swatch" + (c.hex === selectedColor ? " selected" : "");
    sw.style.background = c.hex;
    sw.title = c.name;
    sw.addEventListener("click", () => {
      document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("selected"));
      sw.classList.add("selected");
      selectedColor = c.hex;
    });
    cp.appendChild(sw);
  });
}

/* ────────────────────────────────────────────────────── */
/*  BOOT & INITIALIZATION                                 */
/* ────────────────────────────────────────────────────── */

function boot() {
  populateStaticText();
  initColorPicker();

  onAuthStateChanged(auth, user => {
    document.getElementById("loading-screen").classList.add("hidden");
    currentUser = user;

    if (user) {
      document.getElementById("login-page").classList.add("hidden");
      document.getElementById("app-page").classList.remove("hidden");
      updateUserUI(user);
      eventManager = new EventManager(user);
      eventManager.loadEvents();
      handleSetView("dashboard");
    } else {
      document.getElementById("app-page").classList.add("hidden");
      document.getElementById("login-page").classList.remove("hidden");
      eventManager = null;
      currentView = "dashboard";
    }
  });

  /* Button wiring */
  document.getElementById("google-login-btn").addEventListener("click", () => signInWithGoogle(auth, provider, toast));
  document.getElementById("create-btn").addEventListener("click", openCreateModal);
  document.getElementById("modal-close-btn").addEventListener("click", () => closeModal("event-modal-overlay"));
  document.getElementById("modal-cancel-btn").addEventListener("click", () => closeModal("event-modal-overlay"));
  document.getElementById("modal-save-btn").addEventListener("click", saveEvent);
  document.getElementById("detail-close-btn").addEventListener("click", () => closeModal("detail-modal-overlay"));
  document.getElementById("detail-close-btn2").addEventListener("click", () => closeModal("detail-modal-overlay"));
  document.getElementById("confirm-cancel").addEventListener("click", () => closeModal("confirm-overlay"));
  document.getElementById("confirm-delete").addEventListener("click", confirmDelete);
  document.getElementById("user-chip").addEventListener("click", () => {
    if (eventManager) {
      document.getElementById("um-event-count").textContent = `${eventManager.getEvents().length} ${APP.strings.eventsManaged}`;
    }
    openModal("user-menu-overlay");
  });
  document.getElementById("user-menu-close").addEventListener("click", () => closeModal("user-menu-overlay"));
  document.getElementById("signout-btn").addEventListener("click", () => handleSignOut(auth, closeModal, toast, APP));

  /* Nav */
  document.addEventListener("click", e => {
    const nav = e.target.closest(".nav-item");
    if (nav && nav.dataset.view) { currentFilter = "all"; handleSetView(nav.dataset.view); }
  });

  /* View toggle */
  document.getElementById("grid-view-btn").addEventListener("click", () => {
    isGridView = true;
    document.getElementById("events-grid").classList.remove("list-view");
    document.getElementById("grid-view-btn").classList.add("active");
    document.getElementById("list-view-btn").classList.remove("active");
  });
  document.getElementById("list-view-btn").addEventListener("click", () => {
    isGridView = false;
    document.getElementById("events-grid").classList.add("list-view");
    document.getElementById("list-view-btn").classList.add("active");
    document.getElementById("grid-view-btn").classList.remove("active");
  });

  /* Search */
  document.getElementById("search-input").addEventListener("input", () => {
    if (eventManager) {
      const events = eventManager.getEvents();
      renderEvents(events, currentView, currentFilter, selectedColor, openDetailModal, openEditModal, openConfirmDelete);
    }
  });

  /* Close overlays on backdrop click */
  ["event-modal-overlay","detail-modal-overlay","confirm-overlay","user-menu-overlay"].forEach(id => {
    document.getElementById(id).addEventListener("click", e => {
      if (e.target.id === id) closeModal(id);
    });
  });

  /* Keyboard ESC */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      ["event-modal-overlay","detail-modal-overlay","confirm-overlay","user-menu-overlay"].forEach(id => closeModal(id));
    }
  });
}

// Start the app
boot();
