// ======================================
//  EventZone - app.js
//  My first big javascript project!!
// ======================================

// -- Sample events data --
let events = [
    {
        id: 1,
        name: "Pune Music Festival 2025",
        category: "music",
        date: "2025-08-15",
        time: "18:00",
        location: "Shivajinagar, Pune",
        price: 299,
        seats: 500,
        registered: 312,
        description: "A big outdoor music festival with live bands from all over Maharashtra! We will have food stalls, lights and great vibes. Come with your friends and family!",
        emoji: "🎵",
        featured: true,
        createdByMe: false
    },
    {
        id: 2,
        name: "TechTalks Hackathon",
        category: "tech",
        date: "2025-07-20",
        time: "09:00",
        location: "Hinjewadi, Pune",
        price: 0,
        seats: 200,
        registered: 145,
        description: "48 hour hackathon for developers, designers and entrepreneurs. Build something amazing and win prizes! Meals included. Teams of 1-4 people.",
        emoji: "💻",
        featured: true,
        createdByMe: false
    },
    {
        id: 3,
        name: "Food & Culture Carnival",
        category: "food",
        date: "2025-07-28",
        time: "11:00",
        location: "FC Road, Pune",
        price: 150,
        seats: 1000,
        registered: 720,
        description: "Try cuisines from 20+ different cultures all in one place! There will be cooking demos, eating competitions and of course lots and lots of delicious food.",
        emoji: "🍕",
        featured: true,
        createdByMe: false
    },
    {
        id: 4,
        name: "5K Fun Run Morning",
        category: "sports",
        date: "2025-08-03",
        time: "06:30",
        location: "Baner Road, Pune",
        price: 100,
        seats: 300,
        registered: 178,
        description: "A casual 5K run for all fitness levels! You don't need to be super fast. Its all about having fun and staying healthy. T-shirt included in registration!",
        emoji: "⚽",
        featured: false,
        createdByMe: false
    },
    {
        id: 5,
        name: "Street Art Workshop",
        category: "art",
        date: "2025-07-19",
        time: "10:00",
        location: "Koregaon Park, Pune",
        price: 500,
        seats: 30,
        registered: 22,
        description: "Learn street art and graffiti techniques from local artists. All materials provided. You will create your own canvas artwork to take home. Beginners welcome!",
        emoji: "🎨",
        featured: false,
        createdByMe: false
    },
    {
        id: 6,
        name: "Startup Networking Night",
        category: "tech",
        date: "2025-08-10",
        time: "19:00",
        location: "Viman Nagar, Pune",
        price: 199,
        seats: 100,
        registered: 67,
        description: "Meet other founders, investors and startup enthusiasts! Great opportunity to find co-founders, mentors or just make new friends in the startup world.",
        emoji: "🚀",
        featured: false,
        createdByMe: false
    },
    {
        id: 7,
        name: "Classical Dance Performance",
        category: "art",
        date: "2025-09-05",
        time: "17:30",
        location: "Bal Gandharva Rang Mandir",
        price: 350,
        seats: 450,
        registered: 210,
        description: "A beautiful evening of Bharatanatyam and Kathak performances by top artists from across India. A cultural experience you wont forget!",
        emoji: "🎭",
        featured: true,
        createdByMe: false
    },
    {
        id: 8,
        name: "Baking Masterclass",
        category: "food",
        date: "2025-07-26",
        time: "14:00",
        location: "Kothrud, Pune",
        price: 800,
        seats: 20,
        registered: 18,
        description: "Learn to bake amazing cakes, breads and pastries with a professional baker! Small batch class so you get personal attention. All ingredients provided.",
        emoji: "🧁",
        featured: false,
        createdByMe: false
    }
];

// keep track of which events user registered for
let myRegistrations = [];
// next event id
let nextId = events.length + 1;
// current active category filter
let activeCategory = 'all';
// selected emoji
let selectedEmoji = '🎵';

// =====================
//  ON PAGE LOAD
// =====================
window.onload = function () {
    showSection('home');
    renderFeatured();
    renderAllEvents();
    animateCounters();
    updatePreview();

    // wire up live preview
    ['ev-name', 'ev-cat', 'ev-date', 'ev-time', 'ev-location', 'ev-price', 'ev-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updatePreview);
        if (el) el.addEventListener('change', updatePreview);
    });
};

// =====================
//  NAVIGATION
// =====================
function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(name);
    if (target) {
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // refresh content when switching
    if (name === 'events') renderAllEvents();
    if (name === 'myevents') renderMyEvents();
    if (name === 'home') { renderFeatured(); animateCounters(); }

    // close mobile menu
    document.getElementById('nav-links').classList.remove('open');
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('open');
}

function filterAndGo(cat) {
    activeCategory = cat;
    document.getElementById('filter-cat').value = cat;
    showSection('events');
    filterEvents();
}

// =====================
//  COUNTER ANIMATION
// =====================
function animateCounters() {
    const totalEvents = events.length;
    const totalPeople = events.reduce((a, b) => a + b.registered, 0);
    const totalCities = [...new Set(events.map(e => e.location.split(',')[1]?.trim() || 'Pune'))].length + 2;

    countUp('count-events', totalEvents, 800);
    countUp('count-users', totalPeople, 1200);
    countUp('count-cities', totalCities, 600);
}

function countUp(id, target, duration) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        start += step;
        if (start >= target) {
            el.textContent = target + (id === 'count-events' ? '' : '+');
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start) + (id === 'count-events' ? '' : '+');
        }
    }, 16);
}

// =====================
//  RENDER EVENTS
// =====================
function renderFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    const featured = events.filter(e => e.featured).slice(0, 3);
    grid.innerHTML = featured.map(e => eventCardHTML(e, false)).join('');
}

function renderAllEvents() {
    filterEvents();
}

function filterEvents() {
    const search = (document.getElementById('search-input')?.value || '').toLowerCase();
    const cat    = document.getElementById('filter-cat')?.value || 'all';
    const sort   = document.getElementById('filter-sort')?.value || 'date';

    activeCategory = cat;

    let filtered = events.filter(e => {
        const matchCat  = cat === 'all' || e.category === cat;
        const matchText = e.name.toLowerCase().includes(search) ||
                          e.description.toLowerCase().includes(search) ||
                          e.location.toLowerCase().includes(search);
        return matchCat && matchText;
    });

    // sort
    filtered.sort((a, b) => {
        if (sort === 'date')  return new Date(a.date) - new Date(b.date);
        if (sort === 'name')  return a.name.localeCompare(b.name);
        if (sort === 'price') return a.price - b.price;
        return 0;
    });

    const grid = document.getElementById('events-grid');
    const noResults = document.getElementById('no-results');
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        grid.innerHTML = filtered.map(e => eventCardHTML(e, false)).join('');
    }
}

function eventCardHTML(event, showDelete) {
    const isRegistered = myRegistrations.includes(event.id);
    const seatsLeft = event.seats - event.registered;
    const priceLabel = event.price === 0 ? '🎉 FREE' : '₹' + event.price;
    const formattedDate = formatDate(event.date);
    const regBtn = isRegistered
        ? `<button class="btn-register registered" onclick="event.stopPropagation(); unregisterEvent(${event.id})">✓ Joined</button>`
        : `<button class="btn-register" onclick="event.stopPropagation(); openRegisterModal(${event.id})">Register</button>`;

    const deleteBtn = showDelete
        ? `<button class="btn-delete" onclick="event.stopPropagation(); deleteEvent(${event.id})">Delete</button>`
        : '';

    return `
    <div class="event-card" onclick="openEventModal(${event.id})">
        <span class="event-emoji">${event.emoji}</span>
        <h3>${event.name}</h3>
        <span class="event-tag">${catLabel(event.category)}</span>
        <p class="event-detail">📅 ${formattedDate} at ${formatTime(event.time)}</p>
        <p class="event-detail">📍 ${event.location}</p>
        <p class="event-detail">🪑 ${seatsLeft > 0 ? seatsLeft + ' seats left' : '<span style="color:#ff6584">Full!</span>'}</p>
        <div class="event-footer">
            <span class="event-price">${priceLabel}</span>
            <div>
                ${regBtn}
                ${deleteBtn}
            </div>
        </div>
    </div>`;
}

// =====================
//  MY EVENTS
// =====================
function renderMyEvents() {
    // created events
    const createdEvents = events.filter(e => e.createdByMe);
    const createdGrid  = document.getElementById('created-grid');
    const createdEmpty = document.getElementById('created-empty');
    if (createdEvents.length === 0) {
        createdGrid.innerHTML = '';
        createdEmpty.style.display = 'block';
    } else {
        createdEmpty.style.display = 'none';
        createdGrid.innerHTML = createdEvents.map(e => eventCardHTML(e, true)).join('');
    }

    // registered events
    const regEvents = events.filter(e => myRegistrations.includes(e.id));
    const regGrid  = document.getElementById('registered-grid');
    const regEmpty = document.getElementById('registered-empty');
    if (regEvents.length === 0) {
        regGrid.innerHTML = '';
        regEmpty.style.display = 'block';
    } else {
        regEmpty.style.display = 'none';
        regGrid.innerHTML = regEvents.map(e => eventCardHTML(e, false)).join('');
    }
}

function switchTab(tab) {
    document.getElementById('tab-created').classList.toggle('active', tab === 'created');
    document.getElementById('tab-registered').classList.toggle('active', tab === 'registered');
    document.getElementById('created-tab').style.display  = tab === 'created' ? 'block' : 'none';
    document.getElementById('registered-tab').style.display = tab === 'registered' ? 'block' : 'none';
}

function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    events = events.filter(e => e.id !== id);
    renderMyEvents();
    showToast('Event deleted!', 'error');
}

// =====================
//  MODALS
// =====================
function openEventModal(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    const isRegistered = myRegistrations.includes(id);
    const seatsLeft = event.seats - event.registered;

    document.getElementById('modal-content').innerHTML = `
        <div class="modal-emoji">${event.emoji}</div>
        <div class="event-tag" style="margin-bottom:10px">${catLabel(event.category)}</div>
        <h2>${event.name}</h2>
        <div class="modal-info">
            <div class="modal-info-row">📅 <span>${formatDate(event.date)} at ${formatTime(event.time)}</span></div>
            <div class="modal-info-row">📍 <span>${event.location}</span></div>
            <div class="modal-info-row">💰 <span>${event.price === 0 ? 'FREE to join!' : '₹' + event.price}</span></div>
            <div class="modal-info-row">🪑 <span>${seatsLeft > 0 ? seatsLeft + ' spots remaining' : 'This event is full!'}</span></div>
        </div>
        <p class="modal-desc">${event.description}</p>
        ${!isRegistered && seatsLeft > 0 ? `
        <div class="modal-register-form">
            <h4>Register for this event 🎟️</h4>
            <input type="text" id="reg-name" placeholder="Your Name *">
            <input type="email" id="reg-email" placeholder="Your Email *">
            <input type="tel" id="reg-phone" placeholder="Phone Number">
            <button class="btn-main" style="width:100%; margin-top:5px" onclick="confirmRegister(${id})">
                Confirm Registration 🎉
            </button>
        </div>` : isRegistered ? `
        <div style="text-align:center; padding:20px; background:#f0fff4; border-radius:14px; color:#4caf50; font-weight:700">
            ✅ You're registered for this event!
            <br><button class="btn-outline" style="margin-top:12px; color:#ff6584; border-color:#ff6584" onclick="unregisterEvent(${id}); closeModal()">Cancel Registration</button>
        </div>` : `
        <div style="text-align:center; padding:15px; background:#fff0f3; border-radius:14px; color:#ff6584; font-weight:700">
            😞 Sorry, this event is full!
        </div>`}
    `;

    document.getElementById('modal-overlay').classList.add('open');
}

function openRegisterModal(id) {
    openEventModal(id);
}

function confirmRegister(id) {
    const name  = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();

    if (!name || !email) {
        showToast('Please enter your name and email!', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address!', 'error');
        return;
    }

    myRegistrations.push(id);
    const event = events.find(e => e.id === id);
    if (event) event.registered++;

    closeModal();
    showToast('🎉 Successfully registered! See you there!', 'success');
    renderAllEvents();
    renderFeatured();
}

function unregisterEvent(id) {
    myRegistrations = myRegistrations.filter(r => r !== id);
    const event = events.find(e => e.id === id);
    if (event && event.registered > 0) event.registered--;
    showToast('Registration cancelled.', 'info');
    renderAllEvents();
    renderFeatured();
    if (document.getElementById('myevents').classList.contains('active')) renderMyEvents();
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
}

// =====================
//  CREATE EVENT FORM
// =====================
function selectEmoji(el, emoji) {
    document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedEmoji = emoji;
    document.getElementById('ev-emoji').value = emoji;
    updatePreview();
}

function updatePreview() {
    const name  = document.getElementById('ev-name')?.value || 'Your Event Name';
    const cat   = document.getElementById('ev-cat')?.value || '';
    const date  = document.getElementById('ev-date')?.value || '';
    const time  = document.getElementById('ev-time')?.value || '';
    const loc   = document.getElementById('ev-location')?.value || 'Location';
    const price = document.getElementById('ev-price')?.value;
    const desc  = document.getElementById('ev-desc')?.value || 'Your description will appear here...';
    const emoji = document.getElementById('ev-emoji')?.value || '🎵';

    document.getElementById('prev-emoji').textContent = emoji;
    document.getElementById('prev-name').textContent  = name || 'Your Event Name';
    document.getElementById('prev-cat').textContent   = cat ? catLabel(cat) : 'Category';
    document.getElementById('prev-date').textContent  = date ? '📅 ' + formatDate(date) + (time ? ' at ' + formatTime(time) : '') : '📅 Date & Time';
    document.getElementById('prev-loc').textContent   = '📍 ' + (loc || 'Location');
    document.getElementById('prev-price').textContent = price !== undefined && price !== '' ? (price == 0 ? '💰 FREE' : '💰 ₹' + price) : '💰 Price';
    document.getElementById('prev-desc').textContent  = desc || 'Your description will appear here...';
}

function createEvent() {
    // clear errors
    ['ev-name', 'ev-cat', 'ev-date', 'ev-loc', 'ev-desc'].forEach(id => {
        const el = document.getElementById(id + '-err') || document.getElementById(id.replace('ev-','ev-') + '-err');
        if (el) el.textContent = '';
    });

    const name  = document.getElementById('ev-name').value.trim();
    const cat   = document.getElementById('ev-cat').value;
    const date  = document.getElementById('ev-date').value;
    const time  = document.getElementById('ev-time').value;
    const loc   = document.getElementById('ev-location').value.trim();
    const price = parseInt(document.getElementById('ev-price').value) || 0;
    const seats = parseInt(document.getElementById('ev-seats').value) || 100;
    const desc  = document.getElementById('ev-desc').value.trim();
    const emoji = document.getElementById('ev-emoji').value;

    let valid = true;

    if (!name) { document.getElementById('ev-name-err').textContent = 'Please enter an event name!'; valid = false; }
    if (!cat)  { document.getElementById('ev-cat-err').textContent  = 'Please pick a category!'; valid = false; }
    if (!date) { document.getElementById('ev-date-err').textContent = 'Please pick a date!'; valid = false; }
    if (!loc)  { document.getElementById('ev-loc-err').textContent  = 'Please enter a location!'; valid = false; }
    if (!desc) { document.getElementById('ev-desc-err').textContent = 'Please write a description!'; valid = false; }

    if (!valid) {
        showToast('Please fill in all required fields!', 'error');
        return;
    }

    // check date is not in the past
    if (new Date(date) < new Date()) {
        document.getElementById('ev-date-err').textContent = 'Date cannot be in the past!';
        showToast('Date cannot be in the past!', 'error');
        return;
    }

    const newEvent = {
        id: nextId++,
        name, category: cat, date, time, location: loc,
        price, seats, registered: 0,
        description: desc, emoji,
        featured: false,
        createdByMe: true
    };

    events.unshift(newEvent);
    resetForm();
    showToast('🎉 Event created successfully!', 'success');

    setTimeout(() => showSection('myevents'), 800);
}

function resetForm() {
    ['ev-name', 'ev-price', 'ev-seats', 'ev-location', 'ev-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('ev-cat').value  = '';
    document.getElementById('ev-date').value = '';
    document.getElementById('ev-time').value = '';
    document.getElementById('ev-emoji').value = '🎵';
    document.querySelectorAll('.emoji-opt').forEach((e, i) => {
        e.classList.toggle('selected', i === 0);
    });
    selectedEmoji = '🎵';
    ['ev-name-err','ev-cat-err','ev-date-err','ev-loc-err','ev-desc-err'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
    updatePreview();
}

// =====================
//  CONTACT FORM
// =====================
function sendMessage() {
    const name = document.getElementById('c-name').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const msg = document.getElementById('c-msg').value.trim();

    if (!name || !email || !msg) {
        showToast('Please fill in all fields!', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email!', 'error');
        return;
    }

    document.getElementById('c-name').value = '';
    document.getElementById('c-email').value = '';
    document.getElementById('c-msg').value = '';

    showToast('✉️ Message sent! I will reply soon :)', 'success');
}

// =====================
//  TOAST
// =====================
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => toast.classList.remove('show'), 3200);
}

// =====================
//  HELPERS
// =====================
function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    return `${hr12}:${m} ${ampm}`;
}

function catLabel(cat) {
    const map = { music: '🎵 Music', tech: '💻 Tech', food: '🍕 Food', sports: '⚽ Sports', art: '🎨 Art' };
    return map[cat] || cat;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
