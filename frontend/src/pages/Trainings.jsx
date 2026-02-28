import ImageCropper from "../components/ImageCropper";
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

// Helper: Convert uploaded file to Base64 String
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});

// Generate all 15-min interval time slots for the day
const allTimeSlots = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h.toString().padStart(2, '0');
    const min = m.toString().padStart(2, '0');
    allTimeSlots.push(`${hour}:${min}`);
  }
}

function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const [activeTab, setActiveTab] = useState("training");
  
  // IMAGE CROPPER STATES
  const [imageToCrop, setImageToCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  // EVENT MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [currentEventId, setCurrentEventId] = useState(null);
  const [eventImageFile, setEventImageFile] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState(null);

  // TRAINING MODAL STATES
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isTrainingEditing, setIsTrainingEditing] = useState(false);
  const [currentTrainingId, setCurrentTrainingId] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: "",
    image: "",
    date: "",
    time: "",
    place: "",
    type: "On-site",
    description: "",
    speakers: "",
  });

  const [newTraining, setNewTraining] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    url: "",
  });

  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") == "manager";

  // --- STRICT DATE LOGIC ---
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const availableTimeSlots = allTimeSlots.filter(slot => {
    if (newEvent.date === todayString) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [slotH, slotM] = slot.split(':').map(Number);
      
      if (slotH > currentHour) return true;
      if (slotH === currentHour && slotM > currentMinute) return true;
      return false; 
    }
    return true; 
  });

  useEffect(() => {
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

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewEvent((prev) => {
      let updatedTime = prev.time;
      if (selectedDate === todayString && updatedTime) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const [h, m] = updatedTime.split(':').map(Number);
        
        if (h < currentHour || (h === currentHour && m <= currentMinute)) {
          updatedTime = ""; 
        }
      }
      return { ...prev, date: selectedDate, time: updatedTime };
    });
  };

  // ✅ UPDATED: Triggers Cropper
  const handleEventImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ NEW: Handles the output from the cropper
  const handleCropDone = (croppedBase64) => {
    setEventImagePreview(croppedBase64);
    setNewEvent((prev) => ({ ...prev, image: croppedBase64 }));
    setShowCropper(false);
  };

  const isDateTimeValid = () => {
    if (!newEvent.date || !newEvent.time) {
      alert("Please select both a date and a time.");
      return false;
    }
    const selectedDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
    const currentDateTime = new Date();
    if (selectedDateTime <= currentDateTime) {
      alert("Error: You cannot schedule an event in the past. Please pick a future time.");
      return false;
    }
    return true;
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEventImageFile(null);
    setEventImagePreview(null);
    setNewEvent({
      title: "",
      image: "",
      date: "",
      time: "",
      place: "",
      type: "On-site",
      description: "",
      speakers: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setIsEditing(true);
    setCurrentEventId(event._id);
    setEventImageFile(null);
    setEventImagePreview(event.image); 
    setNewEvent({ ...event }); 
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!isDateTimeValid()) return;

    try {
      let payload = { ...newEvent };
      
      if (!isEditing && !payload.image) {
        alert("Please upload and crop an event image.");
        return;
      }

      if (isEditing) {
        const updated = await updateEvent(currentEventId, payload);
        setEvents(events.map((ev) => (ev._id === currentEventId ? updated : ev)));
        alert("Event updated!");
      } else {
        const saved = await createEvent(payload);
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
      setEvents(events.filter((ev) => ev._id !== id));
    } catch (err) {
      alert("Delete failed. Check permissions.");
    }
  };

  const handleTrainingInputChange = (e) => {
    const { name, value } = e.target;
    setNewTraining((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateTrainingModal = () => {
    setIsTrainingEditing(false);
    setNewTraining({ title: "", description: "", type: "", category: "", url: "" });
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
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab("training")}
          className={`px-4 py-2 text-lg font-medium rounded-md ${activeTab === "training" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Trainings
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 text-lg font-medium rounded-md ${activeTab === "events" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          Events
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && activeTab === "training" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Training Materials</h2>
            {isMarketingManager && (
              <Button text="+ Add New Training" onClick={openCreateTrainingModal} className="bg-blue-600 hover:bg-blue-700 text-white" />
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainings.map((training) => (
              <div key={training._id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative">
                {isMarketingManager && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button onClick={() => openEditTrainingModal(training)} className="p-2 bg-white rounded-full shadow-md hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteTraining(training._id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{training.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{training.description}</p>
                <div className="mt-4">
                  <Button text={training.type === "Video" ? "🎥 Watch Video" : "📄 Read File"} onClick={() => window.open(training.url, "_blank")} className={training.type === "Video" ? "bg-green-500 hover:bg-green-600 w-full text-white" : "bg-purple-400 hover:bg-purple-500 w-full text-white"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Events</h2>
            {isMarketingManager && (
              <Button text="+ Add New Event" onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white" />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                <div className="h-48 overflow-hidden relative">
                  <img src={event.image || "https://via.placeholder.com/400x200"} alt={event.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full ${event.type === "Online" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                    {event.type}
                  </span>
                </div>
                {isMarketingManager && (
                  <div className="absolute top-2 left-2 flex space-x-2">
                    <button onClick={() => openEditModal(event)} className="p-2 bg-white rounded-full shadow-md hover:text-blue-600"><Edit size={16} /></button>
                    <button onClick={() => handleDeleteEvent(event._id)} className="p-2 bg-white rounded-full shadow-md hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center text-xs text-gray-500 mb-2 space-x-2">
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {event.date}</span>
                    <span>•</span>
                    <span className="flex items-center"><Users size={14} className="mr-1" /> {event.time}</span>
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

      <Modal isOpen={isTrainingModalOpen} onClose={() => setIsTrainingModalOpen(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold mb-4">{isTrainingEditing ? "Edit Training" : "Add New Training"}</h2>
          <form onSubmit={handleSaveTraining} className="space-y-4">
            <FormInput label="Training Title" name="title" value={newTraining.title} onChange={handleTrainingInputChange} required />
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea name="description" value={newTraining.description} onChange={handleTrainingInputChange} className="w-full px-3 py-2 border rounded-lg h-24" required />
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
            <FormInput label="URL" name="url" type="url" value={newTraining.url} onChange={handleTrainingInputChange} required />
            <div className="pt-2"><Button text={isTrainingEditing ? "Update Training" : "Create Training"} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" /></div>
          </form>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? "Edit Event" : "Create New Event"}</h2>
          <form onSubmit={handleSaveEvent} className="space-y-5">
            <FormInput label="Event Title" name="title" value={newEvent.title} onChange={handleInputChange} placeholder="e.g. Content Creator Summit 2026" required />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Cover Image</label>
              <div className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer overflow-hidden relative">
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer absolute inset-0">
                  {eventImagePreview ? (
                    <img src={eventImagePreview} className="w-full h-full object-cover rounded-xl" alt="Preview"/>
                  ) : (
                    <>
                      <Upload className="text-gray-400 mb-2" size={28} />
                      <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleEventImageChange} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Date"
                name="date"
                type="date"
                value={newEvent.date}
                onChange={handleDateChange} 
                min={todayString} 
                required
              />
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Time</label>
                <select
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Select Time</option>
                  {availableTimeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Location / Link" name="place" value={newEvent.place} onChange={handleInputChange} required />
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Event Type</label>
                <select name="type" value={newEvent.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <option value="On-site">On-site</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea name="description" value={newEvent.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none" required />
            </div>

            <FormInput label="Speakers (Optional)" name="speakers" value={newEvent.speakers} onChange={handleInputChange} />

            <div className="pt-4 border-t border-gray-100">
              <Button text={isEditing ? "Save Changes" : "Publish Event"} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg" />
            </div>
          </form>
        </div>
      </Modal>

      {/* RENDER CROPPER */}
      {showCropper && (
        <ImageCropper 
          image={imageToCrop} 
          onCropComplete={handleCropDone} 
          onCancel={() => setShowCropper(false)} 
        />
      )}
    </div>
  );
}

export default Trainings;