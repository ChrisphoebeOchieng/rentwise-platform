from decimal import Decimal

from app import create_app
from app.extensions import db, bcrypt
from app.models import Role, User, Property, PropertyImage


app = create_app()

SAMPLE_PROPERTIES = [
    {
        "property_name": "The Ivory Residences",
        "property_type": "Apartment",
        "location": "Kilimani, Nairobi",
        "description": "A contemporary two-bedroom apartment with spacious interiors, natural lighting and convenient access to shopping centres, restaurants and essential services.",
        "monthly_rent": Decimal("65000"),
        "bedrooms": 2,
        "bathrooms": 2,
        "floor_area": Decimal("105.00"),
        "furnished": True,
        "amenities": ["Swimming pool", "Gym", "Lift", "Parking", "24-hour security", "Balcony"],
        "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200"
    },
    {
        "property_name": "Westlands Urban Suites",
        "property_type": "Apartment",
        "location": "Westlands, Nairobi",
        "description": "A modern one-bedroom apartment designed for comfortable urban living, with elegant finishes and convenient access to business and entertainment districts.",
        "monthly_rent": Decimal("48000"),
        "bedrooms": 1,
        "bathrooms": 1,
        "floor_area": Decimal("68.00"),
        "furnished": True,
        "amenities": ["Lift", "Backup generator", "Parking", "24-hour security", "Balcony"],
        "image_url": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200"
    },
    {
        "property_name": "Ruaka Comfort Homes",
        "property_type": "Bedsitter",
        "location": "Ruaka, Kiambu",
        "description": "A compact and practical bedsitter with a comfortable living area and convenient access to local shops and transport connections.",
        "monthly_rent": Decimal("15000"),
        "bedrooms": 0,
        "bathrooms": 1,
        "floor_area": Decimal("28.00"),
        "furnished": False,
        "amenities": ["Water supply", "Security", "Prepaid electricity", "Tiled floors"],
        "image_url": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200"
    },
    {
        "property_name": "Rongai Garden Apartments",
        "property_type": "Apartment",
        "location": "Ongata Rongai, Kajiado",
        "description": "A welcoming one-bedroom apartment with a practical layout, comfortable interiors and access to everyday amenities.",
        "monthly_rent": Decimal("22000"),
        "bedrooms": 1,
        "bathrooms": 1,
        "floor_area": Decimal("45.00"),
        "furnished": False,
        "amenities": ["Parking", "Water storage", "Security", "Balcony"],
        "image_url": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200"
    },
    {
        "property_name": "South B Residence",
        "property_type": "Apartment",
        "location": "South B, Nairobi",
        "description": "A spacious two-bedroom apartment with a functional layout and convenient access to Nairobi's major roads, shops and services.",
        "monthly_rent": Decimal("42000"),
        "bedrooms": 2,
        "bathrooms": 2,
        "floor_area": Decimal("90.00"),
        "furnished": False,
        "amenities": ["Parking", "Lift", "24-hour security", "Balcony", "Water storage"],
        "image_url": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200"
    },
    {
        "property_name": "Kasarani Heights",
        "property_type": "Apartment",
        "location": "Kasarani, Nairobi",
        "description": "A comfortable one-bedroom home offering practical living spaces in a convenient residential neighbourhood.",
        "monthly_rent": Decimal("25000"),
        "bedrooms": 1,
        "bathrooms": 1,
        "floor_area": Decimal("52.00"),
        "furnished": False,
        "amenities": ["Parking", "Security", "Water storage", "Balcony"],
        "image_url": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200"
    },
    {
        "property_name": "Thika Modern Living",
        "property_type": "Studio",
        "location": "Thika, Kiambu",
        "description": "A thoughtfully arranged studio apartment with modern interior styling and convenient access to local amenities.",
        "monthly_rent": Decimal("12000"),
        "bedrooms": 0,
        "bathrooms": 1,
        "floor_area": Decimal("25.00"),
        "furnished": True,
        "amenities": ["Water supply", "Security", "Prepaid electricity", "Tiled floors"],
        "image_url": "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200"
    },
    {
        "property_name": "Coastal Breeze Apartments",
        "property_type": "Apartment",
        "location": "Nyali, Mombasa",
        "description": "A comfortable one-bedroom apartment in a coastal residential neighbourhood, with a practical interior layout and access to local amenities.",
        "monthly_rent": Decimal("35000"),
        "bedrooms": 1,
        "bathrooms": 1,
        "floor_area": Decimal("60.00"),
        "furnished": True,
        "amenities": ["Swimming pool", "Parking", "24-hour security", "Balcony", "Water storage"],
        "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200"
    }
]


with app.app_context():
    try:
        landlord_role = Role.query.filter_by(role_name="Landlord").first()

        if not landlord_role:
            raise RuntimeError("Landlord role was not found. Seed the roles first.")

        landlord = User.query.filter_by(
            email="development.landlord@rentwise.local"
        ).first()

        if not landlord:
            landlord = User(
                role_id=landlord_role.role_id,
                full_name="RentWise Development Landlord",
                email="development.landlord@rentwise.local",
                phone_number="0700000001",
                password_hash=bcrypt.generate_password_hash(
                    "RentWiseDev2026!"
                ).decode("utf-8"),
                is_active=True
            )
            db.session.add(landlord)
            db.session.flush()

        created_count = 0
        updated_count = 0

        for item in SAMPLE_PROPERTIES:
            property_record = Property.query.filter_by(
                property_name=item["property_name"]
            ).first()

            if property_record:
                updated_count += 1
            else:
                property_record = Property(
                    owner_id=landlord.user_id,
                    property_name=item["property_name"]
                )
                db.session.add(property_record)
                created_count += 1

            property_record.property_type = item["property_type"]
            property_record.location = item["location"]
            property_record.description = item["description"]
            property_record.monthly_rent = item["monthly_rent"]
            property_record.bedrooms = item["bedrooms"]
            property_record.bathrooms = item["bathrooms"]
            property_record.floor_area = item["floor_area"]
            property_record.furnished = item["furnished"]
            property_record.amenities = item["amenities"]
            property_record.availability_status = "available"

            db.session.flush()

            if not property_record.images:
                db.session.add(
                    PropertyImage(
                        property_id=property_record.property_id,
                        image_url=item["image_url"],
                        is_primary=True
                    )
                )

        db.session.commit()

        print("\nRentWise development data updated successfully.")
        print(f"New properties created: {created_count}")
        print(f"Existing properties updated: {updated_count}")
        print(f"Total properties: {Property.query.count()}")
        print(f"Total property images: {PropertyImage.query.count()}")

    except Exception:
        db.session.rollback()
        raise
