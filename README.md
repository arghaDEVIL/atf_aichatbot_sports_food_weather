# Munch & Match🌦️🍔🏀

A modern weather app that pairs your forecast with delicious food and fun sports recommendations, powered by Google's Gemini AI.

## Features

- 🤖 AI-powered weather information with food and sports recommendations using Google Gemini
- 🎤 Voice recognition for hands-free interaction
- 🌍 Multi-language support (English/Japanese)
- 🎨 Beautiful light/dark theme switching
- 📱 Fully responsive design
- 🚀 Modern Claude-like chat interface with rocket animations
- 
## 🛠️ Tech Stack

-   **Frontend:** Vite, React, TypeScript
-   **Styling:** Tailwind CSS
-   **AI:** Google Generative AI SDK (Gemini)
-   **Icons:** Lucide React
-   **Weather API:** Open-Meteo
## Setup

1. *Install dependencies:*
   bash
   npm install
   

2. *Set up Gemini AI API:*
   - Get your Gemini API key from [Google AI Studio](https://ai.google.dev/)
   - Copy .env.example to .env
   - Add your API key to the .env file:
     
     VITE_GEMINI_API_KEY=your_gemini_api_key_here
     

3. *Run the development server:*
   bash
   npm run dev
   

4. *Open your browser:*
   Navigate to http://localhost:5173 (or the port shown in the terminal)

## Features Overview

### 🤖 AI Chat Assistant
- Powered by Google's Gemini 1.5 Flash model
- Provides weather information with personalized food and sports recommendations
- Contextual responses based on current weather conditions
- Beautiful card-based display with light backgrounds and subtle borders for food and sports sections
- Fallback responses when API key is not provided

### 🎤 Voice Recognition
- Browser-based speech recognition
- Works in supported browsers (Chrome, Edge, Safari)
- Multi-language support
- Clear error messages for troubleshooting

### 🎨 Design & UX
- Modern glassmorphism design
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Dark/light theme toggle
- Claude-inspired chat interface
- Enhanced visual styling with light, bordered sections for food (purple theme) and sports (blue theme) recommendations

### 🌐 Internationalization
- English and Japanese language support
- Dynamic language switching
- Localized error messages

## Browser Compatibility

- *Voice Recognition:* Chrome, Edge, Safari (latest versions)
- *General Usage:* All modern browsers
- *Recommended:* Chrome or Edge for full functionality

## Project Structure


src/
├── components/          # React components
│   ├── chat/           # Chat-related components
│   ├── input/          # Input and form components
│   └── layout/         # Layout components
├── providers/          # React context providers
├── services/           # API and external services
├── utilities/          # Helper functions and hooks
├── models/             # TypeScript interfaces
└── utils/              # General utilities


## Development

- Built with Vite for fast development and building
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons
- Google Generative AI SDK for Gemini integration

## License

MIT License - feel free to use this project for learning and development.

---

## Original Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])


You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

-   **Developed By:** Arghadeep Bosu (https://github.com/arghaDEVIL)
