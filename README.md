```markdown
# Code Learning Hub

A progressive web application for learning web development and programming languages. Users can browse courses, track their progress, and customize their experience with themes, font sizes, and language preferences. All settings and progress are saved locally, with optional cloud synchronization when signed in.

## Features

- 📚 **Multi‑course platform** – Start with HTML5, more courses coming soon.
- 🎨 **Personalization** – Light/dark/high contrast modes, adjustable font size, language selection (EN/FR/AR).
- 🔔 **Notification system** – In‑app messages with configurable importance levels.
- 📤 **Export data** – Save your settings and progress as PDF, CSV, or JSON.
- 📱 **Progressive Web App** – Installable on desktop and mobile, works offline.
- 🔐 **Optional user accounts** – Sign in with email/password or Google to sync your data across devices.
- ☁️ **Cloud sync** – When signed in, your settings and lesson progress are automatically synchronized with Supabase. Changes made offline are queued and uploaded when you’re back online.
- 📈 **Lesson progress tracking** – Mark lessons as completed, see chapter and overall course progress.

## Technologies Used

- HTML5, CSS3 (custom properties, responsive design)
- Vanilla JavaScript (ES6+)
- [Supabase](https://supabase.com/) – Authentication and cloud database (PostgreSQL)
- Service Worker – Offline caching and PWA capabilities
- Netlify – Hosting and deployment

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- No server‑side setup required – the app runs entirely on the client.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/nadhem000/code-learning-hub.git
   cd code-learning-hub
   ```

2. Serve the files using any local web server (e.g., `npx serve` or VS Code Live Server).

3. Open `index.html` in your browser.

### Configuration (Optional)

If you want to use your own Supabase instance:

- Replace the `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `scripts/supabase.js` with your project credentials.
- Ensure the required tables (`user_settings`, `user_progress`) exist (see SQL in the project documentation).

## How to Use

### Anonymous Mode
- All features work without signing in. Your settings and progress are saved in your browser’s `localStorage`.
- Data is not shared across devices.

### Sign In / Sign Up
- Click the hamburger menu in the header, then **Sign In**.
- Use email/password or **Continue with Google**.
- After signing in, your local data is merged with any existing cloud data (the newest version wins).
- Subsequent changes are synced in real time when online, or queued when offline.

### Synchronization
- When signed in, every change to settings or lesson progress is sent to Supabase.
- If you’re offline, changes are stored locally and automatically uploaded when the connection is restored.
- Logging out does **not** delete local data – you can continue working anonymously.

## Project Structure

```
code-learning-hub/
├── index.html                # Home page
├── about.html                # About page
├── privacy.html              # Privacy policy
├── terms.html                # Terms of service
├── card-html.html            # HTML course overview
├── DHE-cardHtml-*.html       # Individual lesson pages
├── offline.html              # Fallback page when offline
├── styles/                   # CSS files
│   └── main.css              # Global styles (also includes modal styles)
├── scripts/
│   ├── supabase.js           # Supabase client & auth helpers
│   ├── auth.js               # Authentication modal UI (placeholder logic)
│   ├── dataSync.js           # Central data sync module (local + cloud)
│   ├── translations.js       # i18n system
│   ├── notifications.js      # Notification manager
│   ├── modes.js              # Light/dark/highcontrast mode
│   ├── screen.js             # Fullscreen management
│   ├── font.js               # Font size scaling
│   ├── export.js             # Export to PDF/CSV/TXT
│   ├── options.js            # Hamburger menu & toggle buttons
│   └── lessonProgress.js     # Lesson progress logic (shared)
├── assets/                   # Icons and images
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker
├── netlify.toml              # Netlify deployment config
└── README.md                 # This file
```

## Browser Support

The app targets modern browsers that support:
- CSS Custom Properties
- Fetch API
- Service Workers
- LocalStorage
- ES6 modules (though the code is bundled via classic scripts)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons from [Flaticon](https://www.flaticon.com/)
- Hosting and continuous deployment by [Netlify](https://www.netlify.com/)
- Backend and authentication by [Supabase](https://supabase.com/)
```