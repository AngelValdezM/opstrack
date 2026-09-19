async function cargarEmpleados() {
    const respuesta = await fetch("http://127.0.0.1:5000/empleados");
    const empleados = await respuesta.json();

    const contenedor = document.getElementById("tabla-empleados")
    
    empleados.forEach(empleado => {
        contenedor.innerHTML += 
        `<tr>
            <td>${empleado.id}</td>
            <td>${empleado.nombre}</td>
            <td>${empleado.cargo}</td>
        </tr>`
    });
    
}

cargarEmpleados();

document.getElementById("form-empleado").addEventListener("submit", async (evento) => {
    evento.preventDefault(); // evita que la página se recargue (comportamiento normal de un <form>)

    const nombre = document.getElementById("input-nombre").value;
    const cargo = document.getElementById("input-cargo").value;
    
    const respuesta = await fetch("http://127.0.0.1:5000/empleados", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nombre: nombre, cargo: cargo })
                        });
    
    if (!respuesta.ok) {
    console.error("Error al crear empleado");
    return; 
    }
    
    const contenedor = document.getElementById("tabla-empleados");
    contenedor.innerHTML = "";

    cargarEmpleados();
    
    document.getElementById("input-nombre").value = "";
    document.getElementById("input-cargo").value = "";

});
