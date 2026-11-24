from flask import Flask, jsonify

from app.config import Config
from app.extensions import db, migrate, jwt, bcrypt, cors
from app import models
from app.auth.routes import auth_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(auth_bp)

    @app.get("/api/health")
    def health_check():
        return jsonify({
            "success": True,
            "message": "RentWise API is running."
        }), 200

    return app
