import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useThemeStore } from './stores/themeStore';
import Landing from './pages/Landing';
import Room from './pages/Room';
import { useEffect } from 'react';

function App() {
  const { theme } = useThemeStore();

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:id" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
