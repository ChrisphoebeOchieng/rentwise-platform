from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from app.auth.services import register_user, authenticate_user
from app.models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def serialize_user(user):
    """Return safe user information without exposing password hashes."""

    return {
        "user_id": user.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role.role_name,
        "is_active": user.is_active
    }


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "full_name",
        "email",
        "phone_number",
        "password"
    ]

    missing_fields = [
        field for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return jsonify({
            "success": False,
            "message": "All registration fields are required.",
            "missing_fields": missing_fields
        }), 400

    full_name = data["full_name"].strip()
    email = data["email"].strip()
    phone_number = data["phone_number"].strip()
    password = data["password"]

    if len(full_name) < 2:
        return jsonify({
            "success": False,
            "message": "Please provide a valid full name."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 8 characters."
        }), 400

    try:
        user = register_user(
            full_name,
            email,
            phone_number,
            password
        )

        return jsonify({
            "success": True,
            "message": "Account registered successfully.",
            "user": serialize_user(user)
        }), 201

    except ValueError as error:
        return jsonify({
            "success": False,
            "message": str(error)
        }), 409


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    user = authenticate_user(email, password)

    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    access_token = create_access_token(
        identity=str(user.user_id),
        additional_claims={
            "role": user.role.role_name
        }
    )

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "access_token": access_token,
        "user": serialize_user(user)
    }), 200


@auth_bp.get("/me")
@jwt_required()
def current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.is_active:
        return jsonify({
            "success": False,
            "message": "User account unavailable."
        }), 404

    return jsonify({
        "success": True,
        "user": serialize_user(user)
    }), 200
