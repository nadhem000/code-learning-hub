// scripts/auth.js – Authentication UI (modal) and real Supabase integration
// Depends on: supabase.js, translations.js, notifications.js
(function() {
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

        // Sign Out button – real implementation
        const signOutBtn = document.getElementById('authSignOutBtn');
        if (signOutBtn) {
            signOutBtn.addEventListener('click', async () => {
                try {
                    await window.DHESupabase.signOut();
                    // UI will update via onAuthStateChange listener
                } catch (error) {
                    showNotification('signOutError', 'notifications.signOutError', 'Sign out failed. Please try again.', 'error');
                }
            });
        }

        // Check current user on load and update UI
        updateAuthUI();

        // Listen for auth changes (sign in/out) from Supabase
        window.DHESupabase.onAuthStateChange((event, session) => {
            updateAuthUI();
            // The dataSync module already listens to this, so it will handle syncing.
        });
    }

    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'DHE-auth-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="DHE-auth-modal-content">
                <span class="DHE-auth-close">&times;</span>
                <h2 id="authModalTitle" data-i18n="index.auth.signInTitle">Sign In</h2>
                <form id="authForm">
                    <input type="email" id="authEmail" placeholder="Email" required autocomplete="email">
                    <input type="password" id="authPassword" placeholder="Password" required autocomplete="current-password">
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

        closeBtn.addEventListener('click', () => hideModal(modal));
        window.addEventListener('click', (event) => {
            if (event.target === modal) hideModal(modal);
        });

        authToggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            updateModalTexts(isSignUpMode, authModalTitle, authSubmitBtn, authToggleLink);
        });

        // Form submission – real Supabase calls
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;

            try {
                if (isSignUpMode) {
                    // SIGN UP
                    const { data, error } = await window.DHESupabase.signUp(email, password);
                    if (error) throw error;

                    // If email confirmation is enabled, show a message
                    if (data?.user?.identities?.length === 0) {
                        // User already registered but not confirmed? Usually Supabase returns an error in that case.
                        // For safety, we handle generic success.
                    }
                    showNotification('signUpSuccess', 'notifications.signUpSuccess', 'Sign up successful! Please check your email to confirm your account.', 'success');
                    hideModal(modal);
                } else {
                    // SIGN IN
                    const { data, error } = await window.DHESupabase.signIn(email, password);
                    if (error) throw error;

                    showNotification('signInSuccess', 'notifications.signInSuccess', 'Signed in successfully!', 'success');
                    hideModal(modal);
                }
            } catch (error) {
                console.error('Auth error:', error);
                let message = error.message || 'Authentication failed.';
                // Show user-friendly translation if available
                showNotification('authError', null, message, 'error');
            }
        });

        // Google sign-in
        googleBtn.addEventListener('click', async () => {
            try {
                const { error } = await window.DHESupabase.client.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin // or a specific callback URL
                    }
                });
                if (error) throw error;
                // The OAuth redirect will leave the page, so no need to close modal here
            } catch (error) {
                console.error('Google sign-in error:', error);
                showNotification('googleAuthError', null, error.message, 'error');
            }
        });

        // Update texts when language changes
        document.addEventListener('languageChanged', () => {
            updateModalTexts(isSignUpMode, authModalTitle, authSubmitBtn, authToggleLink);
        });
    }

    function updateModalTexts(isSignUpMode, titleEl, submitBtnEl, toggleLinkEl) {
        if (!window.DHEIndexTranslator) return;
        const t = window.DHEIndexTranslator;
        if (isSignUpMode) {
            titleEl.textContent = t.getTranslation('index.auth.signUpTitle') || 'Sign Up';
            submitBtnEl.textContent = t.getTranslation('index.auth.signUpTitle') || 'Sign Up';
            toggleLinkEl.textContent = t.getTranslation('index.auth.haveAccount') || 'Already have an account? Sign In';
        } else {
            titleEl.textContent = t.getTranslation('index.auth.signInTitle') || 'Sign In';
            submitBtnEl.textContent = t.getTranslation('index.auth.signIn') || 'Sign In';
            toggleLinkEl.textContent = t.getTranslation('index.auth.noAccount') || "Don't have an account? Sign Up";
        }
    }

    function showModal(modal) {
        const titleEl = modal.querySelector('#authModalTitle');
        const submitBtnEl = modal.querySelector('#authSubmitBtn');
        const toggleLinkEl = modal.querySelector('#authToggleLink');
        // Reset to Sign In mode every time modal opens
        updateModalTexts(false, titleEl, submitBtnEl, toggleLinkEl);
        modal.style.display = 'block';
    }

    function hideModal(modal) {
        modal.style.display = 'none';
    }

    // Update header UI based on current user
    async function updateAuthUI() {
        try {
            const { data: { user } } = await window.DHESupabase.getCurrentUser();
            const signInBtn = document.getElementById('authSignInBtn');
            const signOutBtn = document.getElementById('authSignOutBtn');
            const userEmailSpan = document.getElementById('authUserEmail');

            if (user) {
                // User is signed in
                if (signInBtn) signInBtn.style.display = 'none';
                if (signOutBtn) signOutBtn.style.display = 'inline-block';
                if (userEmailSpan) {
                    userEmailSpan.textContent = user.email;
                    userEmailSpan.style.display = 'inline';
                }
            } else {
                // No user
                if (signInBtn) signInBtn.style.display = 'inline-block';
                if (signOutBtn) signOutBtn.style.display = 'none';
                if (userEmailSpan) userEmailSpan.style.display = 'none';
            }
        } catch (error) {
            console.warn('Failed to update auth UI:', error);
        }
    }

    function showNotification(id, translationKey, fallback, type) {
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.show(id, translationKey, fallback, type);
        } else {
            alert(fallback); // fallback if notifications not available
        }
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }
})();
