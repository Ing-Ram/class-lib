# Class-Lib

A small React + Vite project showing a simple class library UI with pages for library books and students.

## Quick Start

Prerequisites: Node.js (v16+) and npm.

Install dependencies:

```
npm install
```

Run the dev server:

```
npm run dev
```

Build for production:

```
npm run build
```

Preview the production build locally:

```
npm run preview
```

## Project Structure

- `index.html` — app entry
- `vite.config.js` — Vite config
- `package.json` — scripts & deps
- `src/` — React source
  - `components/` — UI components (BookCard, StudentCard, Card)
  - `pages/` — page components (Library, Students)
  - `App.jsx`, `main.jsx` — app bootstrap

## Scripts

- `dev`: Start Vite dev server
- `build`: Create production build
- `preview`: Serve production build locally
- `lint`: Run ESLint

## Contributing

PRs welcome — keep changes small and focused. Run `npm run lint` before submitting.

## License

MIT-style (check repository owner for specifics).
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
