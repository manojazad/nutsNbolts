import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="banner w-full flex flex-col justify-end items-center max-sm:h-[550px] max-sm:gap-2">
      <div
        style={{
          padding: "10px",
          backgroundColor: "rgba(24, 23, 23, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        <h2 className="text-white text-center text-6xl font-bold tracking-[1.86px] leading-[60px] max-sm:text-4xl max-[400px]:text-3xl">
          Industrial &amp; Business <br /> Supply Solutions
        </h2>
        <h3 className="text-white text-center text-3xl font-normal leading-[72px] tracking-[0.9px] max-sm:text-xl max-[400px]:text-lg">
          Request Custom Quotes for Your Business Needs
        </h3>
        <div className="flex justify-center items-center gap-3 pb-10 max-[400px]:flex-col max-[400px]:gap-1 max-sm:w-[350px]">
          <a
            href="#categories"
            className="bg-white text-black text-center text-xl border font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center"
          >
            Browse Categories
          </a>
          <Link
            to="/contact"
            className="text-white border-white border-2 text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;
