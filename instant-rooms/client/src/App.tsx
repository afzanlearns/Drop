import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RoomPage from "./pages/RoomPage";
import { ToastContainer } from "./components/ui/Toast";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  useTheme(); // Initialize global theme listener
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room/:code" element={<RoomPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
