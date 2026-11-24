import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  MapPin,
  Ruler,
  Sofa,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";
import TopNavigation from "../components/TopNavigation";
import "../styles/property-pages.css";

function formatRent(value) {
  return `KES ${Number(value).toLocaleString("en-KE")}`;
}

function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProperty() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest(`/properties/${propertyId}`);
        if (!cancelled) setProperty(data.property);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "This property could not be found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  async function applyForProperty() {
    if (!user) {
      navigate("/login", {
        state: { from: `/properties/${propertyId}` },
      });
      return;
    }

    const role = String(user.role || user.role_name || "").toLowerCase();

    if (!role.includes("tenant")) {
      setApplicationMessage(
        "Only registered tenant accounts can apply for properties."
      );
      return;
    }

    setApplying(true);
    setApplicationMessage("");

    try {
      const data = await apiRequest(
        `/properties/${propertyId}/applications`,
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      setApplicationMessage(
        data.message || "Your application has been submitted successfully."
      );
    } catch (err) {
      setApplicationMessage(
        err.message || "We couldn't submit your application. Please try again."
      );
    } finally {
      setApplying(false);
    }
  }

  const images = property
    ? (property.images || [])
        .map((image) =>
          typeof image === "string" ? image : image.image_url
        )
        .filter(Boolean)
    : [];

  if (property?.primary_image && !images.includes(property.primary_image)) {
    images.unshift(property.primary_image);
  }

  const specifications = property
    ? [
        {
          icon: BedDouble,
          label: "Bedrooms",
          value:
            property.bedrooms === 0
              ? "Studio"
              : `${property.bedrooms} ${
                  property.bedrooms === 1 ? "Bedroom" : "Bedrooms"
                }`,
        },
        {
          icon: Bath,
          label: "Bathrooms",
          value: `${property.bathrooms} ${
            property.bathrooms === 1 ? "Bathroom" : "Bathrooms"
          }`,
        },
        {
          icon: Ruler,
          label: "Floor area",
          value: property.floor_area
            ? `${Number(property.floor_area).toLocaleString("en-KE")} m²`
            : "Not specified",
        },
        {
          icon: Sofa,
          label: "Furnishing",
          value: property.furnished ? "Furnished" : "Unfurnished",
        },
      ]
    : [];

  return (
    <div className="property-page">
      <TopNavigation />

      <main className="property-container property-detail-container">
        <Link to="/properties" className="property-back-link">
          <ArrowLeft size={16} />
          Back to properties
        </Link>

        {loading && (
          <div className="property-message">
            Loading property details...
          </div>
        )}

        {!loading && error && (
          <div className="property-empty">
            <Building2 size={34} strokeWidth={1.2} />
            <h2>We couldn't find this property.</h2>
            <p>{error}</p>
            <Link
              to="/properties"
              className="button button--primary button--medium"
            >
              Browse properties <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!loading && !error && property && (
          <>
            <section className="property-detail-heading">
              <div>
                <span className="eyebrow">{property.property_type}</span>
                <h1>{property.property_name}</h1>
                <p>
                  <MapPin size={16} />
                  {property.location}
                </p>
              </div>

              <div className="property-detail-rent">
                <strong>{formatRent(property.monthly_rent)}</strong>
                <span>per month</span>
                <span className="property-detail-availability">
                  <CheckCircle2 size={13} />
                  {property.availability_status}
                </span>
              </div>
            </section>

            <section className="property-gallery">
              {images.length > 0 ? (
                images.slice(0, 4).map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${property.property_name} view ${index + 1}`}
                    className={`property-gallery__image property-gallery__image--${
                      index + 1
                    }`}
                  />
                ))
              ) : (
                <div className="property-gallery__placeholder">
                  <Building2 size={54} strokeWidth={1} />
                  <span>PROPERTY IMAGES WILL APPEAR HERE</span>
                </div>
              )}
            </section>

            <section className="property-detail-layout">
              <div className="property-detail-main">
                <span className="eyebrow">PROPERTY OVERVIEW</span>
                <h2>A little more about this place.</h2>

                <p className="property-description">
                  {property.description ||
                    "No additional description has been provided for this property."}
                </p>

                <section className="property-specifications">
                  <span className="eyebrow">THE DETAILS</span>
                  <h3>Property specifications</h3>

                  <div className="property-specifications-grid">
                    {specifications.map((specification) => {
                      const Icon = specification.icon;

                      return (
                        <div
                          className="property-specification"
                          key={specification.label}
                        >
                          <div className="property-specification__icon">
                            <Icon size={21} strokeWidth={1.5} />
                          </div>
                          <div>
                            <span>{specification.label}</span>
                            <strong>{specification.value}</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="property-detail-facts">
                  <div>
                    <Building2 size={19} />
                    <span>Property type</span>
                    <strong>{property.property_type}</strong>
                  </div>

                  <div>
                    <MapPin size={19} />
                    <span>Location</span>
                    <strong>{property.location}</strong>
                  </div>
                </section>

                {property.amenities?.length > 0 && (
                  <section className="property-amenities">
                    <span className="eyebrow">COMFORT & CONVENIENCE</span>
                    <h3>What this home offers</h3>

                    <div className="property-amenities-grid">
                      {property.amenities.map((amenity) => (
                        <div className="property-amenity" key={amenity}>
                          <Check size={16} />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {property.landlord?.full_name && (
                  <div className="property-landlord">
                    <span className="eyebrow">PROPERTY CONTACT</span>
                    <h3>{property.landlord.full_name}</h3>
                    <p>Property owner on RentWise</p>
                  </div>
                )}
              </div>

              <aside className="property-application-card">
                <span className="eyebrow">MAKE IT YOUR NEXT HOME</span>
                <h2>Interested in this property?</h2>
                <p>
                  Submit an application to express your interest in renting
                  this property.
                </p>

                <button
                  type="button"
                  className="button button--primary button--medium property-apply-button"
                  onClick={applyForProperty}
                  disabled={applying}
                >
                  {applying ? "Submitting..." : "Apply for this property"}
                  {!applying && <ArrowRight size={16} />}
                </button>

                {applicationMessage && (
                  <p className="property-application-message" role="status">
                    {applicationMessage}
                  </p>
                )}

                {user && (
                  <p className="property-signed-in">
                    <CheckCircle2 size={14} />
                    Signed in as {user.full_name}
                  </p>
                )}
              </aside>
            </section>
          </>
        )}
      </main>

      <footer className="property-footer">
        <span>
          rentwise<span>.</span>
        </span>
        <span>Thoughtfully managing the places we call home.</span>
        <span>KENYA</span>
      </footer>
    </div>
  );
}

export default PropertyDetailsPage;
