# app/database/init_db.py
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.core.config import settings

def init_admin_user():
    db = SessionLocal()
    try:
        # On cherche si l'admin existe déjà
        admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        
        if not admin:
            print(f"🔧 Création de l'utilisateur admin : {settings.FIRST_ADMIN_EMAIL}")
            admin = User(
                name="Admin",
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=hash_password(settings.FIRST_ADMIN_PASSWORD),
                role="ADMIN",
            )
            db.add(admin)
            db.commit()
        else:
            # Optionnel : On s'assure qu'il est bien ADMIN
            if admin.role != "ADMIN":
                admin.role = "ADMIN"
                db.commit()
            print(f"✅ L'admin {settings.FIRST_ADMIN_EMAIL} est déjà prêt.")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de l'admin : {e}")
    finally:
        db.close()