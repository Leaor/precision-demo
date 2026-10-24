import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/barlow-semi-condensed/latin-500.css";
import "@fontsource/barlow-semi-condensed/latin-600.css";
import "@fontsource/barlow-semi-condensed/latin-700.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root")!;
const app = <App path={window.location.pathname} />;
if (root.children.length) hydrateRoot(root, app);
else createRoot(root).render(app);
