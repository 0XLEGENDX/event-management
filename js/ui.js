// ══════════════════════════════════════════════════════════
//  UI RENDERING & UPDATES
// ══════════════════════════════════════════════════════════

import { formatDate, formatTime, isUpcoming, getFilteredEvents } from './events.js';
import { APP } from './config.js';

export function toast(msg, type = "success") {
  const icons = { success: "fa-circle-check", error: "fa-circle-xmark", info: "fa-circle-info" };
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.innerHTML = `<i class="fas ${icons[type]}"></i> ${msg}`;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(40px)";
    t.style.transition = ".3s";
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

export function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

export function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

export function getCatStyle(catId) {
  return APP.categoryColors[catId] || APP.categoryColors.other;
}

export function getCatLabel(catId) {
  const c = APP.categories.find(c => c.id === catId);
  return c ? c.label : catId;
}

export function getCatIcon(catId) {
  const c = APP.categories.find(c => c.id === catId);
  return c ? c.icon : "fa-tag";
}

export function populateStaticText() {
  const s = APP.strings;
  document.getElementById("brand-name").textContent      = APP.name;
  document.getElementById("brand-tagline").textContent   = APP.tagline;
  document.getElementById("login-heading").textContent   = s.loginHeading;
  document.getElementById("login-subheading").textContent= s.loginSub;
  document.getElementById("google-btn-text").textContent = s.googleBtn;
  document.getElementById("divider-text").textContent    = s.divider;
  document.getElementById("login-info").textContent      = s.loginInfo;
  document.getElementById("login-note").textContent      = s.loginNote;
  document.getElementById("sidebar-brand").textContent   = APP.name;
  document.getElementById("nav-main-label").textContent  = s.navMain;
  document.getElementById("nav-dashboard").textContent   = s.navDashboard;
  document.getElementById("nav-upcoming").textContent    = s.navUpcoming;
  document.getElementById("nav-past").textContent        = s.navPast;
  document.getElementById("nav-category-label").textContent = s.navCategories;
  document.getElementById("create-btn-text").textContent = s.create;
  document.getElementById("search-input").placeholder    = s.searchPH;
  document.getElementById("signout-text").textContent    = s.signOut;
  document.getElementById("user-menu-title").textContent = s.account;
  document.getElementById("lbl-title").textContent       = s.lbl_title;
  document.getElementById("lbl-desc").textContent        = s.lbl_desc;
  document.getElementById("lbl-date").textContent        = s.lbl_date;
  document.getElementById("lbl-time").textContent        = s.lbl_time;
  document.getElementById("lbl-location").textContent    = s.lbl_location;
  document.getElementById("lbl-category").textContent    = s.lbl_category;
  document.getElementById("lbl-color").textContent       = s.lbl_color;
  document.getElementById("lbl-attendees").textContent   = s.lbl_attendees;
  document.getElementById("ev-title").placeholder        = s.ph_title;
  document.getElementById("ev-desc").placeholder         = s.ph_desc;
  document.getElementById("ev-location").placeholder     = s.ph_location;
  document.getElementById("ev-attendees").placeholder    = s.ph_attendees;
  document.getElementById("confirm-title").textContent   = s.deleteTitle;
  document.getElementById("confirm-msg").textContent     = s.deleteMsg;
  document.getElementById("confirm-delete").innerHTML    = `<i class='fas fa-trash'></i> ${s.deleteBtn}`;
  document.getElementById("confirm-cancel").textContent  = s.cancelBtn;

  // Login features
  const fl = document.getElementById("login-features");
  APP.features.forEach(f => {
    fl.innerHTML += `<div class="login-feature"><div class="feat-icon"><i class="fas ${f.icon}"></i></div><span>${f.text}</span></div>`;
  });

  // Category select
  const sel = document.getElementById("ev-category");
  APP.categories.forEach(c => { sel.innerHTML += `<option value="${c.id}">${c.label}</option>`; });

  // Category nav
  const cn = document.getElementById("category-nav");
  APP.categories.forEach(c => {
    const s = getCatStyle(c.id);
    cn.innerHTML += `<div class="nav-item" data-view="cat-${c.id}">
      <i class="fas ${c.icon}" style="color:${s.color}"></i>
      <span>${c.label}</span>
    </div>`;
  });
}

export function renderStats(events) {
  const total   = events.length;
  const upcoming = events.filter(isUpcoming).length;
  const past    = total - upcoming;
  const cats    = new Set(events.map(e => e.category)).size;

  const stats = [
    { val: total,    lbl: APP.strings.totalEvents,     icon:"fa-calendar", color:"#4f7cff", bg:"rgba(79,124,255,.1)" },
    { val: upcoming, lbl: APP.strings.upcomingCount,   icon:"fa-calendar-clock", color:"#2ec27e", bg:"rgba(46,194,126,.1)" },
    { val: past,     lbl: APP.strings.pastCount,       icon:"fa-clock-rotate-left", color:"#f6a623", bg:"rgba(246,166,35,.1)" },
    { val: cats,     lbl: APP.strings.categoriesCount, icon:"fa-tags", color:"#6c5ce7", bg:"rgba(108,92,231,.1)" },
  ];

  const grid = document.getElementById("stats-grid");
  grid.innerHTML = stats.map(s => `
    <div class="stat-card" style="--stat-color:${s.color};--stat-bg:${s.bg}">
      <div class="stat-icon"><i class="fas ${s.icon}"></i></div>
      <div class="stat-val">${s.val}</div>
      <div class="stat-lbl">${s.lbl}</div>
    </div>
  `).join("");
}

export function renderFilters(events, currentFilter, onFilterChange) {
  const bar = document.getElementById("filter-bar");
  const chips = [{ id:"all", label: APP.strings.filterAll }, ...APP.categories];
  bar.innerHTML = chips.map(c => `
    <div class="filter-chip ${currentFilter === c.id ? "active" : ""}" data-filter="${c.id}">
      ${c.label || c.id}
    </div>
  `).join("");
  bar.querySelectorAll(".filter-chip").forEach(ch => {
    ch.addEventListener("click", () => {
      onFilterChange(ch.dataset.filter);
    });
  });
}

export function renderEvents(events, currentView, currentFilter, selectedColor, onOpenDetail, onOpenEdit, onOpenDelete) {
  const searchQuery = document.getElementById("search-input").value;
  const grid = document.getElementById("events-grid");
  const list = getFilteredEvents(events, currentView, currentFilter, searchQuery);

  if (!list.length) {
    const isSearch = searchQuery.trim();
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fas fa-calendar-xmark"></i></div>
        <h3>${isSearch ? APP.strings.emptySearch : APP.strings.emptyTitle}</h3>
        <p>${isSearch ? APP.strings.emptySearchMsg : APP.strings.emptyMsg}</p>
        ${!isSearch ? `<button class="btn btn-primary btn-lg" id="empty-create-btn"><i class="fas fa-plus"></i> ${APP.strings.create}</button>` : ""}
      </div>`;
    document.getElementById("empty-create-btn")?.addEventListener("click", () => onOpenEdit('create'));
    return;
  }

  grid.innerHTML = list.map((ev, i) => {
    const s    = getCatStyle(ev.category);
    const icon = getCatIcon(ev.category);
    const label= getCatLabel(ev.category);
    const color= ev.color || APP.colors[0].hex;
    const colors= ["#4f7cff","#6c5ce7","#2ec27e","#f6a623","#ff6b6b"];
    const dotColors = colors.slice(0, Math.min(3, Math.floor(Math.random()*3)+1));

    return `
    <div class="event-card" style="--card-color:${color}; animation-delay:${i * 0.05}s" data-id="${ev.id}">
      <div class="event-banner"></div>
      <div class="event-body">
        <div class="event-tag" style="background:${s.bg};color:${s.color}">
          <i class="fas ${icon}"></i> ${label}
        </div>
        <div class="event-title">${ev.title || "Untitled Event"}</div>
        ${ev.desc ? `<div class="event-desc">${ev.desc}</div>` : ""}
        <div class="event-meta">
          <div class="meta-row"><i class="fas fa-calendar"></i> ${formatDate(ev.date)}</div>
          ${ev.time ? `<div class="meta-row"><i class="fas fa-clock"></i> ${formatTime(ev.time)}</div>` : ""}
          ${ev.location ? `<div class="meta-row"><i class="fas fa-location-dot"></i> ${ev.location}</div>` : ""}
        </div>
      </div>
      <div class="event-footer">
        <div class="event-attendees">
          ${dotColors.map((c,i) => `<div class="attendee-dot" style="background:${c}">${String.fromCharCode(65+i)}</div>`).join("")}
          ${ev.attendees ? `<span class="attendees-count">${ev.attendees} attendees</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn-icon edit-card-btn" data-id="${ev.id}" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="btn-icon delete-card-btn" data-id="${ev.id}" title="Delete" style="color:var(--accent)"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join("");

  // Card click → detail
  grid.querySelectorAll(".event-card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest(".card-actions")) return;
      onOpenDetail(card.dataset.id);
    });
  });
  grid.querySelectorAll(".edit-card-btn").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); onOpenEdit(btn.dataset.id); });
  });
  grid.querySelectorAll(".delete-card-btn").forEach(btn => {
    btn.addEventListener("click", e => { e.stopPropagation(); onOpenDelete(btn.dataset.id); });
  });
}

export function updateUserUI(user) {
  const initials = user.displayName?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "U";
  const avatarHTML = user.photoURL
    ? `<img src="${user.photoURL}" alt="${user.displayName}"/>`
    : initials;

  document.getElementById("sidebar-user-name").textContent = user.displayName || "User";
  document.getElementById("sidebar-user-email").textContent = user.email || "";
  document.getElementById("sidebar-avatar").innerHTML = avatarHTML;
  document.getElementById("um-name").textContent  = user.displayName || "User";
  document.getElementById("um-email").textContent = user.email || "";
  document.getElementById("um-avatar").innerHTML  = avatarHTML;
}

export function setView(view, currentView, currentFilter) {
  currentView = view;
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  const navEl = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (navEl) navEl.classList.add("active");

  const titles = {
    dashboard: APP.strings.navDashboard,
    upcoming:  APP.strings.upcomingEvents,
    past:      APP.strings.pastEvents,
  };

  document.getElementById("topbar-title").textContent =
    titles[view] || getCatLabel(view.replace("cat-","")) + " Events";
  document.getElementById("events-section-title").textContent =
    titles[view] || getCatLabel(view.replace("cat-","")) + " Events";

  // Show stats only on dashboard
  document.getElementById("stats-grid").style.display = view === "dashboard" ? "" : "none";

  return currentView;
}
