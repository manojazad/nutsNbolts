import { lazy, Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout";
import NotFound from "./pages/NotFound";

// Lazy-loaded public pages
const Landing = lazy(() => import("./pages/Landing"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

// Lazy-loaded admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageCategories = lazy(() => import("./pages/admin/ManageCategories"));
const ManageProducts = lazy(() => import("./pages/admin/ManageProducts"));
const ProductDetails = lazy(() => import("./pages/admin/ProductDetails"));
const ViewQueries = lazy(() => import("./pages/ViewQueries"));
const ViewMessages = lazy(() => import("./pages/ViewMessages"));

const Loader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-4 border-gray-200 border-t-secondaryBrown rounded-full animate-spin" />
  </div>
);

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <S><Landing /></S> },
      { path: "category/:slug", element: <S><CategoryPage /></S> },
      { path: "product/:slug", element: <S><ProductPage /></S> },
      { path: "search", element: <S><SearchPage /></S> },
      { path: "contact", element: <S><ContactPage /></S> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin/login",
    element: <S><AdminLogin /></S>,
  },
  {
    path: "/admin",
    element: <S><AdminLayout /></S>,
    children: [
      { index: true, element: <S><AdminDashboard /></S> },
      { path: "categories", element: <S><ManageCategories /></S> },
      { path: "products", element: <S><ManageProducts /></S> },
      { path: "products/:productId", element: <S><ProductDetails /></S> },
      { path: "queries", element: <S><ViewQueries /></S> },
      { path: "messages", element: <S><ViewMessages /></S> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
