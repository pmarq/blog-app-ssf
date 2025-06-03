export const validateUrl = (url: string) => {
  if (!url.trim()) return "";

  let finalUrl;

  try {
    finalUrl = new URL(url);
  } catch {
    finalUrl = new URL("http://" + url);
  }

  return finalUrl.origin;
};
