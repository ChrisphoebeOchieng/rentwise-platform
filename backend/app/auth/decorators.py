from functools import wraps

from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from app.models import User


def roles_required(*allowed_roles):
    """Restrict an endpoint to users with specified roles."""

    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()

            user_id = get_jwt_identity()
            user = db_user = User.query.get(user_id)

            if not db_user or not user.is_active:
                return jsonify({
                    "success": False,
                    "message": "Your account is inactive or unavailable."
                }), 403

            if user.role.role_name not in allowed_roles:
                return jsonify({
                    "success": False,
                    "message": "You do not have permission to access this resource."
                }), 403

            return function(*args, **kwargs)

        return wrapper

    return decorator
