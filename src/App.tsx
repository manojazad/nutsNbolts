import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomeLayout from "./pages/HomeLayout";
import Landing from "./pages/Landing";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "category/:slug", element: <CategoryPage /> },
      { path: "product/:slug", element: <ProductPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
