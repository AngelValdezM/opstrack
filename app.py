from flask import Flask,jsonify
from database import obtener_conexion

app = Flask(__name__)

# ... 

@app.route("/empleados")
def obtener_empleados():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM empleados")
    filas = cursor.fetchall()
    conexion.close()
    
    # tu código aquí
    # 'filas' es una lista de objetos Row (no diccionarios normales)
    # tienes que convertir cada fila a diccionario antes de jsonify
    # pista: dict(fila) convierte un objeto Row en diccionario

    lista_convertida = [dict(fila) for fila in filas]
    
    return jsonify(lista_convertida)

@app.route("/turnos")
def obtener_turnos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    
    # tu código aquí
    # usa el mismo JOIN que ya escribiste en SQL puro en la Sesión 2
    # SELECT turnos.id, empleados.nombre, turnos.estado, turnos.fecha
    # FROM turnos JOIN empleados ON turnos.empleado_id = empleados.id

    cursor.execute("""SELECT turnos.id, empleados.nombre, turnos.estado 
    FROM turnos
    JOIN empleados ON turnos.empleado_id = empleados.id
    """)
    
    filas = cursor.fetchall()
    conexion.close()
    
    lista_convertida = [dict(fila) for fila in filas]
    return jsonify(lista_convertida)




if __name__ == "__main__":
    app.run(debug=True)

