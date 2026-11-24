import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp, ArrowRight, BedDouble, Building2, MapPin, Search, SlidersHorizontal } from "lucide-react";
import TopNavigation from "../components/TopNavigation";
import { apiRequest } from "../services/api";
import "../styles/property-pages.css";

function formatRent(value) {
  return `KES ${Number(value).toLocaleString("en-KE")}`;
}

function PropertyCard({ property }) {
  return (
    <article className="property-card">
      <Link to={`/properties/${property.property_id}`} className="property-card__image-link">
        {property.primary_image ? (
          <img src={property.primary_image} alt={property.property_name} className="property-card__image" />
        ) : (
          <div className="property-card__placeholder">
            <Building2 size={38} strokeWidth={1.1} />
            <span>RENTWISE PROPERTY</span>
          </div>
        )}
        <span className="property-card__availability">Available</span>
      </Link>

      <div className="property-card__content">
        <span className="property-card__type">{property.property_type}</span>
        <h2>{property.property_name}</h2>
        <p className="property-card__location">
          <MapPin size={15} />
          {property.location}
        </p>
        <div className="property-card__footer">
          <div>
            <strong>{formatRent(property.monthly_rent)}</strong>
            <span className="property-card__period"> / month</span>
          </div>
          <Link to={`/properties/${property.property_id}`} className="property-card__view">
            View details <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PropertyListingsPage() {
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    property_type: "",
    min_rent: "",
    max_rent: "",
    sort: "newest",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function loadProperties() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ page, per_page: 9 });

      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      try {
        const data = await apiRequest(`/properties?${params.toString()}`);
        if (!cancelled) {
          setProperties(data.properties || []);

          const pageInfo = data.pagination || {};

          setPagination({
            page: pageInfo.page || 1,
            pages: pageInfo.total_pages || 1,
            total: pageInfo.total_items || 0,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "We couldn't load properties right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [appliedFilters, page]);

  function updateFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  }

  function clearFilters() {
    const cleared = {
      search: "",
      location: "",
      property_type: "",
      min_rent: "",
      max_rent: "",
      sort: "newest",
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  }

  return (
    <div className="property-page">
      <TopNavigation />

      <main className="property-container">
        <section className="property-intro">
          <span className="eyebrow">FIND YOUR NEXT HOME</span>
          <h1>Spaces that feel like <em>they belong to you.</em></h1>
          <p>Explore available rental properties across Kenya and find a place that feels right.</p>
        </section>

        <form className="property-filters" onSubmit={handleSearch}>
          <div className="property-filter property-filter--search">
            <label htmlFor="property-search">Search properties</label>
            <div className="property-input-wrap">
              <Search size={17} />
              <input
                id="property-search"
                name="search"
                value={filters.search}
                onChange={updateFilter}
                placeholder="Property name, area or keyword"
              />
            </div>
          </div>

          <div className="property-filter">
            <label htmlFor="property-location">Location</label>
            <div className="property-input-wrap">
              <MapPin size={16} />
              <input
                id="property-location"
                name="location"
                value={filters.location}
                onChange={updateFilter}
                placeholder="e.g. Kilimani"
              />
            </div>
          </div>

          <div className="property-filter">
            <label htmlFor="property-type">Property type</label>
            <select id="property-type" name="property_type" value={filters.property_type} onChange={updateFilter}>
              <option value="">All property types</option>
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Bedsitter">Bedsitter</option>
              <option value="Studio">Studio</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Maisonette">Maisonette</option>
            </select>
          </div>

          <div className="property-filter property-filter--rent">
            <label htmlFor="minimum-rent">Minimum rent (KES)</label>
            <input
              id="minimum-rent"
              name="min_rent"
              type="number"
              min="0"
              value={filters.min_rent}
              onChange={updateFilter}
              placeholder="Min"
            />
          </div>

          <div className="property-filter property-filter--rent">
            <label htmlFor="maximum-rent">Maximum rent (KES)</label>
            <input
              id="maximum-rent"
              name="max_rent"
              type="number"
              min="0"
              value={filters.max_rent}
              onChange={updateFilter}
              placeholder="Max"
            />
          </div>

          <div className="property-filter">
            <label htmlFor="property-sort">Sort by</label>
            <div className="property-input-wrap">
              <ArrowDownUp size={16} />
              <select id="property-sort" name="sort" value={filters.sort} onChange={updateFilter}>
                <option value="newest">Newest first</option>
                <option value="rent_asc">Rent: low to high</option>
                <option value="rent_desc">Rent: high to low</option>
              </select>
            </div>
          </div>

          <div className="property-filter-actions">
            <button type="submit" className="button button--primary button--medium">
              <SlidersHorizontal size={16} /> Apply filters
            </button>
            <button type="button" className="property-clear-button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        </form>

        <section className="property-results">
          <div className="property-results__heading">
            <div>
              <span className="eyebrow">THE COLLECTION</span>
              <h2>Available properties</h2>
            </div>
            {!loading && <span className="property-results__count">{pagination.total || 0} properties found</span>}
          </div>

          {loading && <div className="property-message">Finding available properties...</div>}

          {!loading && error && (
            <div className="property-message property-message--error">
              <p>{error}</p>
              <button type="button" className="button button--primary button--medium" onClick={() => setPage((current) => current)}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className="property-empty">
              <Building2 size={34} strokeWidth={1.2} />
              <h3>No properties found just yet.</h3>
              <p>Try changing your search or clearing some filters to see more listings.</p>
              <button type="button" className="button button--primary button--medium" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <>
              <div className="property-grid">
                {properties.map((property) => (
                  <PropertyCard key={property.property_id} property={property} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="property-pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {pagination.page || page} of {pagination.pages}</span>
                  <button
                    type="button"
                    disabled={page >= pagination.pages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="property-footer">
        <span>rentwise<span>.</span></span>
        <span>Thoughtfully managing the places we call home.</span>
        <span>KENYA</span>
      </footer>
    </div>
  );
}

export default PropertyListingsPage;
