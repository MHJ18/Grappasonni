export const APPEARANCE_KEY = "grappasonni-appearance-v1";
export type Appearance = {
  colorMode: "dark" | "light";
  designMode: "heritage" | "contemporary";
  hero: "classic" | "cinematic";
  gallery: "ring" | "elastic";
  motion: boolean;
  offers: boolean;
};
export const defaultAppearance: Appearance = {
  colorMode: "dark",
  designMode: "heritage",
  hero: "classic",
  gallery: "ring",
  motion: true,
  offers: true,
};
export function readAppearance(raw: string | null): Appearance {
  try {
    const value = JSON.parse(raw || "{}");
    if (!value || typeof value !== "object") return { ...defaultAppearance };
    return {
      colorMode: value.colorMode === "light" ? "light" : "dark",
      designMode:
        value.designMode === "contemporary" ? "contemporary" : "heritage",
      hero: value.hero === "cinematic" ? "cinematic" : "classic",
      gallery: value.gallery === "elastic" ? "elastic" : "ring",
      motion: typeof value.motion === "boolean" ? value.motion : true,
      offers: typeof value.offers === "boolean" ? value.offers : true,
    };
  } catch {
    return { ...defaultAppearance };
  }
}
