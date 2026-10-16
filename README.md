# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Admin API

During local development, Vite proxies admin authentication and user-management API calls to the Spring Boot gateway at `http://localhost:8765` and first-time registration to the user service at `http://localhost:8082`, avoiding browser CORS preflight failures. Set `VITE_API_GATEWAY_URL` or `VITE_INITIAL_USER_API_URL` in the local Vite environment to change the service origins, then restart Vite. In production, configure the deployed API gateway/services to allow the frontend origin or provide equivalent reverse-proxy routes.
