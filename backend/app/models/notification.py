from datetime import datetime, timezone

from app.extensions import db


class Notification(db.Model):
    """Stores notifications delivered to RentWise users."""

    __tablename__ = "notifications"

    notification_id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False,
        index=True
    )

    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)

    read_status = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user = db.relationship("User", back_populates="notifications")
