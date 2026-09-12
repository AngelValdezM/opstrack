-- Crea la tabla empleados
-- Columnas: id (PK, autoincrement), nombre (obligatorio), cargo
CREATE TABLE empleados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cargo TEXT

);

-- Crea la tabla turnos
-- Columnas: id (PK, autoincrement), empleado_id (FK a empleados), estado, fecha
CREATE TABLE turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empleado_id INTEGER NOT NULL,
    estado TEXT NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

-- Inserta al menos 3 empleados
INSERT INTO empleados (nombre, cargo) VALUES ('Angel','Ingeniero');
INSERT INTO empleados (nombre, cargo) VALUES ('Christian','Ingeniero');
INSERT INTO empleados (nombre, cargo) VALUES ('Jose Luis','Ingeniero');

-- Inserta al menos 4 turnos, repartidos entre esos empleados, con distintos estados
INSERT INTO turnos (empleado_id, estado, fecha) VALUES (1,'activo','2026-09-09');
INSERT INTO turnos (empleado_id, estado, fecha) VALUES (2,'inactivo','2026-05-09');
INSERT INTO turnos (empleado_id, estado, fecha) VALUES (3,'activo','2026-11-09');
INSERT INTO turnos (empleado_id, estado, fecha) VALUES (1,'inactivo','2026-10-04');

-- Escribe un SELECT con JOIN que muestre: nombre del empleado + estado del turno
SELECT turnos.id, empleados.nombre, turnos.estado 
FROM turnos
JOIN empleados ON turnos.empleado_id = empleados.id
WHERE turnos.estado = 'activo';

-- Reto extra: agrega WHERE para mostrar solo los turnos "activo"
