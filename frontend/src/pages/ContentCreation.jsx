import { useState } from "react";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import { eventService } from "../services/eventService";

function ContentCreation() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("training");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [imageFile, setImageFile] = useState(null); // Changed from imageUrl string

  // Get today's date in YYYY-MM-DD format to restrict the date picker
  const today = new Date().toISOString().split("T")[0];

  // Predefined time slots for the dropdown menu
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use FormData for direct image upload
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("date", date); // Mandatory
    formData.append("time", time); // Mandatory
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await eventService.createEvent(formData);
      alert("Event created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setImageFile(null);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Event/Training</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event details"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            className="w-full border rounded-md p-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="training">Training</option>
            <option value="event">Event</option>
          </select>
        </div>

        {/* Date input restricted to future/present dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            className="w-full border rounded-md p-2"
            value={date}
            min={today} // Prevents past dates
            onChange={(e) => setDate(e.target.value)}
            required // Mandatory
          />
        </div>

        {/* Time slot dropdown menu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
          <select
            className="w-full border rounded-md p-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required // Mandatory
          >
            <option value="">Select a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {/* Direct Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full border rounded-md p-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </div>

        <Button type="submit" className="w-full mt-4">
          Create Event
        </Button>
      </form>
    </div>
  );
}

export default ContentCreation;