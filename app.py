from flask import Flask,jsonify,request, session
from flask_cors import CORS
from database import obtener_conexion
from werkzeug.security import check_password_hash

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5500"])
app.secret_key = "thecrack2104"  # necesario para que las sesiones funcionen

@app.route("/login", methods=["POST"])
def login():
    datos = request.json
    username = datos.get("username")
    password = datos.get("password")

    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE username = ?", (username,))
    usuario = cursor.fetchone()
    conexion.close()

    if usuario is None:
        return jsonify({"error": "Usuario no encontrado"}), 401

    if not check_password_hash(usuario["password_hash"], password):
        return jsonify({"error": "Contraseña incorrecta"}), 401

    session["usuario_id"] = usuario["id"]
    return jsonify({"mensaje": "Login exitoso"})

@app.route("/logout", methods=["POST"])
def logout():
    session.pop("usuario_id", None)
    return jsonify({"mensaje": "Logout exitoso"})

# EMPLEADOS
@app.route("/empleados")
def obtener_empleados():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM empleados")
    filas = cursor.fetchall()
    conexion.close()

    lista_convertida = [dict(fila) for fila in filas]
    
    return jsonify(lista_convertida)

# ACTUALIZA EMPLEADOS
@app.route("/empleados/<int:id>", methods=["PUT"])
def actualizar_empleado(id):

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401

    datos = request.json
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
    UPDATE empleados 
    SET nombre = ?, cargo = ? 
    WHERE id = ?;
    """, (datos.get("nombre"),datos.get("cargo"),id))

    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Empleado actualizado"})


# ELIMINA EMPLEADO
@app.route("/empleados/<int:id>", methods=["DELETE"])
def eliminar_empleado(id):

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("DELETE FROM empleados WHERE id = ?", (id,))
    
    conexion.commit()
    conexion.close()    
    return jsonify({"mensaje": "Empleado eliminado"})

# INSERTAR EMPLEADO
@app.route("/empleados", methods=["POST"])
def crear_empleado():

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401
    
    datos = request.json

    if not datos.get("nombre"):
        return jsonify({"error": "nombre es obligatorio"}), 400
    if not datos.get("cargo"):
        return jsonify({"error": "cargo es obligatoria"}), 400

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        INSERT INTO empleados (nombre, cargo)
        VALUES (?, ?)
    """, (datos["nombre"], datos["cargo"]))

    conexion.commit()
    conexion.close()

    return jsonify({"mensaje": "Empleado creado"}), 201

# TURNOS
@app.route("/turnos")
def obtener_turnos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""SELECT turnos.id, empleados.nombre AS empleado_nombre, turnos.estado, turnos.fecha
    FROM turnos
    JOIN empleados ON turnos.empleado_id = empleados.id
    """)
    
    filas = cursor.fetchall()
    conexion.close()
    
    lista_convertida = [dict(fila) for fila in filas]
    return jsonify(lista_convertida)

# INSERTAR TURNO
@app.route("/turnos", methods=["POST"])
def crear_turno():

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401

    datos = request.json

    if not datos.get("empleado_id"):
        return jsonify({"error": "empleado_id es obligatorio"}), 400
    if not datos.get("estado"):
        return jsonify({"error": "estado es obligatorio"}), 400
    if not datos.get("fecha"):
        return jsonify({"error": "fecha es obligatoria"}), 400

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        INSERT INTO turnos (empleado_id, estado, fecha)
        VALUES (?, ?, ?)
    """, (datos["empleado_id"], datos["estado"], datos["fecha"]))

    conexion.commit()
    conexion.close()

    return jsonify({"mensaje": "Turno creado"}), 201

# INCIDENCIAS

@app.route("/incidencias")
def obtener_incidencias():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
        
    cursor.execute("""SELECT incidencias.id, incidencias.descripcion,   incidencias.severidad, incidencias.estado 
    FROM incidencias
    JOIN turnos ON incidencias.turno_id = turnos.id
    """)
        
    filas = cursor.fetchall()
    conexion.close()
        
    lista_convertida = [dict(fila) for fila in filas]
    return jsonify(lista_convertida)

# INSERTAR INCIDENCIAS
@app.route("/incidencias", methods=["POST"])
def crear_incidencia():

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401

    datos = request.json

    if not datos.get("turno_id"):
        return jsonify({"error": "turno_id es obligatorio"}), 400
    if not datos.get("descripcion"):
        return jsonify({"error": "descripcion es obligatorio"}), 400
    if not datos.get("severidad"):
        return jsonify({"error": "severidad es obligatoria"}), 400

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        INSERT INTO incidencias (turno_id, descripcion, severidad)
        VALUES (?, ?, ?)
    """, (datos["turno_id"], datos["descripcion"], datos["severidad"]))

    conexion.commit()
    conexion.close()

    return jsonify({"mensaje": "Incidencia creada"}), 201

# CERRAR INCIDENCIA 

@app.route("/incidencias/<int:id>/cerrar", methods=["PUT"])
def cerrar_incidencia(id):

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401
    
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    cursor.execute("""
    UPDATE incidencias 
    SET estado = 'cerrada' 
    WHERE id = ?;
    """, (id,))
    
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Incidencia cerrada"})

# INCIDENCIAS POR SEVERIDAD

@app.route("/metricas/incidencias-por-severidad")
def metricas_incidencias_severidad():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT severidad, COUNT(*) as total
        FROM incidencias
        GROUP BY severidad
    """)

    filas = cursor.fetchall()
    conexion.close()

    lista_convertida = [dict(fila) for fila in filas]
    return jsonify(lista_convertida)

# TURNOS POR ESTADO

@app.route("/metricas/turnos-por-estado")
def metricas_turnos_estado():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT estado, COUNT(*) as total
        FROM turnos
        GROUP BY estado
    """)

    filas = cursor.fetchall()
    conexion.close()

    lista_convertida = [dict(fila) for fila in filas]
    return jsonify(lista_convertida)

# INCIDENCIAS ABIERTAS

@app.route("/metricas/incidencias-abiertas")
def metricas_incidencias_abiertas():

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT COUNT(*) as total
        FROM incidencias
        WHERE estado = 'abierta'
    """)

    fila = cursor.fetchone()
    conexion.close()
    
    return jsonify(dict(fila))

# LISTAR ITEMS POR TURNO

@app.route("/turnos/<int:turno_id>/checklist")
def obtener_checklist(turno_id):
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""
        SELECT * FROM checklist_items WHERE turno_id = ?
    """, (turno_id,))

    filas = cursor.fetchall()
    conexion.close()

    lista_convertida = [dict(fila) for fila in filas]
    return jsonify(lista_convertida)

# AGREGAR ITEMS POR TURNO

@app.route("/turnos/<int:turno_id>/checklist", methods=["POST"])
def crear_item_checklist(turno_id):

    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401
    
    datos = request.json

    if not datos.get("descripcion"):
        return jsonify({"error": "descripcion es obligatorio"}), 400
    
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    cursor.execute("""
        INSERT INTO checklist_items (turno_id, descripcion)
        VALUES (?, ?)
    """, (turno_id,datos["descripcion"]))
    
    conexion.commit()
    conexion.close()
    
    return jsonify({"mensaje": "Item agregado"}), 201

# MARCAR/DESMARCAR ITEM

@app.route("/checklist/<int:id>/toggle", methods=["PUT"])
def toggle_item_checklist(id):
    if "usuario_id" not in session:
        return jsonify({"error": "No autorizado, inicia sesión"}), 401


    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("SELECT * FROM checklist_items WHERE id = ?", (id,))
    item = cursor.fetchone()

    if item["completado"] == 1:
        nuevo_estado = 0
    else:
        nuevo_estado = 1

    cursor.execute("""
        UPDATE checklist_items 
        SET completado = ?
        WHERE id = ?
    """, (nuevo_estado, id))
        
    conexion.commit()
    conexion.close()
    return jsonify({"mensaje": "Item actualizado"})


if __name__ == "__main__":
    import os
    puerto = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=puerto)