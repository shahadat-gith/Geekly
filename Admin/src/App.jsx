import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Topics from './pages/Topics.jsx';
import Articles from './pages/Articles.jsx';
import ArticleEditor from './pages/ArticleEditor.jsx';
import ImageStudio from './pages/ImageStudio.jsx';
import Usage from './pages/Usage.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="topics" element={<Topics />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/new" element={<ArticleEditor />} />
        <Route path="articles/:id/edit" element={<ArticleEditor />} />
        <Route path="images" element={<ImageStudio />} />
        <Route path="usage" element={<Usage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
