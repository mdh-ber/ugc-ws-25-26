import { useState } from "react";
import FormInput from "../components/FormInput";
import Button from "../components/Button";

function ContentCreation() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Title:", title);
    console.log("File:", file);
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">
        <FormInput
          label="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="mb-4">
          <label className="block mb-2 font-medium">Upload Media</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        <Button text="Publish" type="submit" />
      </form>
    </div>
  );
}

export default ContentCreation;
