import psycopg2
import psycopg2.extras
import os
from werkzeug.security import generate_password_hash

def obtener_conexion():
    url = os.environ.get("DATABASE_URL")
    conexion = psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)
    return conexion

def inicializar_db():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS empleados (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            cargo TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS turnos (
            id SERIAL PRIMARY KEY,
            empleado_id INTEGER NOT NULL,
            estado TEXT NOT NULL,
            fecha DATE NOT NULL,
            FOREIGN KEY (empleado_id) REFERENCES empleados(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidencias (
            id SERIAL PRIMARY KEY,
            turno_id INTEGER NOT NULL,
            descripcion TEXT NOT NULL,
            severidad TEXT NOT NULL,
            estado TEXT NOT NULL DEFAULT 'abierta',
            FOREIGN KEY (turno_id) REFERENCES turnos(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS checklist_items (
            id SERIAL PRIMARY KEY,
            turno_id INTEGER NOT NULL,
            descripcion TEXT NOT NULL,
            completado INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (turno_id) REFERENCES turnos(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    """)

    cursor.execute("""
        INSERT INTO usuarios (username, password_hash)
        VALUES (%s, %s)
        ON CONFLICT (username) DO NOTHING
    """, ("admin", generate_password_hash("admin123")))

    conexion.commit()
    conexion.close()

if __name__ == "__main__":
    inicializar_db()
    print("Base de datos inicializada correctamente")