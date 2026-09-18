import sqlite3

def obtener_conexion():
    conexion = sqlite3.connect("opstrack.db")
    conexion.row_factory = sqlite3.Row  # permite acceder a columnas por nombre
    return conexion

def inicializar_db():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS empleados (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            cargo TEXT
        )
    """)
    
    # tu código aquí — crea la tabla turnos igual que en tu sesion2-schema.sql
    # usa el mismo esquema que ya escribiste (empleado_id, estado, fecha, FOREIGN KEY)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS turnos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            empleado_id INTEGER NOT NULL,
            estado TEXT NOT NULL,
            fecha DATETIME NOT NULL,
            FOREIGN KEY (empleado_id) REFERENCES empleados(id)
        )
    """)

    # Inserta al menos 3 empleados

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
        INSERT INTO turnos (empleado_id, estado, fecha) VALUES (2,'inactivo','2026-05-09');
    """)

    cursor.execute("""
        INSERT INTO turnos (empleado_id, estado, fecha) VALUES (3,'activo','2026-11-09');
    """)

    conexion.commit()
    conexion.close()

if __name__ == "__main__":
    inicializar_db()
    print("Base de datos inicializada correctamente")