import Banner from "../components/Banner";
import CategoriesSection from "../components/CategoriesSection";
import { Link } from "react-router-dom";
import {
  HiOutlinePhone,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineDocumentText,
  HiOutlineCube,
  HiOutlineCurrencyRupee,
  HiOutlineUserGroup,
  HiOutlineClock,
} from "react-icons/hi2";

const trustBadges = [
  { icon: HiOutlinePhone, title: "Responsive", desc: "Customer service available 24/7" },
  { icon: HiOutlineShieldCheck, title: "Secure", desc: "Trusted industrial supplier" },
  { icon: HiOutlineTruck, title: "Fast Shipping", desc: "Reliable pan-India delivery" },
  { icon: HiOutlineDocumentText, title: "Transparent", desc: "Clear quotes, no hidden costs" },
];

const stats = [
  { value: "1,000+", label: "Product Types" },
  { value: "27", label: "Categories" },
  { value: "500+", label: "Happy Clients" },
  { value: "24h", label: "Quote Turnaround" },
];

const features = [
  {
    icon: HiOutlineCube,
    title: "Wide Product Range",
    desc: "Over 1,000 product types spanning 27 industrial categories — from fasteners and hand tools to safety equipment and lab supplies.",
  },
  {
    icon: HiOutlineCurrencyRupee,
    title: "Custom B2B Pricing",
    desc: "Get competitive quotes tailored to your order volume, specifications, and delivery requirements. No standard retail mark-up.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Dedicated Sales Support",
    desc: "Our team works closely with procurement managers to source the right products and deliver the best value for your business.",
  },
  {
    icon: HiOutlineClock,
    title: "Fast Quote Turnaround",
    desc: "Submit a request and receive a detailed quote within 24 hours. We handle bulk and repeat orders with equal priority.",
  },
];

const Landing = () => {
  return (
    <>
      <Banner />

      {/* Trust Badges */}
      <div className="max-w-screen-2xl mx-auto px-5 py-10 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3">
              <badge.icon className="text-3xl text-secondaryBrown flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-sm">{badge.title}</p>
                <p className="text-gray-500 text-xs">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CategoriesSection />

      {/* Stats Bar */}
      <div className="bg-secondaryBrown mt-20">
        <div className="max-w-screen-2xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
              <p className="text-white/75 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-screen-2xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 max-sm:text-3xl">
            Why Choose Nuts &amp; Bolts?
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto text-base">
            We're built for businesses — not consumers. Everything we do is designed for procurement efficiency.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="border border-gray-100 rounded-xl p-6 hover:border-secondaryBrown hover:shadow-md transition-all group bg-white"
            >
              <div className="w-12 h-12 rounded-lg bg-secondaryBrown/10 flex items-center justify-center mb-4 group-hover:bg-secondaryBrown transition-colors">
                <f.icon className="text-2xl text-secondaryBrown group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-5 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">Ready to place an order?</h3>
            <p className="text-gray-500 mt-2">
              Browse our catalog and request a quote — our team responds within 24 hours.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0 max-[400px]:flex-col">
            <a
              href="#categories"
              className="bg-secondaryBrown text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-center"
            >
              Browse Categories
            </a>
            <Link
              to="/contact"
              className="border-2 border-secondaryBrown text-secondaryBrown px-8 py-3 rounded-lg font-medium hover:bg-secondaryBrown hover:text-white transition-colors text-center"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
