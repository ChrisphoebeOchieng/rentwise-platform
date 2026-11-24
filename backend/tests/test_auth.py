def register_tenant(client):
    return client.post(
        "/api/auth/register",
        json={
            "full_name": "Test Tenant",
            "email": "tenant@test.com",
            "phone_number": "0712345678",
            "password": "TestPass123!",
        },
    )


def test_successful_registration(client):
    response = register_tenant(client)

    assert response.status_code == 201
    assert response.json["success"] is True
    assert response.json["user"]["email"] == "tenant@test.com"


def test_duplicate_email_rejected(client):
    register_tenant(client)

    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Another Tenant",
            "email": "tenant@test.com",
            "phone_number": "0798765432",
            "password": "TestPass123!",
        },
    )

    assert response.status_code == 409


def test_successful_login(client):
    register_tenant(client)

    response = client.post(
        "/api/auth/login",
        json={
            "email": "tenant@test.com",
            "password": "TestPass123!",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json


def test_invalid_password_rejected(client):
    register_tenant(client)

    response = client.post(
        "/api/auth/login",
        json={
            "email": "tenant@test.com",
            "password": "WrongPassword123!",
        },
    )

    assert response.status_code == 401


def test_authenticated_user_can_access_profile(client):
    register_tenant(client)

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "tenant@test.com",
            "password": "TestPass123!",
        },
    )

    token = login_response.json["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json["user"]["email"] == "tenant@test.com"


def test_profile_rejects_missing_token(client):
    response = client.get("/api/auth/me")

    assert response.status_code == 401
