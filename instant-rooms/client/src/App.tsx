import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RoomPage from "./pages/RoomPage";
import { ToastContainer } from "./components/ui/Toast";

export default function App() {
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
