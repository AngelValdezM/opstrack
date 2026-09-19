from flask import Flask,jsonify,request
from flask_cors import CORS
from database import obtener_conexion

app = Flask(__name__)
CORS(app)

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

    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("DELETE FROM empleados WHERE id = ?", (id,))
    
    conexion.commit()
    conexion.close()    
    return jsonify({"mensaje": "Empleado eliminado"})

# INSERTAR EMPLEADO
@app.route("/empleados", methods=["POST"])
def crear_empleado():
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

if __name__ == "__main__":
    app.run(debug=True)

