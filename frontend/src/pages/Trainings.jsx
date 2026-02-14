import { useEffect, useState } from "react";
import { getTrainings } from "../services/trainingService";
import { getEvents, createEvent } from "../services/eventService"; // Import new service
import Button from "../components/Button";
import Modal from "../components/Modal";
import FormInput from "../components/FormInput";
import { Calendar, MapPin, Users } from "lucide-react"; 

function Trainings() {
  // --- STATE ---
  const [trainings, setTrainings] = useState([]);
  const [events, setEvents] = useState([]); // Now empty initially
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- TABS & MODAL STATE ---
  const [activeTab, setActiveTab] = useState("training"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", image: "", date: "", time: "", place: "", type: "On-site", description: "", speakers: ""
  });

  // --- FETCH DATA (TRAININGS & EVENTS) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both in parallel
        const [trainingsData, eventsData] = await Promise.all([
          getTrainings(),
          getEvents()
        ]);
        
        setTrainings(trainingsData);
        setEvents(eventsData);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
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

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      // 1. Send data to Backend
      const savedEvent = await createEvent(newEvent);
      
      // 2. Update UI immediately
      setEvents([savedEvent, ...events]); 
      
      // 3. Close & Reset
      setIsModalOpen(false);
      setNewEvent({ title: "", image: "", date: "", time: "", place: "", type: "On-site", description: "", speakers: "" });
      alert("Event created successfully!");
    } catch (err) {
      alert("Failed to create event");
    }
  };

  return (
    <div>
      {/* TABS NAVIGATION */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
        <button
          onClick={() => setActiveTab("training")}
          className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === "training" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Trainings
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === "events" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Events
        </button>
      </div>

      {/* ERROR / LOADING */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* --- TAB 1: TRAININGS --- */}
      {!loading && activeTab === "training" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {trainings.length === 0 ? <p className="text-gray-500">No trainings available.</p> : trainings.map((training) => (
            <div key={training._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2">{training.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{training.description}</p>
              <div className="mt-4">
                <Button 
                  text={training.type === 'video' ? 'Watch Video' : 'Read File'}
                  onClick={() => window.open(training.url, '_blank')}
                  className={training.type === 'video' ? 'bg-blue-500 hover:bg-blue-600 w-full' : 'bg-green-500 hover:bg-green-600 w-full'}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- TAB 2: EVENTS --- */}
      {!loading && activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            <Button 
              text="+ Add New Event" 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            />
          </div>

          {events.length === 0 ? (
            <p className="text-gray-500">No events scheduled yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden relative">
                    <img src={event.image || "https://via.placeholder.com/400x200"} alt={event.title} className="w-full h-full object-cover"/>
                    <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full ${event.type === 'Online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                      <span className="flex items-center"><Calendar size={14} className="mr-1"/> {event.date}</span>
                      <span>•</span>
                      <span className="flex items-center"><Users size={14} className="mr-1"/> {event.time}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      {event.place}
                    </div>
                    <Button 
                      text="Register Now" 
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white" 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- ADD EVENT MODAL --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold mb-4">Add New Event</h2>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <FormInput label="Event Title" name="title" value={newEvent.title} onChange={handleInputChange} required />
            <FormInput label="Image URL" name="image" value={newEvent.image} onChange={handleInputChange} placeholder="https://..." />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Date" name="date" type="date" value={newEvent.date} onChange={handleInputChange} required />
              <FormInput label="Time" name="time" value={newEvent.time} onChange={handleInputChange} placeholder="10:00 AM" required />
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
              <Button 
                text="Create Event" 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              />
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default Trainings;