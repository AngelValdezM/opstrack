const API_URL = "https://opstrack-ihgm.onrender.com";

// LOGIN

document.getElementById("form-login").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const username = document.getElementById("input-username").value;
    const password = document.getElementById("input-password").value;

    const respuesta = await fetch(`${API_URL}/login`, {
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

// LOGOUT

document.getElementById("boton-logout").addEventListener("click", async () => {
    await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    document.getElementById("seccion-app").style.display = "none";
    document.getElementById("seccion-login").style.display = "block";
});

// VERIFICAR SESION

async function verificarSesion() {
    const respuesta = await fetch(`${API_URL}/session-check`, { credentials: "include" });
    const datos = await respuesta.json();

    if (datos.logueado) {
        document.getElementById("seccion-login").style.display = "none";
        document.getElementById("seccion-app").style.display = "block";
        cargarEmpleados();
        cargarTurnos();
        cargarIncidencias();
        cargarContadorAbiertas();
        cargarGraficoSeveridad();
        cargarGraficoTurnos();
    }
}

verificarSesion();


// EMPLEADOS

async function cargarEmpleados() {
    const respuesta = await fetch(`${API_URL}/empleados`);
    const empleados = await respuesta.json();

    const contenedor = document.getElementById("tabla-empleados")
    contenedor.innerHTML = "";

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
        await fetch(`${API_URL}/empleados/${idEditar}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nombre: nombre, cargo: cargo })
        });
    } else {
        // modo crear
        await fetch(`${API_URL}/empleados`, {
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
        const respuesta = await fetch(`${API_URL}/empleados/${id}`, { method: "DELETE",
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
    const respuesta = await fetch(`${API_URL}/turnos`);
    const turnos = await respuesta.json();

    const contenedor = document.getElementById("tabla-turnos")
    contenedor.innerHTML = "";

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

    
    const respuesta = await fetch(`${API_URL}/turnos`, {
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
    const respuesta = await fetch(`${API_URL}/incidencias`);
    const incidencias = await respuesta.json();

    const contenedor = document.getElementById("tabla-incidencias")
    contenedor.innerHTML = "";

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

    
    const respuesta = await fetch(`${API_URL}/incidencias`, {
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

    await fetch(`${API_URL}/incidencias/${id}/cerrar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });
    
    const contenedor = document.getElementById("tabla-incidencias");
    contenedor.innerHTML = "";
    cargarIncidencias();

}

// GRAFICOS

async function cargarContadorAbiertas() {
    const respuesta = await fetch(`${API_URL}/metricas/incidencias-abiertas`);
    const datos = await respuesta.json();
    

    const contadorAbiertas = document.getElementById("contador-abiertas");
    contadorAbiertas.textContent = datos.total;
}

let graficoSeveridad = null;
let graficoTurnos = null;

async function cargarGraficoSeveridad() {
    const respuesta = await fetch(`${API_URL}/metricas/incidencias-por-severidad`);
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
    const respuesta = await fetch(`${API_URL}/metricas/turnos-por-estado`);
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

async function cargarChecklist() {
    const turnoId = document.getElementById("input-turno-checklist").value;

    const respuesta = await fetch(`${API_URL}/turnos/${turnoId}/checklist`);
    const items = await respuesta.json();

    const lista = document.getElementById("lista-checklist");
    lista.innerHTML = "";

    items.forEach(item => {
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <input type="checkbox" ${item.completado ? "checked" : ""} onchange="toggleItem(${item.id})">
                    ${item.descripcion}
                </span>
                <button class="btn btn-danger btn-sm" onclick="eliminarItemChecklist(${item.id})">Eliminar</button>
            </li>
        `;
    });
}

async function toggleItem(id) {
    await fetch(`${API_URL}/checklist/${id}/toggle`, {
        method: "PUT",
        credentials: "include"
    });

    cargarChecklist();
}

document.getElementById("form-checklist-item").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const turnoId = document.getElementById("input-turno-checklist").value;
    const descripcion = document.getElementById("input-item-descripcion").value;

    await fetch(`${API_URL}/turnos/${turnoId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ descripcion: descripcion })
    });

    document.getElementById("input-item-descripcion").value = "";
    cargarChecklist();
});

async function eliminarItemChecklist(id) {

    const validacion = confirm("¿Seguro que quieres eliminar esta tarea?");
    if(!validacion) {
        return;
    } else {
        const respuesta = await fetch(`${API_URL}/checklist/${id}`, { method: "DELETE",
            credentials: "include",
         });
        cargarChecklist();
    }
}


