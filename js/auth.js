// ══════════════════════════════════════════════════════════
//  AUTHENTICATION
// ══════════════════════════════════════════════════════════

import { signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export async function signInWithGoogle(auth, provider, toast) {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Sign-in successful:", result.user);
  } catch (err) {
    console.error("Google Sign-in Error:", err.code, err.message);
    if (err.code === "auth/popup-closed-by-user") {
      // User closed the popup, no error needed
      return;
    }
    if (err.code === "auth/operation-not-supported-in-this-environment") {
      toast("Authentication error: Popup blocked or unsupported. Check your browser settings.", "error");
    } else if (err.code === "auth/unauthorized-domain") {
      toast("Authentication error: Domain not authorized. Contact administrator.", "error");
    } else {
      toast("Sign-in failed: " + err.message, "error");
    }
  }
}

export async function handleSignOut(auth, closeModal, toast, APP) {
  await signOut(auth);
  closeModal("user-menu-overlay");
  toast(APP.strings.toastSignout, "info");
}

export function configureGoogleProvider(provider) {
  provider.addScope('profile');
  provider.addScope('email');
  provider.setCustomParameters({ 'prompt': 'select_account' });
  return provider;
}
