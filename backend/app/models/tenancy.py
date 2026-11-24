from datetime import datetime, timezone

from app.extensions import db


class Tenancy(db.Model):
    """Records rental agreements between tenants and property owners."""

    __tablename__ = "tenancies"

    tenancy_id = db.Column(db.Integer, primary_key=True)

    application_id = db.Column(
        db.Integer,
        db.ForeignKey("applications.application_id"),
        unique=True,
        nullable=False
    )

    tenant_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)

    monthly_rent = db.Column(db.Numeric(12, 2), nullable=False)

    tenancy_status = db.Column(
        db.String(30),
        default="active",
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    application = db.relationship("Application", back_populates="tenancy")
    tenant = db.relationship("User", back_populates="tenancies")

    payments = db.relationship(
        "Payment",
        back_populates="tenancy"
    )
