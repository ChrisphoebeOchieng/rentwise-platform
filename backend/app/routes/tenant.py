from decimal import Decimal

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models import (
    User,
    Tenancy,
    Application,
    Payment,
    MaintenanceRequest,
    Notification,
)

tenant_bp = Blueprint("tenant", __name__, url_prefix="/api/tenant")


def serialize_payment(payment):
    return {
        "payment_id": payment.payment_id,
        "amount_due": str(payment.amount_due),
        "amount_paid": str(payment.amount_paid),
        "balance": str(payment.balance),
        "payment_status": payment.payment_status,
        "payment_method": payment.payment_method,
        "transaction_reference": payment.transaction_reference,
        "payment_date": (
            payment.payment_date.isoformat()
            if payment.payment_date else None
        ),
    }


def serialize_property(property_record):
    primary_image = next(
        (image for image in property_record.images if image.is_primary),
        property_record.images[0] if property_record.images else None,
    )

    return {
        "property_id": property_record.property_id,
        "property_name": property_record.property_name,
        "property_type": property_record.property_type,
        "location": property_record.location,
        "description": property_record.description,
        "monthly_rent": str(property_record.monthly_rent),
        "image_url": primary_image.image_url if primary_image else None,
    }


@tenant_bp.get("/dashboard")
@jwt_required()
def tenant_dashboard():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)

    if not user or not user.is_active:
        return jsonify({
            "success": False,
            "message": "Your account could not be verified.",
        }), 401

    if user.role.role_name != "Tenant":
        return jsonify({
            "success": False,
            "message": "You are not authorised to access this dashboard.",
        }), 403

    active_tenancy = (
        Tenancy.query
        .filter_by(tenant_id=user.user_id, tenancy_status="active")
        .order_by(Tenancy.created_at.desc())
        .first()
    )

    applications = (
        Application.query
        .filter_by(applicant_id=user.user_id)
        .order_by(Application.application_date.desc())
        .all()
    )

    payments = (
        Payment.query
        .join(Tenancy, Payment.tenancy_id == Tenancy.tenancy_id)
        .filter(Tenancy.tenant_id == user.user_id)
        .order_by(Payment.created_at.desc())
        .all()
    )

    maintenance_requests = (
        MaintenanceRequest.query
        .filter_by(tenant_id=user.user_id)
        .order_by(MaintenanceRequest.request_date.desc())
        .limit(5)
        .all()
    )

    notifications = (
        Notification.query
        .filter_by(user_id=user.user_id)
        .order_by(Notification.created_at.desc())
        .limit(5)
        .all()
    )

    total_due = sum(
        (payment.balance for payment in payments),
        Decimal("0.00"),
    )
    total_paid = sum(
        (payment.amount_paid for payment in payments),
        Decimal("0.00"),
    )

    tenancy_data = None

    if active_tenancy:
        property_record = active_tenancy.application.property

        tenancy_data = {
            "tenancy_id": active_tenancy.tenancy_id,
            "start_date": active_tenancy.start_date.isoformat(),
            "end_date": (
                active_tenancy.end_date.isoformat()
                if active_tenancy.end_date else None
            ),
            "monthly_rent": str(active_tenancy.monthly_rent),
            "tenancy_status": active_tenancy.tenancy_status,
            "property": serialize_property(property_record),
        }

    application_data = [
        {
            "application_id": application.application_id,
            "application_status": application.application_status,
            "application_date": application.application_date.isoformat(),
            "property": serialize_property(application.property),
        }
        for application in applications
    ]

    maintenance_data = [
        {
            "request_id": request.request_id,
            "description": request.description,
            "priority": request.priority,
            "request_status": request.request_status,
            "request_date": request.request_date.isoformat(),
            "property_name": request.property.property_name,
        }
        for request in maintenance_requests
    ]

    notification_data = [
        {
            "notification_id": notification.notification_id,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "read_status": notification.read_status,
            "created_at": notification.created_at.isoformat(),
        }
        for notification in notifications
    ]

    return jsonify({
        "success": True,
        "user": {
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
        },
        "summary": {
            "active_tenancy": active_tenancy is not None,
            "total_applications": len(applications),
            "pending_applications": sum(
                1 for application in applications
                if application.application_status == "pending"
            ),
            "total_payments": len(payments),
            "total_paid": str(total_paid),
            "outstanding_balance": str(total_due),
            "unread_notifications": sum(
                1 for notification in notifications
                if not notification.read_status
            ),
        },
        "tenancy": tenancy_data,
        "applications": application_data,
        "recent_payments": [
            serialize_payment(payment) for payment in payments[:5]
        ],
        "maintenance_requests": maintenance_data,
        "notifications": notification_data,
    }), 200
