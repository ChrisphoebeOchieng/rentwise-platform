import pytest

from app import create_app
from app.extensions import db
from app.models import Role


class TestConfig:
    TESTING = True
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "rentwise-test-jwt-secret-key-at-least-32-characters"
    SQLALCHEMY_DATABASE_URI = "sqlite://"
    SQLALCHEMY_TRACK_MODIFICATIONS = False


@pytest.fixture
def app():
    app = create_app(TestConfig)

    with app.app_context():
        db.create_all()

        roles = [
            Role(role_name="Administrator"),
            Role(role_name="Landlord"),
            Role(role_name="Property Manager"),
            Role(role_name="Tenant"),
        ]

        db.session.add_all(roles)
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()
