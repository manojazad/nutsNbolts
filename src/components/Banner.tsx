import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="bg-gray-50 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-5 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* Left: Text */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Your One-Stop <br />
            <span className="text-secondaryBrown">Industrial Supply</span> Partner
          </h1>
          <p className="text-gray-500 mt-4 text-lg leading-relaxed">
            Welcome to Nuts &amp; Bolts — your trusted B2B partner for
            industrial hardware, tools, and supplies. Request custom quotes
            tailored to your business needs.
          </p>
          <div className="flex gap-3 mt-8 max-[400px]:flex-col">
            <a
              href="#categories"
              className="bg-secondaryBrown text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-opacity-90 transition-colors text-center"
            >
              Browse Categories
            </a>
            <Link
              to="/search"
              className="border-2 border-secondaryBrown text-secondaryBrown px-8 py-3 rounded-lg text-base font-medium hover:bg-secondaryBrown hover:text-white transition-colors text-center"
            >
              Search Products
            </Link>
          </div>
        </div>

        {/* Right: Image — hidden on mobile */}
        <div className="hidden md:block">
          <img
            src="https://gynvfilnfwxbvnkbatpa.supabase.co/storage/v1/object/public/banner/banner.jpg"
            alt="Industrial supplies"
            
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
