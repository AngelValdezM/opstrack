import sqlite3
from werkzeug.security import generate_password_hash

def obtener_conexion():
    conexion = sqlite3.connect("opstrack.db")
    conexion.row_factory = sqlite3.Row  # permite acceder a columnas por nombre
    return conexion

def inicializar_db():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    # EMPLEADOS

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS empleados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cargo TEXT
        )
    """)
    
    # TURNOS
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS turnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            empleado_id INTEGER NOT NULL,
            estado TEXT NOT NULL,
            fecha DATETIME NOT NULL,
            FOREIGN KEY (empleado_id) REFERENCES empleados(id)
        )
    """)

    cursor.execute(""" 
        INSERT INTO empleados (nombre, cargo) VALUES ('Angel','Ingeniero');
    """)

    cursor.execute(""" 
        INSERT INTO empleados (nombre, cargo) VALUES ('Christian','Publicista');
    """)

    cursor.execute(""" 
        INSERT INTO empleados (nombre, cargo) VALUES ('Jose Luis','Arquitecto');
    """)

    cursor.execute("""
        INSERT INTO turnos (empleado_id, estado, fecha) VALUES (1,'activo','2026-09-09');
    """)

    cursor.execute("""
        INSERT INTO turnos (empleado_id, estado, fecha) VALUES (2,'finalizado','2026-05-09');
    """)

    cursor.execute("""
        INSERT INTO turnos (empleado_id, estado, fecha) VALUES (3,'activo','2026-11-09');
    """)

    # INCIDENCIA

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        turno_id INTEGER NOT NULL,
        descripcion TEXT NOT NULL,
        severidad TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'abierta',
        FOREIGN KEY (turno_id) REFERENCES turnos(id)
        )
    """)

    cursor.execute(""" 
            INSERT INTO incidencias (turno_id, descripcion, severidad, estado) VALUES ('1','Nombre mal hecho', 'baja', 'cerrada');
        """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL)
    """)

    cursor.execute("""
    INSERT OR IGNORE INTO usuarios (username, password_hash)
    VALUES (?, ?)
    """, ("admin", generate_password_hash("admin123")))
    

    conexion.commit()
    conexion.close()

if __name__ == "__main__":
    inicializar_db()
    print("Base de datos inicializada correctamente")