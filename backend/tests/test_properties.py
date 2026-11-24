from decimal import Decimal

from app.extensions import db
from app.models import Application, Property, Role, User


def create_landlord():
    landlord_role = Role.query.filter_by(
        role_name="Landlord"
    ).first()

    landlord = User(
        role_id=landlord_role.role_id,
        full_name="Test Landlord",
        email="landlord@test.com",
        phone_number="0700000001",
        password_hash="test-password-hash",
    )

    db.session.add(landlord)
    db.session.commit()

    return landlord


def create_property(
    landlord,
    name="Modern Apartment",
    property_type="Apartment",
    location="Kilimani, Nairobi",
    rent=Decimal("45000.00"),
    status="available",
):
    property_record = Property(
        owner_id=landlord.user_id,
        property_name=name,
        property_type=property_type,
        location=location,
        description="A comfortable rental property.",
        monthly_rent=rent,
        availability_status=status,
    )

    db.session.add(property_record)
    db.session.commit()

    return property_record


def register_and_login_tenant(client):
    registration = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test Tenant",
            "email": "tenant@test.com",
            "phone_number": "0712345678",
            "password": "TestPass123!",
        },
    )

    assert registration.status_code == 201

    login = client.post(
        "/api/auth/login",
        json={
            "email": "tenant@test.com",
            "password": "TestPass123!",
        },
    )

    assert login.status_code == 200

    return {
        "Authorization": f"Bearer {login.json['access_token']}"
    }


def test_list_available_properties(client, app):
    with app.app_context():
        landlord = create_landlord()

        create_property(landlord)
        create_property(
            landlord,
            name="Unavailable Apartment",
            status="occupied",
        )

    response = client.get("/api/properties")

    assert response.status_code == 200
    assert response.json["success"] is True
    assert len(response.json["properties"]) == 1
    assert response.json["properties"][0]["property_name"] == "Modern Apartment"


def test_filter_properties_by_location_and_rent(client, app):
    with app.app_context():
        landlord = create_landlord()

        create_property(
            landlord,
            name="Kilimani Apartment",
            location="Kilimani, Nairobi",
            rent=Decimal("45000.00"),
        )

        create_property(
            landlord,
            name="Ruiru Apartment",
            location="Ruiru, Kiambu",
            rent=Decimal("25000.00"),
        )

    response = client.get(
        "/api/properties?location=Kilimani&min_rent=30000&max_rent=50000"
    )

    assert response.status_code == 200
    assert len(response.json["properties"]) == 1
    assert response.json["properties"][0]["property_name"] == "Kilimani Apartment"


def test_property_details_returns_available_property(client, app):
    with app.app_context():
        landlord = create_landlord()
        property_record = create_property(landlord)
        property_id = property_record.property_id

    response = client.get(f"/api/properties/{property_id}")

    assert response.status_code == 200
    assert response.json["property"]["property_name"] == "Modern Apartment"
    assert response.json["property"]["landlord"]["full_name"] == "Test Landlord"


def test_unavailable_property_details_return_404(client, app):
    with app.app_context():
        landlord = create_landlord()
        property_record = create_property(
            landlord,
            status="occupied",
        )
        property_id = property_record.property_id

    response = client.get(f"/api/properties/{property_id}")

    assert response.status_code == 404


def test_property_listing_rejects_invalid_rent_filter(client):
    response = client.get("/api/properties?min_rent=invalid")

    assert response.status_code == 400


def test_property_listing_rejects_invalid_rent_range(client):
    response = client.get("/api/properties?min_rent=50000&max_rent=20000")

    assert response.status_code == 400


def test_tenant_can_submit_property_application(client, app):
    with app.app_context():
        landlord = create_landlord()
        property_record = create_property(landlord)
        property_id = property_record.property_id

    headers = register_and_login_tenant(client)

    response = client.post(
        f"/api/properties/{property_id}/applications",
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json["success"] is True
    assert response.json["application"]["application_status"] == "pending"


def test_tenant_cannot_apply_twice_to_same_property(client, app):
    with app.app_context():
        landlord = create_landlord()
        property_record = create_property(landlord)
        property_id = property_record.property_id

    headers = register_and_login_tenant(client)

    first_response = client.post(
        f"/api/properties/{property_id}/applications",
        headers=headers,
    )

    second_response = client.post(
        f"/api/properties/{property_id}/applications",
        headers=headers,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_application_requires_authentication(client, app):
    with app.app_context():
        landlord = create_landlord()
        property_record = create_property(landlord)
        property_id = property_record.property_id

    response = client.post(
        f"/api/properties/{property_id}/applications"
    )

    assert response.status_code == 401


def test_application_rejects_unavailable_property(client, app):
    with app.app_context():
        landlord = create_landlord()
        property_record = create_property(
            landlord,
            status="occupied",
        )
        property_id = property_record.property_id

    headers = register_and_login_tenant(client)

    response = client.post(
        f"/api/properties/{property_id}/applications",
        headers=headers,
    )

    assert response.status_code == 404
