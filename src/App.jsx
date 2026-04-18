import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"         element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about"    element={<AboutPage />} />
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/signup"   element={<SignUpPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
