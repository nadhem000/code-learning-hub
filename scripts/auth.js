// scripts/auth.js – Authentication UI (modal) and placeholder logic
// Depends on: supabase.js, translations.js, notifications.js (optional)

(function() {
    // Wait for DOM and translator to be ready
    function initAuth() {
        const signInBtn = document.getElementById('authSignInBtn');
        if (!signInBtn) return; // No auth UI on this page

        // Create modal if not already present
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = createModal();
            document.body.appendChild(modal);
            attachModalEvents(modal);
        }

        // Open modal on Sign In button click
        signInBtn.addEventListener('click', () => {
            showModal(modal);
        });

        // Sign Out button placeholder (will be handled later)
        const signOutBtn = document.getElementById('authSignOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', () => {
                alert('Sign out not yet implemented (Step 03).');
            });
        }
    }

    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'DHE-auth-modal';
        modal.style.display = 'none'; // hidden by default
        modal.innerHTML = `
            <div class="DHE-auth-modal-content">
                <span class="DHE-auth-close">&times;</span>
                <h2 id="authModalTitle" data-i18n="index.auth.signInTitle">Sign In</h2>
                <form id="authForm">
                    <input type="email" id="authEmail" placeholder="Email" required>
                    <input type="password" id="authPassword" placeholder="Password" required>
                    <button type="submit" id="authSubmitBtn" data-i18n="index.auth.signIn">Sign In</button>
                </form>
                <p>
                    <a href="#" id="authToggleLink" data-i18n="index.auth.noAccount">Don't have an account? Sign Up</a>
                </p>
                <hr>
                <button id="authGoogleBtn" data-i18n="index.auth.continueWithGoogle">Continue with Google</button>
            </div>
        `;
        return modal;
    }

    function attachModalEvents(modal) {
        const closeBtn = modal.querySelector('.DHE-auth-close');
        const authToggleLink = modal.querySelector('#authToggleLink');
        const authForm = modal.querySelector('#authForm');
        const authModalTitle = modal.querySelector('#authModalTitle');
        const authSubmitBtn = modal.querySelector('#authSubmitBtn');
        const googleBtn = modal.querySelector('#authGoogleBtn');

        let isSignUpMode = false;

        // Close modal when clicking on X or outside
        closeBtn.addEventListener('click', () => hideModal(modal));
        window.addEventListener('click', (event) => {
            if (event.target === modal) hideModal(modal);
        });

        // Toggle between Sign In and Sign Up
        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            updateModalTexts(isSignUpMode, authModalTitle, authSubmitBtn, authToggleLink);
        });

        // Form submission placeholder
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;
            alert(`Auth not yet implemented (Step 03). Mode: ${isSignUpMode ? 'Sign Up' : 'Sign In'}\nEmail: ${email}`);
        });

        // Google button placeholder
        googleBtn.addEventListener('click', () => {
            alert('Google sign-in not yet implemented (Step 03).');
        });

        // Initial translation (in case language changes after modal is created)
        document.addEventListener('languageChanged', () => {
            updateModalTexts(isSignUpMode, authModalTitle, authSubmitBtn, authToggleLink);
        });
    }

    function updateModalTexts(isSignUpMode, titleEl, submitBtnEl, toggleLinkEl) {
        if (!window.DHEIndexTranslator) return;
        const translator = window.DHEIndexTranslator;
        if (isSignUpMode) {
            titleEl.textContent = translator.getTranslation('index.auth.signUpTitle') || 'Sign Up';
            submitBtnEl.textContent = translator.getTranslation('index.auth.signUpTitle') || 'Sign Up';
            toggleLinkEl.textContent = translator.getTranslation('index.auth.haveAccount') || 'Already have an account? Sign In';
        } else {
            titleEl.textContent = translator.getTranslation('index.auth.signInTitle') || 'Sign In';
            submitBtnEl.textContent = translator.getTranslation('index.auth.signIn') || 'Sign In';
            toggleLinkEl.textContent = translator.getTranslation('index.auth.noAccount') || "Don't have an account? Sign Up";
        }
    }

    function showModal(modal) {
        // Ensure translations are up-to-date before showing
        const titleEl = modal.querySelector('#authModalTitle');
        const submitBtnEl = modal.querySelector('#authSubmitBtn');
        const toggleLinkEl = modal.querySelector('#authToggleLink');
        // Reset to Sign In mode every time modal opens (optional)
        updateModalTexts(false, titleEl, submitBtnEl, toggleLinkEl);
        modal.style.display = 'block';
    }

    function hideModal(modal) {
        modal.style.display = 'none';
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }
})();