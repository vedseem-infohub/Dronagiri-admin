export function getOptimizedImageUrl(url, { width = 120, quality = "auto" } = {}) {
  if (!url || typeof url !== "string") return "";

  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    if (url.includes("/f_auto") || url.includes("f_auto,") || url.includes("/q_auto")) {
      return url;
    }
    return url.replace("/upload/", `/upload/f_auto,q_${quality},w_${width}/`);
  }

  return url;
}
