import Banner from "../components/Banner";
import CategoriesSection from "../components/CategoriesSection";

const Landing = () => {
  return (
    <>
      <Banner />
      <CategoriesSection />
      <div className="max-w-screen-2xl mx-auto px-5 mt-24 mb-16 text-center">
        <h2 className="text-4xl font-normal tracking-wide mb-6 max-sm:text-3xl">
          Why Choose Nuts &amp; Bolts?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="p-6 border border-gray-200 rounded-lg hover:border-secondaryBrown transition-colors">
            <div className="w-12 h-12 rounded-lg bg-secondaryBrown/10 flex items-center justify-center text-2xl mb-4">🏭</div>
            <h3 className="text-xl font-bold mb-2">Wide Product Range</h3>
            <p className="text-gray-600">
              Over 1,000 product types across 27 categories for all your industrial needs.
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-secondaryBrown transition-colors">
            <div className="w-12 h-12 rounded-lg bg-secondaryBrown/10 flex items-center justify-center text-2xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Custom Pricing</h3>
            <p className="text-gray-600">
              Get competitive quotes tailored to your volume and specifications.
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:border-secondaryBrown transition-colors">
            <div className="w-12 h-12 rounded-lg bg-secondaryBrown/10 flex items-center justify-center text-2xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Dedicated Support</h3>
            <p className="text-gray-600">
              Our sales team works with you to find the right products for your business.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
