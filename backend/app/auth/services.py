from app.extensions import db, bcrypt
from app.models import User, Role


def register_user(full_name, email, phone_number, password):
    """Register a new tenant account."""

    normalized_email = email.strip().lower()

    if User.query.filter_by(email=normalized_email).first():
        raise ValueError("An account with this email already exists.")

    if User.query.filter_by(phone_number=phone_number).first():
        raise ValueError("An account with this phone number already exists.")

    tenant_role = Role.query.filter_by(role_name="Tenant").first()

    if not tenant_role:
        raise ValueError("Tenant role has not been configured.")

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        full_name=full_name.strip(),
        email=normalized_email,
        phone_number=phone_number.strip(),
        password_hash=password_hash,
        role_id=tenant_role.role_id
    )

    db.session.add(user)
    db.session.commit()

    return user


def authenticate_user(email, password):
    """Authenticate a user using their email and password."""

    normalized_email = email.strip().lower()
    user = User.query.filter_by(email=normalized_email).first()

    if not user or not bcrypt.check_password_hash(
        user.password_hash, password
    ):
        return None

    if not user.is_active:
        return None

    return user
