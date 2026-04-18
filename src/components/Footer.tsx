const Footer = () => {
  return (
    <footer className="max-w-screen-2xl mx-auto border-b-8 border-secondaryBrown px-5 max-[400px]:px-3">
      <div className="flex justify-center gap-24 text-center mt-12 max-[800px]:flex-col max-[800px]:gap-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold max-sm:text-xl">Business Solutions</h3>
          <p className="text-lg max-sm:text-base">Custom Quotations</p>
          <p className="text-lg max-sm:text-base">Bulk Orders</p>
          <p className="text-lg max-sm:text-base">Dedicated Support</p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold max-sm:text-xl">Our Company</h3>
          <p>About Us</p>
          <p>Quality Assurance</p>
          <p>Industry Certifications</p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold max-sm:text-xl">Support</h3>
          <p>Contact Sales</p>
          <p>Technical Support</p>
          <p>FAQs</p>
        </div>
      </div>
      <div className="flex flex-col gap-8 my-20">
        <h2 className="text-6xl font-light text-center max-sm:text-5xl">
          Nuts &amp; Bolts
        </h2>
        <p className="text-base text-center max-sm:text-sm">
          Your Trusted B2B Industrial Supply Partner
        </p>
        <p className="text-base text-center max-sm:text-sm">
          All rights reserved &copy;2025
        </p>
      </div>
    </footer>
  );
};

export default Footer;
