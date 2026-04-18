import { useState } from "react";
import toast from "react-hot-toast";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    console.log("Contact form submitted:", formData);
    toast.success("Message sent successfully!");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-screen-2xl mx-auto px-5 py-16 text-center">
        <div className="max-w-lg mx-auto bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            Message Sent
          </h1>
          <p className="text-green-700">
            Thank you for reaching out. Our sales team will get back to you
            shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-5 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Contact Sales</h1>
        <p className="text-gray-600 mb-8">
          Have questions or need a custom quote? Fill out the form below and our
          team will respond within 24 hours.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your requirements..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-secondaryBrown focus:border-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-secondaryBrown text-white py-3 rounded-md text-lg font-medium hover:bg-opacity-90"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
