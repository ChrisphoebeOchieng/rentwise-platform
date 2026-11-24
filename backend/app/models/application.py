from datetime import datetime, timezone

from app.extensions import db


class Application(db.Model):
    """Stores tenant applications for available rental properties."""

    __tablename__ = "applications"

    application_id = db.Column(db.Integer, primary_key=True)

    property_id = db.Column(
        db.Integer,
        db.ForeignKey("properties.property_id"),
        nullable=False
    )

    applicant_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    application_status = db.Column(
        db.String(30),
        default="pending",
        nullable=False
    )

    review_comments = db.Column(db.Text)

    application_date = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    property = db.relationship("Property", back_populates="applications")
    applicant = db.relationship("User", back_populates="applications")
    tenancy = db.relationship(
        "Tenancy",
        back_populates="application",
        uselist=False
    )
