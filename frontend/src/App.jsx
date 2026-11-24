import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PortalPage from "./pages/PortalPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="auth-loading">Preparing your RentWise experience...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/portal/tenant" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/portal/tenant" replace /> : <RegisterPage />} />
      <Route
        path="/portal/:role"
        element={
          <ProtectedRoute>
            <PortalPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
