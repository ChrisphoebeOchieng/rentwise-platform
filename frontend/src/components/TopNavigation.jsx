import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import Button from "./Button";

function TopNavigation() {
  return (
    <header className="top-navigation">
      <div className="top-navigation__inner">
        <BrandLogo />

        <nav className="top-navigation__links" aria-label="Main navigation">
          <a href="#overview" className="top-navigation__link active">Overview</a>
          <a href="#properties" className="top-navigation__link">Features</a>
          <a href="#about" className="top-navigation__link">About</a>
        </nav>

        <div className="top-navigation__actions">
          <Link to="/login" className="nav-sign-in">Sign in</Link>
          <Link to="/register" className="nav-get-started">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default TopNavigation;
