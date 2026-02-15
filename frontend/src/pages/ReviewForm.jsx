import { useState } from "react";
import axios from "axios";

function ReviewForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    contentTitle: "",
    description: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/reviews", form);
      alert("Review Submitted Successfully!");
      setForm({
        name: "",
        email: "",
        contentTitle: "",
        description: ""
      });
    } catch (error) {
      alert("Error submitting review");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Submit Review</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
        /><br /><br />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
        /><br /><br />

        <input
          type="text"
          name="contentTitle"
          placeholder="Content Title"
          value={form.contentTitle}
          onChange={handleChange}
        /><br /><br />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        /><br /><br />

        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReviewForm;
