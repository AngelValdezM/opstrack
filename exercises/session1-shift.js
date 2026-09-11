const turnos = [
  { id: 1, empleado: "Juan", estado: "activo" },
  { id: 2, empleado: "María", estado: "finalizado" },
  { id: 3, empleado: "Pedro", estado: "activo" },
  { id: 4, empleado: "Ana", estado: "pendiente" }
];

function filtrarPorEstado(lista, estado) {
  // tu código aquí — usa .filter()
  const resultado = lista.filter(turno => turno.estado == estado);
  return resultado;
}

console.log(filtrarPorEstado(turnos, "activo"));
// Debe imprimir solo Juan y Pedro


const empleado = { nombre: "Juan", horaEntrada: "08:00", horaSalida: "17:00" };

function calcularHoras(emp) {
  // convierte horaEntrada y horaSalida a números y resta
  // pista: usa .split(":") para separar horas y minutos
  const entrada = emp.horaEntrada.split(":");   // ["08", "00"]
  const salida = emp.horaSalida.split(":");     // ["17", "00"]
  
  const horaEntrada = Number(entrada[0]);       // 8
  const horaSalida = Number(salida[0]);         // 17
  
  return horaSalida - horaEntrada;              // 9
  
}

console.log(calcularHoras(empleado));
// Debe imprimir 9