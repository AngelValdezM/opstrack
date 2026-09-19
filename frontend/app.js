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
            <td><button class="btn btn-danger btn-sm" onclick="eliminarEmpleado(${empleado.id})">Eliminar</button>
            <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${empleado.id}, '${empleado.nombre}', '${empleado.cargo}')">Editar</button>
            </td>
            
        </tr>`
    });
    
}

cargarEmpleados();

document.getElementById("form-empleado").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("input-nombre").value;
    const cargo = document.getElementById("input-cargo").value;
    const idEditar = document.getElementById("input-id-editar").value;

    if (idEditar) {
        // modo editar
        await fetch(`http://127.0.0.1:5000/empleados/${idEditar}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nombre, cargo: cargo })
        });
    } else {
        // modo crear
        await fetch("http://127.0.0.1:5000/empleados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: nombre, cargo: cargo })
        });
    }

    // limpiar formulario completo, incluyendo el modo
    document.getElementById("input-nombre").value = "";
    document.getElementById("input-cargo").value = "";
    document.getElementById("input-id-editar").value = "";
    
    const boton = document.querySelector("#form-empleado button[type='submit']");
    boton.textContent = "Agregar empleado";

    const contenedor = document.getElementById("tabla-empleados");
    contenedor.innerHTML = "";
    cargarEmpleados();
});

async function eliminarEmpleado(id) {
    const validacion = confirm("¿Seguro que quieres eliminar este empleado?");
    if(!validacion) {
        return;
    } else {
        const respuesta = await fetch(`http://127.0.0.1:5000/empleados/${id}`, { method: "DELETE" });
        const contenedor = document.getElementById("tabla-empleados");
        contenedor.innerHTML = "";
        cargarEmpleados();
    }
}

function prepararEdicion(id, nombre, cargo) {
    document.getElementById("input-id-editar").value = id;
    document.getElementById("input-nombre").value = nombre;
    document.getElementById("input-cargo").value = cargo;
    
    const boton = document.querySelector("#form-empleado button[type='submit']");
    boton.textContent = "Actualizar empleado";

}

async function cargarIncidencias() {
    const respuesta = await fetch("http://127.0.0.1:5000/incidencias");
    const incidencias = await respuesta.json();

    const contenedor = document.getElementById("tabla-incidencias")
    
    incidencias.forEach(incidencia => {

    const botonHtml = incidencia.estado === "cerrada" 
        ? `<button class="btn btn-secondary btn-sm" disabled>Cerrada</button>`
        : `<button class="btn btn-danger btn-sm" onclick="cerrarIncidencia(${incidencia.id})">Cerrar</button>`;

    contenedor.innerHTML += 
    `<tr>
        <td>${incidencia.id}</td>
        <td>${incidencia.descripcion}</td>
        <td>${incidencia.severidad}</td>
        <td>${incidencia.estado}</td>
        <td>${botonHtml}</td>
    </tr>`
});
}

cargarIncidencias();

document.getElementById("form-incidencia").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const turnoID = document.getElementById("input-turno-id").value;
    const descripcion = document.getElementById("input-descripcion").value;
    const severidad = document.getElementById("input-severidad").value;

    
    const respuesta = await fetch("http://127.0.0.1:5000/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turno_id: turnoID, descripcion: descripcion, severidad : severidad })
    });

    // limpiar formulario completo, incluyendo el modo
    document.getElementById("input-turno-id").value = "";
    document.getElementById("input-descripcion").value = "";
    document.getElementById("input-severidad").value = "baja";
    

    const contenedor = document.getElementById("tabla-incidencias");
    contenedor.innerHTML = "";
    cargarIncidencias();

});

async function cerrarIncidencia(id) {

    await fetch(`http://127.0.0.1:5000/incidencias/${id}/cerrar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
    });
    
    const contenedor = document.getElementById("tabla-incidencias");
    contenedor.innerHTML = "";
    cargarIncidencias();
}