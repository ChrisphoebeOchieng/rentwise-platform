import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, House, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getRoleRoute } from "../routes/roleRoutes";
import "../styles/auth.css";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const user = await login(email, password);
      navigate(getRoleRoute(user.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="auth-visual__content">
          <span className="auth-brand-mark"><House size={30} /></span>
          <span className="eyebrow">WELCOME TO RENTWISE</span>
          <h1>Every place has a story. <em>Welcome back to yours.</em></h1>
          <p>Your rental experience, thoughtfully brought together.</p>
        </div>

        <span className="auth-visual__footer">RENTWISE · KENYA</span>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-mobile-brand">rentwise<span>.</span></Link>

          <span className="eyebrow">YOUR ACCOUNT</span>
          <h2>Welcome <em>back.</em></h2>
          <p className="auth-intro">Sign in to continue to your RentWise account.</p>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={17} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
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

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
