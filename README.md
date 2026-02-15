# Code Learning Hub

An interactive, client‑side web application for learning web development and programming languages.  
Built with **HTML5**, **CSS3**, and **Vanilla JavaScript** – no frameworks, no build steps, just open and learn.

## 🚀 Features

- **Multilingual Interface** – English, French, and Arabic (with RTL support)
- **Accessibility First** – High contrast mode, keyboard navigation, ARIA labels
- **Theme Switching** – Light, Dark, and High Contrast modes
- **Font Size Controls** – Increase, decrease, or reset text size
- **Fullscreen Mode** – Distraction‑free learning
- **Notifications System** – User‑friendly pop‑up messages
- **Data Export** – Export your progress as PDF, CSV (Sheet), or TXT
- **Local Storage** – Progress and preferences saved in your browser
- **Modular Architecture** – Shared header/footer, page‑specific scripts
- **Courses Outline** – Structured HTML5 course with chapters and lessons (more coming soon)

## 🛠️ Technologies

- **HTML5** – Semantic markup, accessibility (ARIA)
- **CSS3** – Flexbox, Grid, custom properties, responsive design
- **Vanilla JavaScript** – No external dependencies (except a few CDN libraries like Highlight.js for code blocks)
- **LocalStorage API** – Persist user settings and progress
- **i18n** – Custom translation system with per‑page JSON objects

## 📂 Project Structure

```
code-learning-hub/
├── assets/               # Icons, images, fonts
├── scripts/              # Global JavaScript modules
│   ├── translations.js   # Translation manager
│   ├── notifications.js  # Notification system
│   ├── modes.js          # Theme switching
│   ├── screen.js         # Fullscreen logic
│   ├── font.js           # Font size controls
│   ├── export.js         # Data export handlers
│   └── options.js        # Dropdown interactions
├── styles/               # CSS files (main.css + page‑specific)
├── *.html                # All pages (index, about, terms, privacy, courses)
└── README.md
```

## 🌍 Internationalization

All text is stored in `window.DHEtranslations` per language and page.  
The active language is stored in `localStorage` and applied immediately.  
Pages automatically load the correct strings based on the `data-i18n` attributes.


## 📄 License

This project is open source and available under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

## 👤 Author

**Mejri Ziad**  
Full‑stack developer & educator from Tunisia.  
Passionate about making coding education accessible to everyone.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/nadhem000/code-learning-hub/issues).

## ⭐ Support

If you find this project helpful, please give it a ⭐ on GitHub!  
Your support encourages further development.

---

**Happy Coding!** 🎉