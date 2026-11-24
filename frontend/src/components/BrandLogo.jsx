import { House } from "lucide-react";

function BrandLogo() {
  return (
    <a href="/" className="brand-logo" aria-label="RentWise home">
      <span className="brand-logo__icon">
        <House size={19} strokeWidth={1.6} />
      </span>
      <span className="brand-logo__name">rentwise<span>.</span></span>
    </a>
  );
}

export default BrandLogo;
