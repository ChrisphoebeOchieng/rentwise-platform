from datetime import datetime, timezone

from app.extensions import db


class Property(db.Model):
    """Stores rental properties listed on the RentWise platform."""

    __tablename__ = "properties"

    property_id = db.Column(db.Integer, primary_key=True)

    owner_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    property_name = db.Column(db.String(150), nullable=False)
    property_type = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    monthly_rent = db.Column(db.Numeric(12, 2), nullable=False)

    bedrooms = db.Column(
        db.Integer,
        nullable=False,
        default=0,
        server_default=db.text("0")
    )

    bathrooms = db.Column(
        db.Integer,
        nullable=False,
        default=1,
        server_default=db.text("1")
    )

    floor_area = db.Column(db.Numeric(10, 2), nullable=True)

    furnished = db.Column(
        db.Boolean,
        nullable=False,
        default=False,
        server_default=db.false()
    )

    amenities = db.Column(
        db.JSON,
        nullable=False,
        default=list,
        server_default=db.text("'[]'")
    )

    availability_status = db.Column(
        db.String(30),
        default="available",
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    owner = db.relationship(
        "User",
        back_populates="owned_properties",
        foreign_keys=[owner_id]
    )

    images = db.relationship(
        "PropertyImage",
        back_populates="property",
        cascade="all, delete-orphan"
    )

    applications = db.relationship(
        "Application",
        back_populates="property"
    )

    maintenance_requests = db.relationship(
        "MaintenanceRequest",
        back_populates="property"
    )

    def __repr__(self):
        return f"<Property {self.property_name}>"


class PropertyImage(db.Model):
    """Stores image references associated with rental properties."""

    __tablename__ = "property_images"

    image_id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.property_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    image_url = db.Column(db.String(500), nullable=False)
    is_primary = db.Column(db.Boolean, default=False, nullable=False)
    uploaded_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    property = db.relationship("Property", back_populates="images")
