import { useEffect, useState } from "react";
import {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
} from "../services/trainingService";
import {
  getEvents,
  createEvent,
  deleteEvent,
  updateEvent,
} from "../services/eventService";
import Button from "../components/Button";
import Modal from "../components/Modal";
import FormInput from "../components/FormInput";
import { Calendar, MapPin, Users, Trash2, Edit, Upload } from "lucide-react";

function Trainings() {
  // --- STATE ---
  const [trainings, setTrainings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- TABS & MODAL STATE ---
  const [activeTab, setActiveTab] = useState("training");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isTrainingEditing, setIsTrainingEditing] = useState(false);
  const [currentTrainingId, setCurrentTrainingId] = useState(null);

  // Constants for form restrictions
  const today = new Date().toISOString().split("T")[0];
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    place: "",
    type: "On-site",
    description: "",
    speakers: "",
  });
  const [imageFile, setImageFile] = useState(null); // State for the file upload

  const [newTraining, setNewTraining] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    url: "",
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        setLoading(true);
        const [trainingsData, eventsData] = await Promise.all([
          getTrainings(),
          getEvents(),
        ]);
        setTrainings(trainingsData);
        setEvents(eventsData);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- EVENT HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      place: "",
      type: "On-site",
      description: "",
      speakers: "",
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setIsEditing(true);
    setCurrentEventId(event._id);
    setNewEvent({ ...event });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    
    // We must use FormData to send files to the backend
    const formData = new FormData();
    formData.append("title", newEvent.title);
    formData.append("date", newEvent.date);
    formData.append("time", newEvent.time);
    formData.append("place", newEvent.place);
    formData.append("type", newEvent.type);
    formData.append("description", newEvent.description);
    formData.append("speakers", newEvent.speakers);
    
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (isEditing) {
        const updated = await updateEvent(currentEventId, formData);
        setEvents(events.map((ev) => (ev._id === currentEventId ? updated : ev)));
        alert("Event updated!");
      } else {
        const saved = await createEvent(formData);
        setEvents([saved, ...events]);
        alert("Event created!");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Action failed. Check console for details.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((ev) => ev._id !== id));
    } catch (err) {
      alert("Delete failed. Check permissions.");
    }
  };

  // --- TRAINING HANDLERS ---
  const handleTrainingInputChange = (e) => {
    const { name, value } = e.target;
    setNewTraining((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateTrainingModal = () => {
    setIsTrainingEditing(false);
    setNewTraining({
      title: "",
      description: "",
      type: "",
      category: "",
      url: "",
    });
    setIsTrainingModalOpen(true);
  };

  const openEditTrainingModal = (training) => {
    setIsTrainingEditing(true);
    setCurrentTrainingId(training._id);
    setNewTraining({ ...training });
    setIsTrainingModalOpen(true);
  };

  const handleSaveTraining = async (e) => {
    e.preventDefault();
    try {
      if (isTrainingEditing) {
        const updated = await updateTraining(currentTrainingId, newTraining);
        setTrainings(trainings.map((tr) => (tr._id === currentTrainingId ? updated : tr)));
        alert("Training updated!");
      } else {
        const saved = await createTraining(newTraining);
        setTrainings([saved, ...trainings]);
        alert("Training created!");
      }
      setIsTrainingModalOpen(false);
    } catch (err) {
      alert("Action failed. Check permissions.");
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training?")) return;
    try {
      await deleteTraining(id);
      setTrainings(trainings.filter((tr) => tr._id !== id));
      alert("Training deleted!");
    } catch (err) {
      alert("Delete failed. Check permissions.");
    }
  };

  return (
    <div>
      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("training")}
          className={`px-4 py-2 text-lg font-medium rounded-md ${activeTab === "training" ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Trainings
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 text-lg font-medium rounded-md ${activeTab === "events" ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Events
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* --- TAB 1: TRAININGS --- */}
      {!loading && activeTab === "training" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Training Materials</h2>
            {user && user.role === "Marketing Manager" && (
              <Button
                text="+ Add New Training"
                onClick={openCreateTrainingModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training) => (
              <div key={training._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative">
                {user && user.role === "Marketing Manager" && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button onClick={() => openEditTrainingModal(training)} className="p-2 bg-white rounded-full shadow-md hover:text-blue-600">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteTraining(training._id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{training.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{training.description}</p>
                <div className="mt-4">
                  <Button
                    text={training.type === "Video" ? "🎥 Watch Video" : "📄 Read File"}
                    onClick={() => window.open(training.url, "_blank")}
                    className={training.type === "Video" ? "bg-green-500 hover:bg-green-600 w-full text-white" : "bg-purple-400 hover:bg-purple-500 w-full text-white"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: EVENTS --- */}
      {!loading && activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            {user && user.role === "Marketing Manager" && (
              <Button
                text="+ Add New Event"
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                <div className="h-48 overflow-hidden relative">
                  <img
                    // Note: If event.image starts with /uploads, we prefix with backend URL
                    src={event.image ? `http://localhost:5000${event.image}` : "https://via.placeholder.com/400x200"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full ${event.type === "Online" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                    {event.type}
                  </span>
                </div>

                {user && user.role === "Marketing Manager" && (
                  <div className="absolute top-2 left-2 flex space-x-2">
                    <button onClick={() => openEditModal(event)} className="p-2 bg-white rounded-full shadow-md hover:text-blue-600">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteEvent(event._id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" /> {event.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Users size={14} className="mr-1" /> {event.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    {event.place}
                  </div>
                  <Button text="Register Now" className="w-full bg-gray-900 hover:bg-gray-800 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EVENT MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Event" : "Add New Event"}
          </h2>
          <form onSubmit={handleSaveEvent} className="space-y-4">
            <FormInput
              label="Event Title"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              required
            />
            
            {/* Image Upload Input */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Event Image</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      {imageFile ? <span className="font-semibold text-blue-600">{imageFile.name}</span> : "Click to upload image"}
                    </p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Date Input with min constraint */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  min={today}
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Time Select Dropdown */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Time *</label>
                <select
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Time...</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Place"
                name="place"
                value={newEvent.place}
                onChange={handleInputChange}
                required
              />
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                <select
                  name="type"
                  value={newEvent.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="On-site">On-site</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg h-24"
                required
              />
            </div>

            <FormInput
              label="Speakers"
              name="speakers"
              value={newEvent.speakers}
              onChange={handleInputChange}
            />

            <div className="pt-2">
              <Button
                text={isEditing ? "Update Event" : "Create Event"}
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              />
            </div>
          </form>
        </div>
      </Modal>

      {/* --- TRAINING MODAL (Code provided previously, kept here for completeness) --- */}
      <Modal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold mb-4">{isTrainingEditing ? "Edit Training" : "Add New Training"}</h2>
          <form onSubmit={handleSaveTraining} className="space-y-4">
            <FormInput label="Training Title" name="title" value={newTraining.title} onChange={handleTrainingInputChange} placeholder="Enter training title" required />
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea name="description" value={newTraining.description} onChange={handleTrainingInputChange} className="w-full px-3 py-2 border rounded-lg h-24" placeholder="Enter description" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                <select name="type" value={newTraining.type} onChange={handleTrainingInputChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Select type...</option>
                  <option value="Video">🎥 Video</option>
                  <option value="PDF">📄 PDF Document</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                <select name="category" value={newTraining.category} onChange={handleTrainingInputChange} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Select category...</option>
                  <option value="Content Strategy">Content Strategy</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Guidelines">Guidelines</option>
                </select>
              </div>
            </div>
            <FormInput label="URL" name="url" type="url" value={newTraining.url} onChange={handleTrainingInputChange} placeholder="Enter link URL" required />
            <div className="pt-2">
              <Button text={isTrainingEditing ? "Update Training" : "Create Training"} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" />
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default Trainings;