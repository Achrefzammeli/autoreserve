import sqlite3
import os

# Adapte ce chemin selon l'emplacement de ta DB
DB_PATH = os.path.join(os.path.dirname(__file__), "app", "database", "autoreserve.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Vérifie les colonnes existantes
cursor.execute("PRAGMA table_info(users)")
columns = [row[1] for row in cursor.fetchall()]
print("Colonnes actuelles:", columns)

# Ajoute totp_secret si manquant
if "totp_secret" not in columns:
    cursor.execute("ALTER TABLE users ADD COLUMN totp_secret VARCHAR")
    print("✅ totp_secret ajouté")
else:
    print("⏭ totp_secret déjà présent")

# Ajoute totp_enabled si manquant
if "totp_enabled" not in columns:
    cursor.execute("ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT 0")
    print("✅ totp_enabled ajouté")
else:
    print("⏭ totp_enabled déjà présent")

conn.commit()
conn.close()
print("✅ Migration terminée")