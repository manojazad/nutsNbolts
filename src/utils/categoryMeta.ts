const CATEGORY_COLORS: Record<number, string> = {
  1: "#3B82F6",  2: "#EF4444",  3: "#F59E0B",  4: "#10B981",
  5: "#6366F1",  6: "#EC4899",  7: "#8B5CF6",  8: "#14B8A6",
  9: "#F97316",  10: "#06B6D4", 11: "#84CC16", 12: "#A855F7",
  13: "#0EA5E9", 14: "#22C55E", 15: "#E11D48", 16: "#D946EF",
  17: "#2563EB", 18: "#DC2626", 19: "#CA8A04", 20: "#059669",
  21: "#4F46E5", 22: "#F59E0B", 23: "#7C3AED", 24: "#0D9488",
  25: "#EA580C", 26: "#0891B2", 27: "#65A30D",
};

const CATEGORY_ICONS: Record<number, string> = {
  1: "📋", 2: "📦", 3: "🔌", 4: "⚡", 5: "🧹", 6: "🪑", 7: "🔧",
  8: "🌿", 9: "⚙️", 10: "🦺", 11: "📏", 12: "💨", 13: "💻", 14: "🔄",
  15: "🧴", 16: "🔥", 17: "🔬", 18: "🚗", 19: "⚡", 20: "🏥", 21: "🚿",
  22: "☀️", 23: "✂️", 24: "🪨", 25: "🔩", 26: "💡", 27: "🔘",
};

export const getCategoryColor = (id: number): string => {
  return CATEGORY_COLORS[id] || "#6B7280";
};

export const getCategoryIcon = (id: number): string => {
  return CATEGORY_ICONS[id] || "📦";
};

