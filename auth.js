// =============================================
//  auth.js — Firebase Authentication
//  Handles login, signup, Google, logout
//  Works alongside app.js without breaking it!
// =============================================

// --- Firebase config ---
const firebaseConfig = {
    apiKey: "AIzaSyCwbHSfLk9mF1DdShfeOeuZ32swk6qAdqc",
    authDomain: "eventmanagement-2a30a.firebaseapp.com",
    projectId: "eventmanagement-2a30a",
    storageBucket: "eventmanagement-2a30a.firebasestorage.app",
    messagingSenderId: "620682387906",
    appId: "1:620682387906:web:56f684258fd5a95c50f65b",
    measurementId: "G-RQHJGK65RS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Google provider setup
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Current logged-in user (shared with app.js via window)
window.currentUser = null;

// =============================================
//  AUTH STATE LISTENER
//  Fires whenever login/logout happens
// =============================================
auth.onAuthStateChanged(function(user) {
    window.currentUser = user;

    if (user) {
        // --- User is logged IN ---
        const name      = user.displayName || user.email.split('@')[0];
        const initials  = getInitials(name);
        const email     = user.email;

        // Update navbar avatar
        document.getElementById('nav-avatar').textContent      = initials;
        document.getElementById('nav-username').textContent    = name.split(' ')[0]; // first name only
        document.getElementById('dd-avatar').textContent       = initials;
        document.getElementById('dd-name').textContent         = name;
        document.getElementById('dd-email').textContent        = email;

        // Show user UI, hide guest UI
        document.getElementById('nav-guest').style.display = 'none';
        document.getElementById('nav-user').style.display  = 'flex';

        // Pre-fill contact form with user's name/email
        const cName  = document.getElementById('c-name');
        const cEmail = document.getElementById('c-email');
        if (cName  && !cName.value)  cName.value  = name;
        if (cEmail && !cEmail.value) cEmail.value = email;

        // Close auth modal if open
        closeAuthModal();

    } else {
        // --- User is logged OUT ---
        document.getElementById('nav-guest').style.display = 'flex';
        document.getElementById('nav-user').style.display  = 'none';
        window.currentUser = null;
    }
});

// =============================================
//  OPEN / CLOSE AUTH MODAL
// =============================================
function openAuthModal(form) {
    switchForm(form || 'login');
    document.getElementById('auth-overlay').classList.add('open');
    // clear any previous errors
    document.getElementById('login-err').textContent  = '';
    document.getElementById('signup-err').textContent = '';
}

function closeAuthModal() {
    document.getElementById('auth-overlay').classList.remove('open');
}

function switchForm(name) {
    document.getElementById('form-login').style.display  = 'none';
    document.getElementById('form-signup').style.display = 'none';
    document.getElementById('form-verify').style.display = 'none';
    document.getElementById('form-' + name).style.display = 'block';
}

// =============================================
//  EMAIL / PASSWORD LOGIN
// =============================================
function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pw    = document.getElementById('login-pw').value;
    const errEl = document.getElementById('login-err');
    errEl.textContent = '';

    if (!email || !pw) {
        errEl.textContent = '⚠️ Please fill in both fields!';
        return;
    }

    // Show loading state
    const btn = document.querySelector('#form-login .auth-btn');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    auth.signInWithEmailAndPassword(email, pw)
        .then(function(result) {
            btn.textContent = 'Login 🚀';
            btn.disabled = false;
            showToast('👋 Welcome back, ' + (result.user.displayName || 'friend') + '!', 'success');
        })
        .catch(function(err) {
            btn.textContent = 'Login 🚀';
            btn.disabled = false;
            errEl.textContent = friendlyError(err.code);
        });
}

// =============================================
//  EMAIL / PASSWORD SIGNUP
// =============================================
function doSignup() {
    const name  = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const pw    = document.getElementById('signup-pw').value;
    const errEl = document.getElementById('signup-err');
    errEl.textContent = '';

    if (!name) { errEl.textContent = '⚠️ Please enter your name!'; return; }
    if (!email) { errEl.textContent = '⚠️ Please enter your email!'; return; }
    if (!pw || pw.length < 6) { errEl.textContent = '⚠️ Password must be at least 6 characters!'; return; }

    const btn = document.querySelector('#form-signup .auth-btn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    auth.createUserWithEmailAndPassword(email, pw)
        .then(function(result) {
            // Save display name to Firebase profile
            return result.user.updateProfile({ displayName: name })
                .then(function() {
                    // Send email verification
                    return result.user.sendEmailVerification();
                })
                .then(function() {
                    btn.textContent = 'Create Account 🎊';
                    btn.disabled = false;
                    // Clear fields
                    document.getElementById('signup-name').value  = '';
                    document.getElementById('signup-email').value = '';
                    document.getElementById('signup-pw').value    = '';
                    // Show verify notice
                    switchForm('verify');
                });
        })
        .catch(function(err) {
            btn.textContent = 'Create Account 🎊';
            btn.disabled = false;
            errEl.textContent = friendlyError(err.code);
        });
}

// =============================================
//  GOOGLE LOGIN
// =============================================
function loginWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .then(function(result) {
            showToast('🎉 Welcome, ' + result.user.displayName + '!', 'success');
        })
        .catch(function(err) {
            if (err.code === 'auth/popup-closed-by-user') return; // user closed popup, no error needed
            showToast('Google sign-in failed: ' + friendlyError(err.code), 'error');
        });
}

// =============================================
//  LOGOUT
// =============================================
function logoutUser() {
    closeUserMenu();
    auth.signOut()
        .then(function() {
            showToast('👋 Logged out! See you next time!', 'info');
            showSection('home');
        })
        .catch(function(err) {
            showToast('Logout failed, try again!', 'error');
        });
}

// =============================================
//  REQUIRE AUTH GUARD
//  Call this before any action that needs login
//  Usage: requireAuth(() => showSection('create'))
// =============================================
function requireAuth(callback) {
    if (window.currentUser) {
        callback();
    } else {
        openAuthModal('login');
        showToast('Please login first! 🔐', 'info');
    }
}

// =============================================
//  USER DROPDOWN MENU
// =============================================
function toggleUserMenu() {
    const dd = document.getElementById('user-dropdown');
    dd.classList.toggle('open');
}

function closeUserMenu() {
    document.getElementById('user-dropdown').classList.remove('open');
}

// Close dropdown if user clicks anywhere else on the page
document.addEventListener('click', function(e) {
    const wrap = document.querySelector('.user-avatar-wrap');
    const dd   = document.getElementById('user-dropdown');
    if (dd && wrap && !wrap.contains(e.target) && !dd.contains(e.target)) {
        dd.classList.remove('open');
    }
});

// =============================================
//  PASSWORD TOGGLE (show/hide)
// =============================================
function togglePw(inputId, eyeBtn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        eyeBtn.textContent = '🙈';
    } else {
        input.type = 'password';
        eyeBtn.textContent = '👁️';
    }
}

// =============================================
//  HELPERS
// =============================================
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Turn Firebase error codes into friendly messages
function friendlyError(code) {
    const map = {
        'auth/invalid-email':             '⚠️ That email address looks wrong!',
        'auth/user-not-found':            '⚠️ No account with that email. Sign up first!',
        'auth/wrong-password':            '⚠️ Wrong password. Try again!',
        'auth/invalid-credential':        '⚠️ Wrong email or password!',
        'auth/email-already-in-use':      '⚠️ That email is already registered. Login instead!',
        'auth/weak-password':             '⚠️ Password is too weak. Use at least 6 characters!',
        'auth/too-many-requests':         '⚠️ Too many tries! Wait a bit and try again.',
        'auth/network-request-failed':    '⚠️ Network error. Check your internet connection!',
        'auth/popup-blocked':             '⚠️ Popup was blocked. Please allow popups for this site!',
        'auth/cancelled-popup-request':   '',
    };
    return map[code] || '⚠️ Something went wrong: ' + code;
}
