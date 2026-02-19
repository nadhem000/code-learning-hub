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
                <!-- Sign In Form -->
                <div id="authSignInForm">
                    <h2 id="authModalTitle" data-i18n="index.auth.signInTitle">Sign In</h2>
                    <form id="authForm">
                        <input type="email" id="authEmail" placeholder="Email" required>
                        <input type="password" id="authPassword" placeholder="Password" required>
                        <div style="text-align: right; margin-bottom: 1rem;">
                            <a href="#" id="forgotPasswordLink" data-i18n="index.auth.forgotPassword">Forgot password?</a>
                        </div>
                        <button type="submit" id="authSubmitBtn" data-i18n="index.auth.signIn">Sign In</button>
                    </form>
                    <p>
                        <a href="#" id="authToggleLink" data-i18n="index.auth.noAccount">Don't have an account? Sign Up</a>
                    </p>
                </div>
                <!-- Password Reset Form (initially hidden) -->
                <div id="authResetForm" style="display: none;">
                    <h2 data-i18n="index.auth.resetPassword">Reset Password</h2>
                    <p data-i18n="index.auth.resetPasswordInstructions">Enter your email address and we'll send you a password reset link.</p>
                    <form id="resetForm">
                        <input type="email" id="resetEmail" placeholder="Email" required>
                        <button type="submit" data-i18n="index.auth.sendResetEmail">Send reset email</button>
                    </form>
                    <p>
                        <a href="#" id="backToSignInLink" data-i18n="index.auth.backToSignIn">Back to Sign In</a>
                    </p>
                </div>
            </div>
        `;
        return modal;
    }

    function attachModalEvents(modal) {
        const closeBtn = modal.querySelector('.DHE-auth-close');
        const authToggleLink = modal.querySelector('#authToggleLink');
        const forgotPasswordLink = modal.querySelector('#forgotPasswordLink');
        const backToSignInLink = modal.querySelector('#backToSignInLink');
        const authForm = modal.querySelector('#authForm');
        const resetForm = modal.querySelector('#resetForm');
        const authModalTitle = modal.querySelector('#authModalTitle');
        const authSubmitBtn = modal.querySelector('#authSubmitBtn');
        const authSignInForm = modal.querySelector('#authSignInForm');
        const authResetForm = modal.querySelector('#authResetForm');

        let isSignUpMode = false;

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

        // Show password reset form
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            authSignInForm.style.display = 'none';
            authResetForm.style.display = 'block';
        });

        // Back to Sign In from reset form
        backToSignInLink.addEventListener('click', (e) => {
            e.preventDefault();
            authResetForm.style.display = 'none';
            authSignInForm.style.display = 'block';
        });

        // Sign In / Sign Up form submission
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const password = document.getElementById('authPassword').value;

            try {
                if (isSignUpMode) {
                    // SIGN UP
                    const { data, error } = await window.DHESupabase.signUp(email, password);
                    if (error) throw error;

                    showNotification('signUpSuccess', 'notifications.signUpSuccess', 'Sign up successful!', 'success');
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
                showNotification('authError', null, message, 'error');
            }
        });

        // Password reset form submission
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;

            try {
                const { error } = await window.DHESupabase.client.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password.html', // optional redirect after reset
                });
                if (error) throw error;

                showNotification('resetEmailSent', 'notifications.resetEmailSent', 'Password reset email sent. Check your inbox.', 'success');
                // Optionally switch back to sign in form
                authResetForm.style.display = 'none';
                authSignInForm.style.display = 'block';
            } catch (error) {
                console.error('Reset error:', error);
                let message = error.message || 'Failed to send reset email.';
                showNotification('resetEmailError', null, message, 'error');
            }
        });

        // Update texts when language changes
        document.addEventListener('languageChanged', () => {
            updateModalTexts(isSignUpMode, authModalTitle, authSubmitBtn, authToggleLink);
            // Also update reset form texts (they have data-i18n, so translator will handle them)
            window.DHEIndexTranslator.translatePage();
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
        const authSignInForm = modal.querySelector('#authSignInForm');
        const authResetForm = modal.querySelector('#authResetForm');
        authSignInForm.style.display = 'block';
        authResetForm.style.display = 'none';
        // Reset to Sign In mode every time modal opens
        const titleEl = modal.querySelector('#authModalTitle');
        const submitBtnEl = modal.querySelector('#authSubmitBtn');
        const toggleLinkEl = modal.querySelector('#authToggleLink');
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