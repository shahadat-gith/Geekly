import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Background } from './components/common/Background.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import OAuthCallback from './pages/OAuthCallback.jsx';
import Home from './pages/Home.jsx';
import ContentPage from './pages/ContentPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="relative isolate min-h-svh">
              <Background />
              <div className="relative z-10 flex min-h-svh flex-col">
                <Navbar />
                <AnimatedRoutes />
                <Footer />
              </div>
            </div>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

// Every route change re-mounts the page with a soft entrance transition.
function AnimatedRoutes() {
  const { pathname } = useLocation();

  return (
    <main key={pathname} className="animate-page flex-1">
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Topics and articles share one nested content route:
            /system-design, /system-design/basics,
            /system-design/basics/caching */}
        <Route path="*" element={<ContentPage />} />
      </Routes>
    </main>
  );
}
