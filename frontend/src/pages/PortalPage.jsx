import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, House, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getRoleRoute } from "../routes/roleRoutes";
import TenantDashboard from "./TenantDashboard";
import "../styles/auth.css";

function PortalPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const expectedRoute = getRoleRoute(user.role);

  if (expectedRoute !== `/portal/${role}`) {
    return <Navigate to={expectedRoute} replace />;
  }

  if (user.role.toLowerCase() === "tenant") {
    return <TenantDashboard />;
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="portal-page">
      <header className="portal-header">
        <Link to="/" className="brand-logo">
          <span className="brand-logo__icon"><House size={19} /></span>
          <span className="brand-logo__name">rentwise<span>.</span></span>
        </Link>
        <button className="portal-logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <section className="portal-welcome">
        <span className="eyebrow">{user.role.toUpperCase()} PORTAL</span>
        <h1>Welcome, <em>{user.full_name.split(" ")[0]}.</em></h1>
        <p>Your RentWise account is connected and ready.</p>

        <div className="portal-placeholder">
          <span className="portal-placeholder__icon"><House size={25} /></span>
          <h2>Your {user.role.toLowerCase()} workspace is coming next.</h2>
          <p>We're preparing your tools and property management experience.</p>
          <span className="portal-role-label">SIGNED IN AS {user.role.toUpperCase()}</span>
        </div>

        <Link to="/" className="portal-home-link">
          Return to homepage <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}

export default PortalPage;
