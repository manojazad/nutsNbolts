import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface Message {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  unread: "bg-yellow-100 text-yellow-800",
  read: "bg-blue-100 text-blue-800",
  replied: "bg-green-100 text-green-800",
};

const ViewMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchMessages = async () => {
    let query = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data } = await query;
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Marked as ${status}`);
    fetchMessages();
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <span className="text-sm text-gray-500">{messages.length} total</span>
      </div>

      <div className="flex gap-2 mb-4">
        {["all", "unread", "read", "replied"].map((s) => (
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

      {messages.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No messages found.</p>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="bg-white border border-gray-200 rounded-lg">
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
              >
                <span className="text-xs text-gray-400 w-8">#{m.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.message}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status]}`}>
                  {m.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(m.created_at).toLocaleDateString()}
                </span>
              </div>

              {expandedId === m.id && (
                <div className="border-t px-4 py-4 bg-gray-50 text-sm">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <p><span className="text-gray-500">Name:</span> {m.name}</p>
                    <p><span className="text-gray-500">Company:</span> {m.company || "—"}</p>
                    <p><span className="text-gray-500">Email:</span> <a href={`mailto:${m.email}`} className="text-blue-600 underline">{m.email}</a></p>
                    <p><span className="text-gray-500">Phone:</span> {m.phone || "—"}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-gray-500 text-xs mb-1">Message:</p>
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    {["unread", "read", "replied"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(m.id, s)}
                        disabled={m.status === s}
                        className={`px-3 py-1 rounded text-xs font-medium capitalize ${
                          m.status === s
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

export default ViewMessages;
