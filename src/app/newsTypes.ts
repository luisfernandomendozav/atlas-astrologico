export type NewsCategory = "politics" | "economics" | "religion" | "science" | "climate" | "society";

export type NewsMarker = {
  id: number;
  headline: string;
  date: string;
  category: NewsCategory;
  summary: string;
  entities?: string[];
  confidence?: "high" | "medium";
};

export const NEWS_COL: Record<string, string> = {
  politics:  "var(--rust)",
  economics: "var(--gold)",
  religion:  "var(--sage)",
  science:   "#7b8ba1",
  climate:   "#9a7b8d",
  society:   "#8c8c84",
};

export const NEWS_LABEL: Record<string, string> = {
  politics: "Política", economics: "Economía", religion: "Religión",
  science: "Ciencia", climate: "Clima y desastres", society: "Sociedad",
};
