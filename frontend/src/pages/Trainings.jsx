import { useEffect, useState } from "react";
import { getTrainings } from "../services/trainingService";
import { getEvents, createEvent, deleteEvent, updateEvent } from "../services/eventService"; 
import Button from "../components/Button";
import Modal from "../components/Modal";
import FormInput from "../components/FormInput";
import { Calendar, MapPin, Users, Trash2, Edit } from "lucide-react"; 

function Trainings() {
  // --- STATE ---
  const [trainings, setTrainings] = useState([]);
  const [events, setEvents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- TABS & MODAL STATE ---
  const [activeTab, setActiveTab] = useState("training"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New: Track if we are editing
  const [currentEventId, setCurrentEventId] = useState(null); // New: ID of event being edited

  const [newEvent, setNewEvent] = useState({
    title: "", image: "", date: "", time: "", place: "", type: "On-site", description: "", speakers: ""
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        setLoading(true);
        const [trainingsData, eventsData] = await Promise.all([getTrainings(), getEvents()]);
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

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setNewEvent({ title: "", image: "", date: "", time: "", place: "", type: "On-site", description: "", speakers: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setIsEditing(true);
    setCurrentEventId(event._id);
    setNewEvent({ ...event }); // Pre-fill form
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // UPDATE Existing
        const updated = await updateEvent(currentEventId, newEvent);
        setEvents(events.map(ev => ev._id === currentEventId ? updated : ev));
        alert("Event updated!");
      } else {
        // CREATE New
        const saved = await createEvent(newEvent);
        setEvents([saved, ...events]);
        alert("Event created!");
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Action failed. Check permissions.");
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter(ev => ev._id !== id));
    } catch (err) {
      alert("Delete failed. Check permissions.");
    }
  };

  return (
    <div>
      {/* TABS */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        <button onClick={() => setActiveTab("training")} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "training" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Trainings</button>
        <button onClick={() => setActiveTab("events")} className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "events" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Events</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* --- TAB 1: TRAININGS --- */}
      {!loading && activeTab === "training" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {trainings.map((training) => (
            <div key={training._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2">{training.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{training.description}</p>
              <div className="mt-4"><Button text={training.type === 'video' ? 'Watch Video' : 'Read File'} onClick={() => window.open(training.url, '_blank')} className={training.type === 'video' ? 'bg-blue-500 hover:bg-blue-600 w-full' : 'bg-green-500 hover:bg-green-600 w-full'} /></div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 2: EVENTS --- */}
      {!loading && activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            {user && user.role === "Marketing Manager" && (
              <Button text="+ Add New Event" onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                {/* Image */}
                <div className="h-48 overflow-hidden relative">
                  <img src={event.image || "https://via.placeholder.com/400x200"} alt={event.title} className="w-full h-full object-cover"/>
                  <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full ${event.type === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{event.type}</span>
                </div>

                {/* Edit/Delete Actions (Only Marketing Manager) */}
                {user && user.role === "Marketing Manager" && (
                  <div className="absolute top-2 left-2 flex space-x-2">
                    <button onClick={() => openEditModal(event)} className="p-2 bg-white rounded-full shadow-md hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteEvent(event._id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                    <span className="flex items-center"><Calendar size={14} className="mr-1"/> {event.date}</span>
                    <span>•</span>
                    <span className="flex items-center"><Users size={14} className="mr-1"/> {event.time}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4"><MapPin size={16} className="mr-2 text-gray-400" />{event.place}</div>
                  <Button text="Register Now" className="w-full bg-gray-900 hover:bg-gray-800 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL (CREATE OR EDIT) --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Event" : "Add New Event"}</h2>
          <form onSubmit={handleSaveEvent} className="space-y-4">
            <FormInput label="Event Title" name="title" value={newEvent.title} onChange={handleInputChange} required />
            <FormInput label="Image URL" name="image" value={newEvent.image} onChange={handleInputChange} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Date" name="date" type="date" value={newEvent.date} onChange={handleInputChange} required />
              <FormInput label="Time" name="time" value={newEvent.time} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Place" name="place" value={newEvent.place} onChange={handleInputChange} required />
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
                <select name="type" value={newEvent.type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="On-site">On-site</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea name="description" value={newEvent.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg h-24" required />
            </div>
            <FormInput label="Speakers" name="speakers" value={newEvent.speakers} onChange={handleInputChange} />
            <div className="pt-2">
              <Button text={isEditing ? "Update Event" : "Create Event"} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" />
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default Trainings;