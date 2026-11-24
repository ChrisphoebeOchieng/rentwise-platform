import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, House, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Your passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number,
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: { message: "Your account has been created. Please sign in." },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page auth-page--register">
      <section className="auth-visual">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="auth-visual__content">
          <span className="auth-brand-mark"><House size={30} /></span>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>A better rental experience <em>starts here.</em></h1>
          <p>Join RentWise and make managing your rental journey simpler.</p>
        </div>

        <span className="auth-visual__footer">RENTWISE · KENYA</span>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-mobile-brand">rentwise<span>.</span></Link>

          <span className="eyebrow">GET STARTED</span>
          <h2>Create your <em>account.</em></h2>
          <p className="auth-intro">Create a tenant account to get started with RentWise.</p>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="full_name">Full name</label>
            <div className="auth-input-wrap">
              <UserRound size={17} />
              <input
                id="full_name"
                name="full_name"
                placeholder="Your full name"
                value={form.full_name}
                onChange={handleChange}
                autoComplete="name"
                minLength={2}
                required
              />
            </div>

            <label htmlFor="register-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={17} />
              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="phone_number">Phone number</label>
            <div className="auth-input-wrap">
              <Phone size={17} />
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="07XXXXXXXX"
                value={form.phone_number}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </div>

            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} />
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label htmlFor="confirm_password">Confirm password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} />
              <input
                id="confirm_password"
                name="confirm_password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password again"
                value={form.confirm_password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create tenant account"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
