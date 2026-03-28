// ══════════════════════════════════════════════════════════
//  EVENT MANAGEMENT
// ══════════════════════════════════════════════════════════

export class EventManager {
  constructor(currentUser) {
    this.currentUser = currentUser;
    this.events = [];
  }

  storageKey() {
    return `eventify_events_${this.currentUser.uid}`;
  }

  loadEvents() {
    const raw = localStorage.getItem(this.storageKey());
    this.events = raw ? JSON.parse(raw) : [];
  }

  saveEvents() {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.events));
  }

  addEvent(eventData) {
    const newEvent = {
      id: this.generateId(),
      ...eventData,
      created: Date.now()
    };
    this.events.push(newEvent);
    this.saveEvents();
    return newEvent;
  }

  updateEvent(id, eventData) {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.events[idx] = { ...this.events[idx], ...eventData };
      this.saveEvents();
      return this.events[idx];
    }
    return null;
  }

  deleteEvent(id) {
    this.events = this.events.filter(e => e.id !== id);
    this.saveEvents();
  }

  getEvents() {
    return this.events;
  }

  getEvent(id) {
    return this.events.find(e => e.id === id);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

export function isUpcoming(event) {
  return new Date(event.date + "T" + (event.time || "00:00")) >= new Date();
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${ampm}`;
}

export function getFilteredEvents(events, currentView, currentFilter, searchQuery) {
  const q = searchQuery.toLowerCase().trim();
  let list = [...events];

  if (currentView === "upcoming") list = list.filter(isUpcoming);
  if (currentView === "past") list = list.filter(e => !isUpcoming(e));
  if (currentView.startsWith("cat-")) {
    const cat = currentView.replace("cat-", "");
    list = list.filter(e => e.category === cat);
  }

  if (currentFilter !== "all") list = list.filter(e => e.category === currentFilter);

  if (q) {
    list = list.filter(e => (e.title + e.desc + e.location + e.category).toLowerCase().includes(q));
  }

  return list.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
}
