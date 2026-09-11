const incidencias = [
  { id: 1, descripcion: "Falla de equipo", severidad: "alta" },
  { id: 2, descripcion: "Retraso menor", severidad: "baja" },
  { id: 3, descripcion: "Corte de energía", severidad: "alta" },
  { id: 4, descripcion: "Documentación pendiente", severidad: "media" }
];

function filtrarPorSeveridad(lista, severidad) {
  // mismo patrón que el ejercicio anterior — inténtalo sin ver tu código de ayer
  const resultado = lista.filter(incidencia => incidencia.severidad == severidad);
  return resultado;
}

console.log(filtrarPorSeveridad(incidencias, "alta"));
// Debe imprimir "Falla de equipo" y "Corte de energía"

function contarPorSeveridad(lista, severidad) {
  // pista: usa el filter de arriba y luego .length
//   const resultado1 = lista.filter(incidencia => incidencia.severidad == severidad);
//   return resultado1.length;

  const resultado = filtrarPorSeveridad(lista,severidad).length;
  return resultado;
}

console.log(contarPorSeveridad(incidencias, "alta"));
// Debe imprimir 2