import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-secondaryBrown text-white px-6 py-3 rounded hover:bg-opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
