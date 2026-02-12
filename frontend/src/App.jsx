import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ContentCreation from "./pages/ContentCreation";
import Login from "./pages/Login";
import Trainings from "./pages/Trainings";
import Guidelines from "./pages/Guidelines";
<<<<<<< HEAD
import Reviews from "./pages/Reviews";
=======
>>>>>>> main


function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<ContentCreation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/guidelines" element={<Guidelines />} />
<<<<<<< HEAD
        <Route path="/reviews" element={<Reviews />} />
=======
>>>>>>> main

        
      </Routes>
    </Layout>
  );
}

export default App;
