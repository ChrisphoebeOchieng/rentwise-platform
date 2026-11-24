from datetime import datetime, timezone

from app.extensions import db


class MaintenanceRequest(db.Model):
    """Stores maintenance requests submitted by tenants."""

    __tablename__ = "maintenance_requests"

    request_id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.property_id"),
        nullable=False
    )

    tenant_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    description = db.Column(db.Text, nullable=False)
    priority = db.Column(
        db.String(20),
        default="medium",
        nullable=False
    )

    request_status = db.Column(
        db.String(30),
        default="pending",
        nullable=False
    )

    resolution_details = db.Column(db.Text)

    request_date = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    property = db.relationship(
        "Property",
        back_populates="maintenance_requests"
    )
