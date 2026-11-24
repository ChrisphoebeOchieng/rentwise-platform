from app import create_app
from app.extensions import db
from app.models import Role

ROLES = [
    {
        "role_name": "Administrator",
        "description": "Manages platform users, properties and system operations."
    },
    {
        "role_name": "Landlord",
        "description": "Manages owned rental properties and tenancy operations."
    },
    {
        "role_name": "Property Manager",
        "description": "Manages delegated property and tenancy operations."
    },
    {
        "role_name": "Tenant",
        "description": "Searches for rental properties and manages applications and tenancies."
    }
]


def seed_roles():
    app = create_app()

    with app.app_context():
        for role_data in ROLES:
            existing_role = Role.query.filter_by(
                role_name=role_data["role_name"]
            ).first()

            if not existing_role:
                db.session.add(Role(**role_data))
                print(f"Created role: {role_data['role_name']}")
            else:
                print(f"Already exists: {role_data['role_name']}")

        db.session.commit()
        print("\nRentWise roles seeded successfully.")


if __name__ == "__main__":
    seed_roles()
