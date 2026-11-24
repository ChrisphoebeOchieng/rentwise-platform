from datetime import datetime, timezone

from app.extensions import db


class Payment(db.Model):
    """Stores rental payment transactions and payment records."""

    __tablename__ = "payments"

    payment_id = db.Column(db.Integer, primary_key=True)

    tenancy_id = db.Column(
        db.Integer,
        db.ForeignKey("tenancies.tenancy_id"),
        nullable=False
    )

    amount_due = db.Column(db.Numeric(12, 2), nullable=False)
    amount_paid = db.Column(
        db.Numeric(12, 2),
        default=0,
        nullable=False
    )

    payment_date = db.Column(db.DateTime(timezone=True))
    payment_method = db.Column(db.String(50))
    transaction_reference = db.Column(db.String(100), unique=True)

    payment_status = db.Column(
        db.String(30),
        default="pending",
        nullable=False
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    tenancy = db.relationship("Tenancy", back_populates="payments")

    @property
    def balance(self):
        return self.amount_due - self.amount_paid
