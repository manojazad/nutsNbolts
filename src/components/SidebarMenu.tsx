import { HiXMark } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/useData";
import { toSlug } from "../utils/slug";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { categories } = useCategories();

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300 overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold">Nuts &amp; Bolts</h2>
          <HiXMark
            className="text-2xl cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
        <nav className="p-5">
          <Link
            to="/"
            className="block py-2 text-lg hover:text-secondaryBrown"
            onClick={() => setIsSidebarOpen(false)}
          >
            Home
          </Link>
          <div className="mt-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Categories
            </h3>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${toSlug(cat.name)}`}
                className="block py-1.5 text-base hover:text-secondaryBrown"
                onClick={() => setIsSidebarOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 border-t pt-4">
            <Link
              to="/contact"
              className="block py-2 text-lg font-medium text-secondaryBrown"
              onClick={() => setIsSidebarOpen(false)}
            >
              Request a Quote
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SidebarMenu;
