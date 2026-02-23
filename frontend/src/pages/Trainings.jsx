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
  const [trainings, setTrainings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("training");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isTrainingEditing, setIsTrainingEditing] = useState(false);
  const [currentTrainingId, setCurrentTrainingId] = useState(null);

  // Constants for form restrictions
  const today = new Date().toISOString().split("T")[0];
  
  // Comprehensive 24-hour time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    place: "",
    type: "On-site",
    description: "",
    speakers: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const [newTraining, setNewTraining] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    url: "",
  });

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
      console.error("Save failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Action failed. Check permissions.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((ev) => ev._id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  // --- TRAINING HANDLERS ---
  const handleTrainingInputChange = (e) => {
    const { name, value } = e.target;
    setNewTraining((prev) => ({ ...prev, [name]: value }));
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
      alert("Action failed.");
    }
  };

  const handleDeleteTraining = async (id) => {
    if (!window.confirm("Are you sure you want to delete this training?")) return;
    try {
      await deleteTraining(id);
      setTrainings(trainings.filter((tr) => tr._id !== id));
      alert("Training deleted!");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  return (
    <div className="p-4">
      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("training")}
          className={`px-6 py-3 text-lg font-semibold transition-all ${activeTab === "training" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Trainings
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-6 py-3 text-lg font-semibold transition-all ${activeTab === "events" ? "border-b-4 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Events
        </button>
      </div>

      {loading && <p className="text-center py-10">Loading content...</p>}

      {/* --- TRAININGS TAB --- */}
      {!loading && activeTab === "training" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Training Materials</h2>
            {user?.role === "Marketing Manager" && (
              <Button text="+ New Training" onClick={() => { setIsTrainingEditing(false); setIsTrainingModalOpen(true); }} className="bg-blue-600 text-white" />
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((t) => (
              <div key={t._id} className="bg-white p-6 rounded-xl shadow-sm border relative">
                {user?.role === "Marketing Manager" && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => { setIsTrainingEditing(true); setCurrentTrainingId(t._id); setNewTraining({...t}); setIsTrainingModalOpen(true); }} className="p-1 hover:text-blue-600"><Edit size={18}/></button>
                    <button onClick={() => handleDeleteTraining(t._id)} className="p-1 hover:text-red-600"><Trash2 size={18}/></button>
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{t.description}</p>
                <Button text={t.type === "Video" ? "Watch" : "Read"} onClick={() => window.open(t.url, "_blank")} className="w-full bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EVENTS TAB --- */}
      {!loading && activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
            {user?.role === "Marketing Manager" && (
              <Button text="+ Add Event" onClick={openCreateModal} className="bg-blue-600 text-white" />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border overflow-hidden relative">
                <div className="h-40 bg-gray-200">
                  <img src={event.image ? `http://localhost:5000${event.image}` : "https://via.placeholder.com/400x200"} className="w-full h-full object-cover" alt="" />
                </div>
                {user?.role === "Marketing Manager" && (
                  <div className="absolute top-2 left-2 flex gap-2">
                    <button onClick={() => openEditModal(event)} className="p-2 bg-white/90 rounded-full shadow hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteEvent(event._id)} className="p-2 bg-white/90 rounded-full shadow hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex gap-4 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {event.date}</span>
                    <span className="flex items-center gap-1"><Users size={12}/> {event.time}</span>
                  </div>
                  <h3 className="font-bold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4"><MapPin size={14}/> {event.place}</div>
                  <Button text="Register" className="w-full bg-black text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EVENT MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-2">
          <h2 className="text-xl font-bold mb-6">{isEditing ? "Edit Event" : "Add New Event"}</h2>
          <form onSubmit={handleSaveEvent} className="space-y-4">
            <FormInput label="Title" name="title" value={newEvent.title} onChange={handleInputChange} required />
            
            <div>
              <label className="block text-sm font-bold mb-1">Image</label>
              <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100">
                <label className="flex flex-col items-center justify-center w-full h-full">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{imageFile ? imageFile.name : "Select Image"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Date *</label>
                <input type="date" name="date" min={today} value={newEvent.date} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Time *</label>
                <select name="time" value={newEvent.time} onChange={handleInputChange} className="w-full p-2 border rounded" required>
                  <option value="">Select Time</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Place" name="place" value={newEvent.place} onChange={handleInputChange} required />
              <div>
                <label className="block text-sm font-bold mb-1">Type</label>
                <select name="type" value={newEvent.type} onChange={handleInputChange} className="w-full p-2 border rounded">
                  <option value="On-site">On-site</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Description</label>
              <textarea name="description" value={newEvent.description} onChange={handleInputChange} className="w-full p-2 border rounded h-20" required />
            </div>

            <FormInput label="Speakers" name="speakers" value={newEvent.speakers} onChange={handleInputChange} />

            <Button text={isEditing ? "Update" : "Create"} type="submit" className="w-full bg-blue-600 text-white mt-4" />
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default Trainings;