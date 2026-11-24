from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import or_

from app.extensions import db
from app.models import Application, Property, User


properties_bp = Blueprint("properties", __name__, url_prefix="/api/properties")


def serialize_property(property_record, include_owner=False):
    images = sorted(
        property_record.images,
        key=lambda image: (not image.is_primary, image.image_id)
    )

    data = {
        "property_id": property_record.property_id,
        "property_name": property_record.property_name,
        "property_type": property_record.property_type,
        "location": property_record.location,
        "description": property_record.description,
        "monthly_rent": str(property_record.monthly_rent),
        "bedrooms": property_record.bedrooms,
        "bathrooms": property_record.bathrooms,
        "floor_area": (
            str(property_record.floor_area)
            if property_record.floor_area is not None else None
        ),
        "furnished": property_record.furnished,
        "amenities": property_record.amenities or [],
        "availability_status": property_record.availability_status,
        "primary_image": images[0].image_url if images else None,
        "images": [
            {
                "image_id": image.image_id,
                "image_url": image.image_url,
                "is_primary": image.is_primary,
            }
            for image in images
        ],
        "created_at": (
            property_record.created_at.isoformat()
            if property_record.created_at else None
        ),
    }

    if include_owner:
        data["landlord"] = {
            "full_name": property_record.owner.full_name
        }

    return data


def get_active_tenant():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    user = db.session.get(User, user_id)

    if not user or not user.is_active:
        return None

    if not user.role or user.role.role_name.lower() != "tenant":
        return None

    return user


def parse_rent_filter(value, field_name):
    if value is None or value == "":
        return None

    try:
        amount = Decimal(value)
        if not amount.is_finite() or amount < 0:
            raise ValueError
        return amount
    except (InvalidOperation, ValueError):
        raise ValueError(f"{field_name} must be a valid non-negative amount.")


@properties_bp.get("")
def list_properties():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 12))

        if page < 1:
            raise ValueError

        if per_page < 1 or per_page > 50:
            raise ValueError

        min_rent = parse_rent_filter(
            request.args.get("min_rent"), "min_rent"
        )
        max_rent = parse_rent_filter(
            request.args.get("max_rent"), "max_rent"
        )

    except ValueError as error:
        message = str(error) or "Invalid pagination values."
        return jsonify({"success": False, "message": message}), 400

    if min_rent is not None and max_rent is not None:
        if min_rent > max_rent:
            return jsonify({
                "success": False,
                "message": "min_rent cannot be greater than max_rent.",
            }), 400

    query = Property.query.filter(
        Property.availability_status == "available"
    )

    location = request.args.get("location", "").strip()
    property_type = request.args.get("property_type", "").strip()
    search = request.args.get("search", "").strip()

    if location:
        query = query.filter(Property.location.ilike(f"%{location}%"))

    if property_type:
        query = query.filter(
            Property.property_type.ilike(property_type)
        )

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Property.property_name.ilike(search_term),
                Property.location.ilike(search_term),
                Property.description.ilike(search_term),
                Property.property_type.ilike(search_term),
            )
        )

    if min_rent is not None:
        query = query.filter(Property.monthly_rent >= min_rent)

    if max_rent is not None:
        query = query.filter(Property.monthly_rent <= max_rent)

    sort = request.args.get("sort", "newest")

    if sort == "rent_asc":
        query = query.order_by(Property.monthly_rent.asc())
    elif sort == "rent_desc":
        query = query.order_by(Property.monthly_rent.desc())
    elif sort == "newest":
        query = query.order_by(Property.created_at.desc())
    else:
        return jsonify({
            "success": False,
            "message": "sort must be newest, rent_asc or rent_desc.",
        }), 400

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        "success": True,
        "properties": [
            serialize_property(item)
            for item in pagination.items
        ],
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total_items": pagination.total,
            "total_pages": pagination.pages,
            "has_next": pagination.has_next,
            "has_previous": pagination.has_prev,
        },
    }), 200


@properties_bp.get("/<int:property_id>")
def property_details(property_id):
    property_record = db.session.get(Property, property_id)

    if (
        not property_record
        or property_record.availability_status != "available"
    ):
        return jsonify({
            "success": False,
            "message": "Property not found or no longer available.",
        }), 404

    return jsonify({
        "success": True,
        "property": serialize_property(
            property_record,
            include_owner=True
        ),
    }), 200


@properties_bp.post("/<int:property_id>/applications")
@jwt_required()
def submit_application(property_id):
    tenant = get_active_tenant()

    if not tenant:
        return jsonify({
            "success": False,
            "message": "Only active tenant accounts can submit applications.",
        }), 403

    property_record = db.session.get(Property, property_id)

    if (
        not property_record
        or property_record.availability_status != "available"
    ):
        return jsonify({
            "success": False,
            "message": "Property not found or no longer available.",
        }), 404

    existing_application = Application.query.filter(
        Application.property_id == property_id,
        Application.applicant_id == tenant.user_id,
        Application.application_status.in_(["pending", "approved"]),
    ).first()

    if existing_application:
        return jsonify({
            "success": False,
            "message": "You already have an active application for this property.",
        }), 409

    application = Application(
        property_id=property_id,
        applicant_id=tenant.user_id,
        application_status="pending",
    )

    db.session.add(application)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Your property application has been submitted successfully.",
        "application": {
            "application_id": application.application_id,
            "property_id": application.property_id,
            "application_status": application.application_status,
            "application_date": application.application_date.isoformat(),
        },
    }), 201
