import { useState } from "react";

const Bugs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mqaqndap", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: data,
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const result = await response.json();
        throw new Error(result.error || "Something went wrong.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">Report a Bug</h2>
        <p className="text-gray-600 mb-6 text-center">
          Found something broken or acting weird? Let me know so I can fix it!
        </p>

        {submitted ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
            Thank you for reporting the bug! I’ll check it out shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block font-medium mb-1">
                Name
              </label>
              <input
                required
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-medium mb-1">
                Email
              </label>
              <input
                required
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label htmlFor="message" className="block font-medium mb-1">
                Bug Description
              </label>
              <textarea
                required
                name="message"
                id="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-jacobBlue text-white font-semibold px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors w-full"
            >
              {isSubmitting ? "Sending..." : "Submit Bug"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Bugs;
