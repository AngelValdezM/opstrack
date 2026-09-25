const API_URL = "https://opstrack-ihgm.onrender.com";

// UTILIDADES

function escapar(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function filaVacia(columnas) {
    return `<tr><td colspan="${columnas}" class="text-center text-muted py-4">Sin registros</td></tr>`;
}

function llenarSelect(select, opciones, placeholder) {
    const valorActual = select.value;
    select.innerHTML = `<option value="" disabled selected>${placeholder}</option>` +
        opciones.map(o => `<option value="${o.valor}">${escapar(o.texto)}</option>`).join("");
    if (opciones.some(o => String(o.valor) === valorActual)) {
        select.value = valorActual;
    }
}

function mostrarToast(mensaje, tipo = "success") {
    const contenedor = document.getElementById("contenedor-toasts");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${tipo} border-0`;
    toast.setAttribute("role", "alert");
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body"></div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>`;
    toast.querySelector(".toast-body").textContent = mensaje;
    contenedor.appendChild(toast);
    toast.addEventListener("hidden.bs.toast", () => toast.remove());
    new bootstrap.Toast(toast, { delay: 3000 }).show();
}

function confirmar(mensaje) {
    return new Promise(resolve => {
        const elemento = document.getElementById("modal-confirmar");
        const boton = document.getElementById("boton-confirmar");
        document.getElementById("modal-confirmar-mensaje").textContent = mensaje;
        const modal = bootstrap.Modal.getOrCreateInstance(elemento);

        let confirmado = false;
        const alConfirmar = () => {
            confirmado = true;
            modal.hide();
        };

        boton.addEventListener("click", alConfirmar, { once: true });
        elemento.addEventListener("hidden.bs.modal", () => {
            boton.removeEventListener("click", alConfirmar);
            resolve(confirmado);
        }, { once: true });

        modal.show();
    });
}

// Envia una peticion con sesion. Devuelve la respuesta, o null si falló (ya avisó al usuario).
async function enviar(ruta, metodo, cuerpo) {
    const opciones = { method: metodo, credentials: "include" };
    if (cuerpo) {
        opciones.headers = { "Content-Type": "application/json" };
        opciones.body = JSON.stringify(cuerpo);
    }

    const respuesta = await fetch(`${API_URL}${ruta}`, opciones);

    if (respuesta.status === 401) {
        mostrarToast("Tu sesión expiró, inicia sesión de nuevo", "warning");
        mostrarLogin();
        return null;
    }

    if (!respuesta.ok) {
        let mensaje = "Ocurrió un error";
        try {
            mensaje = (await respuesta.json()).error || mensaje;
        } catch (e) { /* respuesta sin JSON */ }
        mostrarToast(mensaje, "danger");
        return null;
    }

    return respuesta;
}

// SESION

function mostrarLogin() {
    document.getElementById("seccion-app").style.display = "none";
    document.getElementById("seccion-login").style.display = "block";
}

function mostrarApp() {
    document.getElementById("seccion-login").style.display = "none";
    document.getElementById("seccion-app").style.display = "block";
    bootstrap.Tab.getOrCreateInstance(document.getElementById("tab-dashboard")).show();

    cargarEmpleados();
    cargarTurnos();
    cargarIncidencias();
    cargarContadorAbiertas();
    cargarGraficoSeveridad();
    cargarGraficoTurnos();
}

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

    if (!respuesta.ok) {
        const datosError = await respuesta.json();
        errorLogin.textContent = datosError.error;
        errorLogin.classList.remove("d-none");
        return;
    }

    errorLogin.classList.add("d-none");
    document.getElementById("form-login").reset();
    mostrarApp();
});

// LOGOUT

document.getElementById("boton-logout").addEventListener("click", async () => {
    await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    mostrarLogin();
});

// VERIFICAR SESION

async function verificarSesion() {
    const respuesta = await fetch(`${API_URL}/session-check`, { credentials: "include" });
    const datos = await respuesta.json();

    if (datos.logueado) {
        mostrarApp();
    }
}

verificarSesion();


// EMPLEADOS

let empleados = [];

async function cargarEmpleados() {
    const respuesta = await fetch(`${API_URL}/empleados`);
    empleados = await respuesta.json();

    const contenedor = document.getElementById("tabla-empleados");

    contenedor.innerHTML = empleados.length
        ? empleados.map(empleado => `
            <tr>
                <td>${empleado.id}</td>
                <td>${escapar(empleado.nombre)}</td>
                <td>${escapar(empleado.cargo)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado(${empleado.id})"><i class="bi bi-trash"></i> Eliminar</button>
                    <button class="btn btn-warning btn-sm" onclick="prepararEdicion(${empleado.id})"><i class="bi bi-pencil"></i> Editar</button>
                </td>
            </tr>`).join("")
        : filaVacia(4);

    llenarSelect(
        document.getElementById("input-empleado-id"),
        empleados.map(e => ({ valor: e.id, texto: e.nombre })),
        "Selecciona un empleado"
    );
}

function resetearFormularioEmpleado() {
    document.getElementById("form-empleado").reset();
    document.getElementById("input-id-editar").value = "";
    document.getElementById("texto-boton-empleado").textContent = "Agregar empleado";
    document.getElementById("boton-cancelar-edicion").classList.add("d-none");
}

document.getElementById("form-empleado").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("input-nombre").value;
    const cargo = document.getElementById("input-cargo").value;
    const idEditar = document.getElementById("input-id-editar").value;

    const respuesta = idEditar
        ? await enviar(`/empleados/${idEditar}`, "PUT", { nombre: nombre, cargo: cargo })
        : await enviar("/empleados", "POST", { nombre: nombre, cargo: cargo });

    if (!respuesta) return;

    mostrarToast(idEditar ? "Empleado actualizado" : "Empleado agregado");
    resetearFormularioEmpleado();
    cargarEmpleados();
    cargarTurnos();   // el nombre del empleado aparece en los turnos
});

document.getElementById("boton-cancelar-edicion").addEventListener("click", resetearFormularioEmpleado);

async function eliminarEmpleado(id) {
    if (!await confirmar("¿Seguro que quieres eliminar este empleado?")) return;

    const respuesta = await enviar(`/empleados/${id}`, "DELETE");
    if (!respuesta) return;

    mostrarToast("Empleado eliminado");
    cargarEmpleados();
    cargarTurnos();
}

function prepararEdicion(id) {
    const empleado = empleados.find(e => e.id === id);
    if (!empleado) return;

    document.getElementById("input-id-editar").value = id;
    document.getElementById("input-nombre").value = empleado.nombre;
    document.getElementById("input-cargo").value = empleado.cargo;
    document.getElementById("texto-boton-empleado").textContent = "Actualizar empleado";
    document.getElementById("boton-cancelar-edicion").classList.remove("d-none");
    document.getElementById("input-nombre").focus();
}

// TURNOS

const BADGE_ESTADO_TURNO = {
    activo: "bg-success",
    finalizado: "bg-secondary"
};

async function cargarTurnos() {
    const respuesta = await fetch(`${API_URL}/turnos`);
    const turnos = await respuesta.json();

    const contenedor = document.getElementById("tabla-turnos");

    contenedor.innerHTML = turnos.length
        ? turnos.map(turno => `
            <tr>
                <td>${turno.id}</td>
                <td>${escapar(turno.empleado_nombre)}</td>
                <td><span class="badge ${BADGE_ESTADO_TURNO[turno.estado] || "bg-primary"}">${escapar(turno.estado)}</span></td>
                <td>${escapar(turno.fecha)}</td>
            </tr>`).join("")
        : filaVacia(4);

    const opciones = turnos.map(t => ({
        valor: t.id,
        texto: `#${t.id} · ${t.empleado_nombre} · ${t.fecha} (${t.estado})`
    }));
    llenarSelect(document.getElementById("input-turno-id"), opciones, "Selecciona un turno");
    llenarSelect(document.getElementById("input-turno-checklist"), opciones, "Selecciona un turno");
    cargarChecklist();
}


document.getElementById("form-turno").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const empleadoID = document.getElementById("input-empleado-id").value;
    const estado = document.getElementById("input-estado-turno").value;
    const fecha = document.getElementById("input-fecha").value;

    const respuesta = await enviar("/turnos", "POST", { empleado_id: empleadoID, estado: estado, fecha: fecha });
    if (!respuesta) return;

    mostrarToast("Turno registrado");
    document.getElementById("input-empleado-id").value = "";
    document.getElementById("input-estado-turno").value = "activo";
    document.getElementById("input-fecha").value = "";

    cargarTurnos();
    cargarGraficoTurnos();
});

// INCIDENCIAS

const BADGE_SEVERIDAD = {
    baja: "bg-success",
    media: "bg-warning text-dark",
    alta: "bg-danger"
};

async function cargarIncidencias() {
    const respuesta = await fetch(`${API_URL}/incidencias`);
    const incidencias = await respuesta.json();

    const contenedor = document.getElementById("tabla-incidencias");

    contenedor.innerHTML = incidencias.length
        ? incidencias.map(incidencia => {
            const cerrada = incidencia.estado === "cerrada";
            const botonHtml = cerrada
                ? `<button class="btn btn-secondary btn-sm" disabled><i class="bi bi-check2"></i> Cerrada</button>`
                : `<button class="btn btn-danger btn-sm" onclick="cerrarIncidencia(${incidencia.id})"><i class="bi bi-x-circle"></i> Cerrar</button>`;

            return `
            <tr>
                <td>${incidencia.id}</td>
                <td>${escapar(incidencia.descripcion)}</td>
                <td><span class="badge ${BADGE_SEVERIDAD[incidencia.severidad] || "bg-primary"}">${escapar(incidencia.severidad)}</span></td>
                <td><span class="badge ${cerrada ? "bg-secondary" : "bg-primary"}">${escapar(incidencia.estado)}</span></td>
                <td>${botonHtml}</td>
            </tr>`;
        }).join("")
        : filaVacia(5);
}


document.getElementById("form-incidencia").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const turnoID = document.getElementById("input-turno-id").value;
    const descripcion = document.getElementById("input-descripcion").value;
    const severidad = document.getElementById("input-severidad").value;

    const respuesta = await enviar("/incidencias", "POST", { turno_id: turnoID, descripcion: descripcion, severidad: severidad });
    if (!respuesta) return;

    mostrarToast("Incidencia registrada");
    document.getElementById("input-turno-id").value = "";
    document.getElementById("input-descripcion").value = "";
    document.getElementById("input-severidad").value = "baja";

    cargarIncidencias();
    cargarContadorAbiertas();
    cargarGraficoSeveridad();
});

async function cerrarIncidencia(id) {
    const respuesta = await enviar(`/incidencias/${id}/cerrar`, "PUT");
    if (!respuesta) return;

    mostrarToast("Incidencia cerrada");
    cargarIncidencias();
    cargarContadorAbiertas();
    cargarGraficoSeveridad();
}

// GRAFICOS

async function cargarContadorAbiertas() {
    const respuesta = await fetch(`${API_URL}/metricas/incidencias-abiertas`);
    const datos = await respuesta.json();

    document.getElementById("contador-abiertas").textContent = datos.total;
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
        },
        options: { responsive: true, maintainAspectRatio: false }
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
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
    });
}

// CHECKLIST

async function cargarChecklist() {
    const turnoId = document.getElementById("input-turno-checklist").value;
    const lista = document.getElementById("lista-checklist");

    if (!turnoId) {
        lista.innerHTML = `<li class="list-group-item text-muted text-center">Selecciona un turno para ver su checklist</li>`;
        return;
    }

    const respuesta = await fetch(`${API_URL}/turnos/${turnoId}/checklist`);
    const items = await respuesta.json();

    lista.innerHTML = items.length
        ? items.map(item => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <input type="checkbox" class="form-check-input me-2" ${item.completado ? "checked" : ""} onchange="toggleItem(${item.id})">
                    ${escapar(item.descripcion)}
                </span>
                <button class="btn btn-danger btn-sm" onclick="eliminarItemChecklist(${item.id})"><i class="bi bi-trash"></i> Eliminar</button>
            </li>`).join("")
        : `<li class="list-group-item text-muted text-center">Sin tareas</li>`;
}

document.getElementById("input-turno-checklist").addEventListener("change", cargarChecklist);

async function toggleItem(id) {
    await enviar(`/checklist/${id}/toggle`, "PUT");
    cargarChecklist();
}

document.getElementById("form-checklist-item").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const turnoId = document.getElementById("input-turno-checklist").value;
    if (!turnoId) {
        mostrarToast("Selecciona un turno primero", "warning");
        return;
    }
    const descripcion = document.getElementById("input-item-descripcion").value;

    const respuesta = await enviar(`/turnos/${turnoId}/checklist`, "POST", { descripcion: descripcion });
    if (!respuesta) return;

    document.getElementById("input-item-descripcion").value = "";
    cargarChecklist();
});

async function eliminarItemChecklist(id) {
    if (!await confirmar("¿Seguro que quieres eliminar esta tarea?")) return;

    const respuesta = await enviar(`/checklist/${id}`, "DELETE");
    if (!respuesta) return;

    cargarChecklist();
}
