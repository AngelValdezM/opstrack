from flask import Flask,jsonify

app = Flask(__name__)

@app.route("/")
def inicio():
    # tu código aquí — retorna un diccionario, Flask lo convierte a JSON solo
    return {"mensaje": "Hola"}
    

@app.route("/empleados")
def obtener_empleados():
    lista_empleados = [
        {
            "id": 1,
            "nombre": "Angel",
            "cargo": "Ingeniero"
        },
        {
            "id": 2,
            "nombre": "Christian",
            "cargo": "Ingeniero"
        },
        {
            "id": 3,
            "nombre": "Jose Luis",
            "cargo": "Ingeniero"
        }
    ]
    return jsonify(lista_empleados)


if __name__ == "__main__":
    app.run(debug=True)

