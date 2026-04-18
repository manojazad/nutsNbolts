export const toSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export const fromSlug = (slug: string): string => {
  return slug.replace(/-/g, " ");
};
