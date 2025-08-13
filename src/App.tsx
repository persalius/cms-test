import { Routes, Route, Navigate } from "react-router-dom";
import SitesPage from "./pages/SitesPage";
import EditorPage from "./pages/EditorPage";
import "./index.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sites" />} />
      <Route path="/sites" element={<SitesPage />} />
      <Route path="/editor/:siteId" element={<EditorPage />} />
    </Routes>
  );
}
