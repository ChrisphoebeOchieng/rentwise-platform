import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  House,
  LogOut,
  MapPin,
  Wrench,
  Wallet,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import "../styles/tenant-dashboard.css";

function formatMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase().replaceAll("_", " ");

  return (
    <span className={`tenant-status tenant-status--${normalized.replaceAll(" ", "-")}`}>
      {normalized}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="tenant-empty">
      <span className="tenant-empty__icon"><Icon size={21} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function TenantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest("/tenant/dashboard");

        if (active) {
          setDashboard(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "We couldn't load your dashboard.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (loading) {
    return (
      <main className="tenant-loading">
        <span className="tenant-loader"><RefreshCw size={22} /></span>
        <p>Preparing your RentWise dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="tenant-loading">
        <span className="tenant-error-icon"><AlertCircle size={25} /></span>
        <h2>We couldn't load your dashboard</h2>
        <p>{error}</p>
        <button className="tenant-primary-button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  const summary = dashboard?.summary || {};
  const applications = dashboard?.applications || [];
  const payments = dashboard?.payments || [];
  const maintenance = dashboard?.maintenance_requests || [];
  const notifications = dashboard?.notifications || [];
  const tenancy = dashboard?.tenancy;
  const property = tenancy?.property;

  return (
    <main className="tenant-dashboard">
      <header className="tenant-topbar">
        <Link to="/" className="tenant-brand">
          <span className="tenant-brand__mark"><House size={18} /></span>
          <span>rentwise<span className="tenant-brand__dot">.</span></span>
        </Link>

        <nav className="tenant-topbar__nav" aria-label="Tenant navigation">
          <a href="#overview" className="is-active">Overview</a>
          <a href="#applications">Applications</a>
          <a href="#payments">Payments</a>
          <a href="#maintenance">Maintenance</a>
        </nav>

        <div className="tenant-account">
          <span className="tenant-avatar">
            {(user?.full_name || "T").charAt(0).toUpperCase()}
          </span>
          <span className="tenant-account__name">{user?.full_name || "Tenant"}</span>
          <button className="tenant-logout" onClick={handleLogout} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="tenant-content" id="overview">
        <section className="tenant-welcome">
          <div>
            <span className="tenant-eyebrow">TENANT PORTAL</span>
            <h1>Good to see you, <em>{(user?.full_name || "Tenant").split(" ")[0]}.</em></h1>
            <p>Here's an overview of your rental activity and account.</p>
          </div>
          <div className="tenant-welcome__date">
            <CalendarDays size={17} />
            {formatDate(new Date().toISOString())}
          </div>
        </section>

        <section className="tenant-stat-grid" aria-label="Account summary">
          <article className="tenant-stat-card">
            <span className="tenant-stat-card__icon"><House size={19} /></span>
            <span className="tenant-stat-card__label">Active tenancy</span>
            <strong>{summary.has_active_tenancy ? "Active" : "None"}</strong>
            <span className="tenant-stat-card__note">
              {summary.has_active_tenancy ? "You have an active tenancy" : "No active rental agreement"}
            </span>
          </article>

          <article className="tenant-stat-card">
            <span className="tenant-stat-card__icon"><FileText size={19} /></span>
            <span className="tenant-stat-card__label">Applications</span>
            <strong>{summary.total_applications ?? applications.length}</strong>
            <span className="tenant-stat-card__note">
              {summary.pending_applications ?? 0} awaiting review
            </span>
          </article>

          <article className="tenant-stat-card">
            <span className="tenant-stat-card__icon"><Wallet size={19} /></span>
            <span className="tenant-stat-card__label">Total paid</span>
            <strong>{formatMoney(summary.total_paid)}</strong>
            <span className="tenant-stat-card__note">Recorded payments</span>
          </article>

          <article className="tenant-stat-card">
            <span className="tenant-stat-card__icon"><CreditCard size={19} /></span>
            <span className="tenant-stat-card__label">Outstanding balance</span>
            <strong>{formatMoney(summary.outstanding_balance)}</strong>
            <span className="tenant-stat-card__note">Based on recorded payments</span>
          </article>
        </section>

        <section className="tenant-main-grid">
          <article className="tenant-panel tenant-property-panel">
            <div className="tenant-panel__heading">
              <div>
                <span className="tenant-eyebrow">YOUR RENTAL</span>
                <h2>Current tenancy</h2>
              </div>
              {tenancy && <StatusBadge status={tenancy.tenancy_status} />}
            </div>

            {tenancy && property ? (
              <div className="tenant-property">
                <div className="tenant-property__image">
                  {property.image_url ? (
                    <img src={property.image_url} alt={property.property_name} />
                  ) : (
                    <House size={34} />
                  )}
                </div>
                <div className="tenant-property__details">
                  <h3>{property.property_name}</h3>
                  <p><MapPin size={15} /> {property.location}</p>
                  <strong>{formatMoney(property.monthly_rent)} <span>/ month</span></strong>
                  <div className="tenant-property__dates">
                    <span>Start date: {formatDate(tenancy.start_date)}</span>
                    <span>End date: {formatDate(tenancy.end_date)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={House}
                title="No active tenancy yet"
                description="Once an application is approved and a tenancy is created, your rental details will appear here."
              />
            )}
          </article>

          <article className="tenant-panel tenant-notification-panel">
            <div className="tenant-panel__heading">
              <div>
                <span className="tenant-eyebrow">UPDATES</span>
                <h2>Notifications</h2>
              </div>
              <span className="tenant-count">
                {summary.unread_notifications ?? notifications.filter((item) => !item.read_status).length}
              </span>
            </div>

            {notifications.length ? (
              <div className="tenant-notification-list">
                {notifications.slice(0, 4).map((item) => (
                  <div className="tenant-notification" key={item.notification_id}>
                    <span className="tenant-notification__icon"><Bell size={16} /></span>
                    <div>
                      <p>{item.message}</p>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    {!item.read_status && <i aria-label="Unread" />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="You're all caught up"
                description="New account updates and notifications will appear here."
              />
            )}
          </article>
        </section>

        <section className="tenant-panel tenant-table-panel" id="applications">
          <div className="tenant-panel__heading">
            <div>
              <span className="tenant-eyebrow">RENTAL ACTIVITY</span>
              <h2>Your applications</h2>
            </div>
            <span className="tenant-section-count">{applications.length} total</span>
          </div>

          {applications.length ? (
            <div className="tenant-table-wrap">
              <table className="tenant-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Location</th>
                    <th>Date submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.application_id}>
                      <td>{application.property?.property_name || "Property"}</td>
                      <td>{application.property?.location || "—"}</td>
                      <td>{formatDate(application.application_date)}</td>
                      <td><StatusBadge status={application.application_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="When you apply for a property, your application progress will be shown here."
            />
          )}
        </section>

        <section className="tenant-bottom-grid">
          <article className="tenant-panel" id="payments">
            <div className="tenant-panel__heading">
              <div>
                <span className="tenant-eyebrow">FINANCIAL RECORDS</span>
                <h2>Recent payments</h2>
              </div>
              <span className="tenant-section-count">{payments.length} records</span>
            </div>

            {payments.length ? (
              <div className="tenant-activity-list">
                {payments.slice(0, 5).map((payment) => (
                  <div className="tenant-activity" key={payment.payment_id}>
                    <span className="tenant-activity__icon"><CreditCard size={17} /></span>
                    <div className="tenant-activity__details">
                      <strong>{formatMoney(payment.amount_paid)}</strong>
                      <span>{formatDate(payment.payment_date)}</span>
                    </div>
                    <StatusBadge status={payment.payment_status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="No payment records"
                description="Your recorded rent payments will appear here."
              />
            )}
          </article>

          <article className="tenant-panel" id="maintenance">
            <div className="tenant-panel__heading">
              <div>
                <span className="tenant-eyebrow">PROPERTY CARE</span>
                <h2>Maintenance requests</h2>
              </div>
              <span className="tenant-section-count">{maintenance.length} requests</span>
            </div>

            {maintenance.length ? (
              <div className="tenant-activity-list">
                {maintenance.slice(0, 5).map((request) => (
                  <div className="tenant-maintenance" key={request.request_id}>
                    <span className="tenant-activity__icon"><Wrench size={17} /></span>
                    <div className="tenant-activity__details">
                      <strong>{request.description}</strong>
                      <span>
                        {request.property_name || "Property"} · {formatDate(request.request_date)}
                      </span>
                    </div>
                    <StatusBadge status={request.request_status} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wrench}
                title="No maintenance requests"
                description="Requests you submit about your rental property will appear here."
              />
            )}
          </article>
        </section>

        <footer className="tenant-footer">
          <span>rentwise<span className="tenant-brand__dot">.</span></span>
          <p>Making rental living simpler.</p>
        </footer>
      </div>
    </main>
  );
}

export default TenantDashboard;
