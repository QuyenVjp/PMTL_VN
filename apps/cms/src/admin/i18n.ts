export type LocalizedText = {
  en: string;
  vi: string;
};

export function t(vi: string, en: string): LocalizedText {
  return {
    en,
    vi,
  };
}
