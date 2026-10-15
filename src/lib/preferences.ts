// Shared with the inline script in the root layout, so it must stay free of
// "use client" (a server component can't read constants from a client module).
export const THEME_STORAGE_KEY = "theme";
export const LANG_STORAGE_KEY = "origin_and_oak_lang";
