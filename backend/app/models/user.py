from datetime import datetime, timezone

from app.extensions import db


class User(db.Model):
    """Stores RentWise user accounts and authentication details."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    role_id = db.Column(
        db.Integer,
        db.ForeignKey("roles.role_id"),
        nullable=False
    )

    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone_number = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    role = db.relationship("Role", back_populates="users")

    owned_properties = db.relationship(
        "Property",
        back_populates="owner",
        foreign_keys="Property.owner_id"
    )

    applications = db.relationship(
        "Application",
        back_populates="applicant"
    )

    tenancies = db.relationship(
        "Tenancy",
        back_populates="tenant"
    )

    notifications = db.relationship(
        "Notification",
        back_populates="user"
    )

    def __repr__(self):
        return f"<User {self.email}>"
