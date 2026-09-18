from flask import Flask,jsonify,request
from database import obtener_conexion

app = Flask(__name__)

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

# TURNOS
@app.route("/turnos")
def obtener_turnos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("""SELECT turnos.id, empleados.nombre, turnos.estado 
    FROM turnos
    JOIN empleados ON turnos.empleado_id = empleados.id
    """)
    
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

# INSERTAR TURNO
@app.route("/turnos", methods=["POST"])
def crear_turno():
    # tu código aquí
    # valida que empleado_id, estado y fecha vengan en el body
    # si falta alguno, retorna un error 400 con jsonify({"error": "..."})
    # si están completos, inserta el turno y retorna el turno creado
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


if __name__ == "__main__":
    app.run(debug=True)

