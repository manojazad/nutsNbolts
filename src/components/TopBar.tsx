import { HiOutlinePhone } from "react-icons/hi2";

const TopBar = () => {
  return (
    <div className="bg-secondaryBrown text-white text-sm">
      <div className="max-w-screen-2xl mx-auto px-5 py-2 flex items-center justify-between max-sm:justify-center">
        <div className="flex items-center gap-2">
          <HiOutlinePhone className="text-base" />
          <span>
            Have a question? Call us now at{" "}
            <a href="tel:+919896900677" className="font-semibold hover:underline">
              +91 9896900677
            </a>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-white/80 text-xs">
          <span>Mon – Sat: 9 AM – 7 PM</span>
          <span className="w-px h-3 bg-white/40" />
          <span>B2B Industrial Supplies</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
