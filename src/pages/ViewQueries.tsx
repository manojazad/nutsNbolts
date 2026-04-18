import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface Quote {
  id: number;
  product_name: string;
  category_name: string;
  subcategory_name: string;
  quantity: number;
  specifications: string;
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  delivery_location: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  quoted: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

const ViewQueries = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchQuotes = async () => {
    let query = supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data } = await query;
    setQuotes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("quote_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Status updated to ${status}`);
    fetchQuotes();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quote Requests</h1>
        <span className="text-sm text-gray-500">{quotes.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["all", "pending", "reviewed", "quoted", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
              filter === s ? "bg-secondaryBrown text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {quotes.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No quote requests found.</p>
      ) : (
        <div className="space-y-2">
          {quotes.map((q) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg">
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <span className="text-xs text-gray-400 w-8">#{q.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{q.product_name}</p>
                  <p className="text-xs text-gray-500">{q.company_name} — {q.contact_name}</p>
                </div>
                <span className="text-sm">Qty: {q.quantity}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[q.status]}`}>
                  {q.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(q.created_at).toLocaleDateString()}
                </span>
              </div>

              {expandedId === q.id && (
                <div className="border-t px-4 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Product Details</h4>
                      <p><span className="text-gray-500">Product:</span> {q.product_name}</p>
                      <p><span className="text-gray-500">Category:</span> {q.category_name}</p>
                      <p><span className="text-gray-500">Subcategory:</span> {q.subcategory_name}</p>
                      <p><span className="text-gray-500">Quantity:</span> {q.quantity}</p>
                      {q.specifications && (
                        <div className="mt-2">
                          <span className="text-gray-500">Specifications:</span>
                          <p className="mt-1 bg-white p-2 rounded border text-xs">{q.specifications}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Contact Info</h4>
                      <p><span className="text-gray-500">Name:</span> {q.contact_name}</p>
                      <p><span className="text-gray-500">Company:</span> {q.company_name}</p>
                      <p><span className="text-gray-500">Email:</span> <a href={`mailto:${q.email}`} className="text-blue-600 underline">{q.email}</a></p>
                      <p><span className="text-gray-500">Phone:</span> {q.phone}</p>
                      {q.delivery_location && <p><span className="text-gray-500">Delivery:</span> {q.delivery_location}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    {["pending", "reviewed", "quoted", "closed"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(q.id, s)}
                        disabled={q.status === s}
                        className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                          q.status === s
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-white border hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewQueries;
