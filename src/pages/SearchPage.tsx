import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useData";
import { toSlug } from "../utils/slug";
import { getCategoryIcon } from "../utils/categoryMeta";
import { HiMagnifyingGlass, HiXMark, HiChevronDown, HiChevronRight } from "react-icons/hi2";

const SearchPage = () => {
  const { products, loading } = useProducts();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());

  const toggleCat = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Flatten all products for search
  const allProducts = useMemo(() => {
    return products.flatMap((cat) =>
      cat.subCategories.flatMap((sc) =>
        sc.productTypes.map((pt) => ({
          id: pt.id,
          name: pt.name,
          slug: toSlug(pt.name),
          categoryId: cat.id,
          categoryName: cat.name,
          subCategoryId: sc.id,
          subCategoryName: sc.name,
        }))
      )
    );
  }, [products]);

  // Filter
  const filtered = useMemo(() => {
    let results = allProducts;
    if (selectedCategory) {
      results = results.filter((p) => p.categoryId === selectedCategory);
    }
    if (selectedSubCategory) {
      results = results.filter((p) => p.subCategoryId === selectedSubCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.subCategoryName.toLowerCase().includes(q)
      );
    }
    return results;
  }, [allProducts, selectedCategory, selectedSubCategory, query]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setQuery("");
  };

  const selectCategory = (id: number) => {
    setSelectedCategory(selectedCategory === id ? null : id);
    setSelectedSubCategory(null);
    if (!expandedCats.has(id)) toggleCat(id);
  };

  const selectSubCategory = (catId: number, subId: number) => {
    setSelectedCategory(catId);
    setSelectedSubCategory(selectedSubCategory === subId ? null : subId);
  };

  /* ── Skeleton ── */
  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-4 gap-6 mt-6">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="col-span-3 space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Search Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          {allProducts.length} products across {products.length} categories
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product name, category, or subcategory..."
          className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <HiXMark className="text-xl" />
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* ── Left: Filter Panel ── */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-4 border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Categories</h3>
              {(selectedCategory || selectedSubCategory) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-secondaryBrown hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
              {products.map((cat) => {
                const isExpanded = expandedCats.has(cat.id);
                const isCatSelected = selectedCategory === cat.id;

                return (
                  <div key={cat.id} className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => {
                        selectCategory(cat.id);
                        if (!isExpanded) toggleCat(cat.id);
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isCatSelected && !selectedSubCategory
                          ? "bg-secondaryBrown/5 text-secondaryBrown font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCat(cat.id);
                        }}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {isExpanded ? (
                          <HiChevronDown className="text-xs" />
                        ) : (
                          <HiChevronRight className="text-xs" />
                        )}
                      </span>
                      <span className="truncate flex-1">{cat.name}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {cat.subCategories.reduce((s, sc) => s + sc.productTypes.length, 0)}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="bg-gray-50/50">
                        {cat.subCategories.map((sc) => (
                          <button
                            key={sc.id}
                            onClick={() => selectSubCategory(cat.id, sc.id)}
                            className={`w-full text-left pl-10 pr-4 py-2 text-xs hover:bg-gray-100 transition-colors ${
                              selectedSubCategory === sc.id
                                ? "text-secondaryBrown font-semibold bg-secondaryBrown/5"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="truncate">{sc.name}</span>
                            <span className="float-right text-gray-400">
                              {sc.productTypes.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ── Right: Results List ── */}
        <div className="flex-1 min-w-0">
          {/* Active filters + count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">
                {filtered.length} result{filtered.length !== 1 && "s"}
              </span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-secondaryBrown/10 text-secondaryBrown text-xs font-medium px-2.5 py-1 rounded-full">
                  {products.find((c) => c.id === selectedCategory)?.name}
                  <HiXMark
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSubCategory(null);
                    }}
                  />
                </span>
              )}
              {selectedSubCategory && (
                <span className="inline-flex items-center gap-1 bg-secondaryBrown/10 text-secondaryBrown text-xs font-medium px-2.5 py-1 rounded-full">
                  {products
                    .flatMap((c) => c.subCategories)
                    .find((sc) => sc.id === selectedSubCategory)?.name}
                  <HiXMark
                    className="cursor-pointer"
                    onClick={() => setSelectedSubCategory(null)}
                  />
                </span>
              )}
            </div>
          </div>

          {/* Mobile filter (category select) */}
          <div className="md:hidden mb-4">
            <select
              value={selectedCategory ?? ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : null;
                setSelectedCategory(v);
                setSelectedSubCategory(null);
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">All Categories</option>
              {products.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product list */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <HiMagnifyingGlass className="text-4xl mx-auto mb-3" />
              <p className="text-lg">No products found</p>
              <p className="text-sm mt-1">Try a different search term or clear filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-secondaryBrown text-sm font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-100 bg-white hover:border-secondaryBrown hover:shadow-sm transition-all group"
                >
                  <span className="text-xl flex-shrink-0">
                    {getCategoryIcon(p.categoryId)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-secondaryBrown transition-colors truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {p.categoryName} → {p.subCategoryName}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    PT-{p.id}
                  </span>
                  <span className="text-xs bg-secondaryBrown text-white px-3 py-1.5 rounded font-medium flex-shrink-0 group-hover:bg-opacity-90 transition-colors">
                    Get Quote
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
