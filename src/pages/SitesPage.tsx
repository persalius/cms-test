import { useEffect, useState } from "react";
import { getSites, type SiteType } from "../lib/siteManager";
import { Link } from "react-router-dom";

export default function SitesPage() {
  const [sites, setSites] = useState<SiteType[]>([]);

  useEffect(() => {
    getSites().then(setSites);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>My Sites</h1>
      <button style={{ marginBottom: 24 }}>+ Create New Site</button>
      <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sites.map((site) => (
          <li key={site.id}>
            <strong>{site.name}</strong>{" "}
            <Link to={`/editor/${site.id}`} style={{ color: "blue" }}>
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
