import Link from "next/link";
import { NoticiasView } from "./NoticiasView";

export const metadata = {
  title: "Noticias Globales · Atlas Astrológico",
  description: "Las 10 noticias más relevantes de octubre 2026 sobre el fondo de eventos celestes 2019–2030.",
};

export default function NoticiasPage() {
  return (
    <main className="clockPage">
      <header className="clockHead">
        <div className="brand">
          <span className="brandMark">✳</span>
          <span>ATLAS <small>ASTROLÓGICO</small></span>
        </div>
        <nav className="headNav">
          <Link href="/" className="navLink">Carta Astrológica</Link>
          <span className="navLink navLinkSel">Noticias</span>
        </nav>
      </header>

      <NoticiasView />

      <footer>
        Noticias tomadas de news-world.md (resúmenes anuales 2019–2026). Las fechas de eventos
        prolongados ("Throughout…") se aproximan a un día representativo.{" "}
        <strong>Eventos celestes calculados con Astronomy Engine; la superposición es
        exploratoria, no una medición de causalidad.</strong>
      </footer>
    </main>
  );
}
