// LOGIN

document.getElementById("form-login").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const username = document.getElementById("input-username").value;
    const password = document.getElementById("input-password").value;

    const respuesta = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // <- sin esto, la sesión no persiste en el navegador
    body: JSON.stringify({ username: username, password: password })
    });


    const errorLogin = document.getElementById("mensaje-login");
    const seccionLogin = document.getElementById("seccion-login");
    const seccionApp = document.getElementById("seccion-app");

    if (!respuesta.ok) {
        const datosError = await respuesta.json();
        errorLogin.textContent = datosError.error;
        return;
    }

    errorLogin.textContent = "";
    seccionLogin.style.display = "none";
    seccionApp.style.display = "block";
    cargarEmpleados();
    cargarTurnos();
    cargarIncidencias();
    cargarContadorAbiertas();
    cargarGraficoSeveridad();
    cargarGraficoTurnos();

});


// EMPLEADOS

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
            credentials: "include",
            body: JSON.stringify({ nombre: nombre, cargo: cargo })
        });
    } else {
        // modo crear
        await fetch("http://127.0.0.1:5000/empleados", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
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
        const respuesta = await fetch(`http://127.0.0.1:5000/empleados/${id}`, { method: "DELETE",
            credentials: "include",
         });
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

// TURNOS

async function cargarTurnos() {
    const respuesta = await fetch("http://127.0.0.1:5000/turnos");
    const turnos = await respuesta.json();

    const contenedor = document.getElementById("tabla-turnos")
    
    turnos.forEach(turno => {
        contenedor.innerHTML += 
        `<tr>
            <td>${turno.id}</td>
            <td>${turno.empleado_nombre}</td>
            <td>${turno.estado}</td>
            <td>${turno.fecha}</td>
        </tr>`
    });
    
}


document.getElementById("form-turno").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const empleadoID = document.getElementById("input-empleado-id").value;
    const estado = document.getElementById("input-estado-turno").value;
    const fecha = document.getElementById("input-fecha").value;

    
    const respuesta = await fetch("http://127.0.0.1:5000/turnos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ empleado_id: empleadoID, estado: estado, fecha : fecha })
    });

    // limpiar formulario completo, incluyendo el modo
    document.getElementById("input-empleado-id").value = "";
    document.getElementById("input-estado-turno").value = "activo";
    document.getElementById("input-fecha").value = "";
    

    const contenedor = document.getElementById("tabla-turnos");
    contenedor.innerHTML = "";
    cargarTurnos();
    cargarGraficoTurnos();
});

// INCIDENCIAS

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


document.getElementById("form-incidencia").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const turnoID = document.getElementById("input-turno-id").value;
    const descripcion = document.getElementById("input-descripcion").value;
    const severidad = document.getElementById("input-severidad").value;

    
    const respuesta = await fetch("http://127.0.0.1:5000/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ turno_id: turnoID, descripcion: descripcion, severidad : severidad })
    });

    // limpiar formulario completo, incluyendo el modo
    document.getElementById("input-turno-id").value = "";
    document.getElementById("input-descripcion").value = "";
    document.getElementById("input-severidad").value = "baja";
    

    const contenedor = document.getElementById("tabla-incidencias");
    contenedor.innerHTML = "";
    cargarIncidencias();
    cargarContadorAbiertas();
    cargarGraficoSeveridad();

});

async function cerrarIncidencia(id) {

    await fetch(`http://127.0.0.1:5000/incidencias/${id}/cerrar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });
    
    const contenedor = document.getElementById("tabla-incidencias");
    contenedor.innerHTML = "";
    cargarIncidencias();

}

async function cargarContadorAbiertas() {
    const respuesta = await fetch("http://127.0.0.1:5000/metricas/incidencias-abiertas");
    const datos = await respuesta.json();
    

    const contadorAbiertas = document.getElementById("contador-abiertas");
    contadorAbiertas.textContent = datos.total;
}

let graficoSeveridad = null;
let graficoTurnos = null;

async function cargarGraficoSeveridad() {
    const respuesta = await fetch("http://127.0.0.1:5000/metricas/incidencias-por-severidad");
    const datos = await respuesta.json();

    const etiquetas = datos.map(fila => fila.severidad);
    const valores = datos.map(fila => fila.total);

    if (graficoSeveridad) {
        graficoSeveridad.destroy();
    }

    graficoSeveridad = new Chart(document.getElementById("grafico-severidad"), {
        type: "pie",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Incidencias por severidad",
                data: valores
            }]
        }
    });
}

async function cargarGraficoTurnos() {
    const respuesta = await fetch("http://127.0.0.1:5000/metricas/turnos-por-estado");
    const datos = await respuesta.json();

    const etiquetas = datos.map(fila => fila.estado);
    const valores = datos.map(fila => fila.total);

    if (graficoTurnos) {
        graficoTurnos.destroy();
    }

    graficoTurnos = new Chart(document.getElementById("grafico-turnos"), {
        type: "bar",
        data: {
            labels: etiquetas,
            datasets: [{
                label: "Turnos por estado",
                data: valores
            }]
        }
    });
}
