import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    products: 0,
    pendingQuotes: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    async function load() {
      const [cats, subs, pts, quotes, msgs] = await Promise.all([
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("subcategories").select("id", { count: "exact", head: true }),
        supabase.from("product_types").select("id", { count: "exact", head: true }),
        supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "unread"),
      ]);
      setStats({
        categories: cats.count ?? 0,
        subcategories: subs.count ?? 0,
        products: pts.count ?? 0,
        pendingQuotes: quotes.count ?? 0,
        unreadMessages: msgs.count ?? 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Categories", value: stats.categories, to: "/admin/products" },
    { label: "Subcategories", value: stats.subcategories, to: "/admin/products" },
    { label: "Product Types", value: stats.products, to: "/admin/products" },
    { label: "Pending Quotes", value: stats.pendingQuotes, to: "/admin/queries", highlight: true },
    { label: "Unread Messages", value: stats.unreadMessages, to: "/admin/messages", highlight: true },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`rounded-lg p-5 border transition-colors hover:shadow-md ${
              card.highlight && card.value > 0
                ? "border-secondaryBrown bg-secondaryBrown/5"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
