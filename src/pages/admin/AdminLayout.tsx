import { Outlet, Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  const navItems = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/queries", label: "Quotes" },
    { to: "/admin/messages", label: "Messages" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/admin" className="text-xl font-bold">
            Nuts &amp; Bolts <span className="text-sm font-normal text-gray-400">Admin</span>
          </Link>
          <nav className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  item.to === "/admin"
                    ? location.pathname === item.to
                      ? "bg-secondaryBrown text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    : location.pathname.startsWith(item.to)
                    ? "bg-secondaryBrown text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            View Site
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden bg-white border-b px-4 py-2 flex gap-1 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${
              item.to === "/admin"
                ? location.pathname === item.to
                  ? "bg-secondaryBrown text-white"
                  : "text-gray-600 hover:bg-gray-100"
                : location.pathname.startsWith(item.to)
                ? "bg-secondaryBrown text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-screen-xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
