"use client";

import { useEffect } from "react";
import { GLOSSARY } from "./glossary";

export function ConceptSidebar({
  conceptId, onClose, onNavigate,
}: {
  conceptId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  useEffect(() => {
    if (!conceptId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [conceptId, onClose]);

  const concept = conceptId ? GLOSSARY.find(c => c.id === conceptId) : null;
  if (!concept) return null;

  const related = (concept.related ?? [])
    .map(id => GLOSSARY.find(c => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <div className="sidebarBackdrop" onClick={onClose} />
      <aside className="conceptSidebar" role="dialog" aria-label={concept.title}>
        <div className="conceptSidebarHead">
          <span className="eyebrow">{concept.group.toUpperCase()}</span>
          <button className="conceptSidebarClose" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className="conceptSidebarTitle">
          <span className="conceptSymbol">{concept.symbol}</span>
          <h2>{concept.title}</h2>
        </div>
        <div className="conceptSidebarBody">
          {concept.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {related.length > 0 && (
          <div className="conceptRelated">
            <span className="eyebrow" style={{ display: "block", marginBottom: 10 }}>VER TAMBIÉN</span>
            <div className="conceptRelatedChips">
              {related.map(r => (
                <button key={r.id} className="conceptChip" onClick={() => onNavigate(r.id)}>
                  {r.symbol} {r.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
