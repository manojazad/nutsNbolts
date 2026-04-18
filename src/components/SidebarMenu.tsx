import { HiXMark } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useData";
import { toSlug } from "../utils/slug";
import { getCategoryColor, getCategoryIcon } from "../utils/categoryMeta";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { categories } = useCategories();

  const close = () => setIsSidebarOpen(false);

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={close}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <Link to="/" onClick={close} className="text-xl font-bold tracking-wide">
            Nuts &amp; Bolts
          </Link>
          <button
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Home Link */}
          <div className="px-5 pt-4">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
              onClick={close}
            >
              <span className="w-8 h-8 rounded-lg bg-secondaryBrown/10 flex items-center justify-center text-sm">🏠</span>
              Home
            </Link>
          </div>

          {/* Categories */}
          <div className="px-5 mt-4">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">
              Categories
            </h3>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${toSlug(cat.name)}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors group"
                  onClick={close}
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                    style={{ backgroundColor: `${getCategoryColor(cat.id)}15` }}
                  >
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span className="truncate group-hover:text-secondaryBrown transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 py-4 border-t border-gray-100">
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 w-full bg-secondaryBrown text-white py-2.5 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
            onClick={close}
          >
            Contact
          </Link>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;
