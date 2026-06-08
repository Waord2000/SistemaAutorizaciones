-- ================================================
-- BASE DE DATOS: Sistema de Autorizaciones de Tareas
-- ================================================

-- Eliminar y recrear la base de datos
DROP DATABASE IF EXISTS SistemaAutorizaciones;
CREATE DATABASE SistemaAutorizaciones
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE SistemaAutorizaciones;

-- ------------------------------------------------
-- TABLA: Areas
-- ------------------------------------------------
CREATE TABLE Areas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    activa      BOOLEAN  DEFAULT TRUE,
    creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------
-- TABLA: Maquinas
-- ------------------------------------------------
CREATE TABLE Maquinas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255) NULL,
    area_id     INT     NOT NULL,
    activa      BOOLEAN DEFAULT TRUE,
    creado_en   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES Areas(id)
);

-- ------------------------------------------------
-- TABLA: Usuarios
-- ------------------------------------------------
CREATE TABLE Usuarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100) NOT NULL,
    apellido       VARCHAR(100) NOT NULL,
    correo         VARCHAR(150) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    rol            ENUM('Administrador','Aprobador','Tecnico') NOT NULL,
    cargo          VARCHAR(100) NULL,
    nivel_tecnico  ENUM('A','B','C') NULL,
    activo         BOOLEAN  DEFAULT TRUE,
    ultimo_acceso  DATETIME NULL,
    creado_en      DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP
                   ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------
-- TABLA: Autorizaciones
-- ------------------------------------------------
CREATE TABLE Autorizaciones (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    codigo              VARCHAR(20)  NOT NULL UNIQUE,
    fecha               DATE         NOT NULL,
    hora_inicio         TIME         NOT NULL,
    hora_fin            TIME         NOT NULL,
    area_id             INT          NOT NULL,
    maquina_id          INT          NULL,
    aprobador_id        INT          NOT NULL,
    tecnico_id          INT          NOT NULL,
    nivel_tecnico       ENUM('A','B','C') NULL,
    requiere_apoyo      BOOLEAN      DEFAULT FALSE,
    epp_otros           VARCHAR(255) NULL,
    evaluador_nombre    VARCHAR(150) NULL,
    evaluador_puesto    VARCHAR(100) NULL,
    observaciones       TEXT         NULL,
    descripcion_tarea   TEXT         NOT NULL,
    motivo_rechazo      TEXT         NULL,
    fecha_autorizacion  DATETIME     NULL,
    aprobador_acepto    BOOLEAN      DEFAULT FALSE,
    aprobador_acepto_en DATETIME     NULL,
    tecnico_acepto      BOOLEAN      DEFAULT FALSE,
    tecnico_acepto_en   DATETIME     NULL,
    pdf_generado        BOOLEAN      DEFAULT FALSE,
    pdf_generado_en     DATETIME     NULL,
    estado              ENUM('Borrador','Pendiente','Aprobada',
                             'Rechazada','Completada','Cancelada')
                        DEFAULT 'Borrador',
    creado_en           DATETIME DEFAULT CURRENT_TIMESTAMP,
    actualizado_en      DATETIME DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id)      REFERENCES Areas(id),
    FOREIGN KEY (maquina_id)   REFERENCES Maquinas(id),
    FOREIGN KEY (aprobador_id) REFERENCES Usuarios(id),
    FOREIGN KEY (tecnico_id)   REFERENCES Usuarios(id)
);

-- ------------------------------------------------
-- TABLA: AutorizacionTiposTarea
-- ------------------------------------------------
CREATE TABLE AutorizacionTiposTarea (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    autorizacion_id  INT NOT NULL,
    tipo             ENUM('Mecanica','Electricidad','Soldadura',
                          'Lubricacion','EquiposCriticos','Otros') NOT NULL,
    FOREIGN KEY (autorizacion_id)
        REFERENCES Autorizaciones(id) ON DELETE CASCADE
);

-- ------------------------------------------------
-- TABLA: AutorizacionEPP
-- ------------------------------------------------
CREATE TABLE AutorizacionEPP (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    autorizacion_id  INT NOT NULL,
    epp_tipo         ENUM(
                       'Casco','Lentes','Guantes','Botas',
                       'ProteccionAuditiva','ProteccionRespiratoria',
                       'MangaSoldar','ArnesLineaVida','CaretaSoldar',
                       'CalzadoIndustrial','GuantesCuero',
                       'GuantesAltaTemp','CinturonLumbar','Otro'
                     ) NOT NULL,
    FOREIGN KEY (autorizacion_id)
        REFERENCES Autorizaciones(id) ON DELETE CASCADE
);

-- ------------------------------------------------
-- TABLA: AutorizacionPersonalApoyo
-- ------------------------------------------------
CREATE TABLE AutorizacionPersonalApoyo (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    autorizacion_id  INT          NOT NULL,
    nombre_completo  VARCHAR(150) NOT NULL,
    usuario_id       INT          NULL,
    FOREIGN KEY (autorizacion_id)
        REFERENCES Autorizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)
        REFERENCES Usuarios(id)
);

-- ------------------------------------------------
-- TABLA: AnalisisRiesgos
-- ------------------------------------------------
CREATE TABLE AnalisisRiesgos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    autorizacion_id     INT  NOT NULL,
    riesgo_identificado TEXT NOT NULL,
    medidas_control     TEXT NOT NULL,
    nivel_riesgo        ENUM('Bajo','Medio','Alto','Critico') NOT NULL,
    orden               INT  DEFAULT 1,
    FOREIGN KEY (autorizacion_id)
        REFERENCES Autorizaciones(id) ON DELETE CASCADE
);

-- ------------------------------------------------
-- TABLA: AutorizacionHistorial
-- ------------------------------------------------
CREATE TABLE AutorizacionHistorial (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    autorizacion_id  INT  NOT NULL,
    usuario_id       INT  NOT NULL,
    estado_anterior  ENUM('Borrador','Pendiente','Aprobada',
                          'Rechazada','Completada','Cancelada') NULL,
    estado_nuevo     ENUM('Borrador','Pendiente','Aprobada',
                          'Rechazada','Completada','Cancelada') NOT NULL,
    comentario       TEXT NULL,
    fecha_accion     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (autorizacion_id)
        REFERENCES Autorizaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)
        REFERENCES Usuarios(id)
);

-- ------------------------------------------------
-- TABLA: Notificaciones
-- ------------------------------------------------
CREATE TABLE Notificaciones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id       INT          NOT NULL,
    autorizacion_id  INT          NULL,
    titulo           VARCHAR(150) NOT NULL,
    mensaje          TEXT         NOT NULL,
    leida            BOOLEAN      DEFAULT FALSE,
    creado_en        DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)
        REFERENCES Usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (autorizacion_id)
        REFERENCES Autorizaciones(id) ON DELETE SET NULL
);

-- ------------------------------------------------
-- TABLA: SesionesUsuario
-- ------------------------------------------------
CREATE TABLE SesionesUsuario (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  INT          NOT NULL,
    token_hash  VARCHAR(255) NOT NULL,
    ip_acceso   VARCHAR(45)  NULL,
    expira_en   DATETIME     NOT NULL,
    activa      BOOLEAN      DEFAULT TRUE,
    creado_en   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);

-- ================================================
-- DATOS INICIALES
-- Contraseña para todos: Admin123
-- ================================================
INSERT INTO Usuarios (nombre, apellido, correo, password_hash, rol, cargo, activo)
VALUES (
    'Walter', 'Ordoñez', 'admin@sistema.com',
    '$2a$11$UH0b8yqHpG3WdEY7yUlZ/OVnEWQyOCOFPQzGyQBvtHLcotGsALAPu',
    'Administrador', 'Administrador del Sistema', 1
);

INSERT INTO Usuarios (nombre, apellido, correo, password_hash, rol, cargo, activo)
VALUES (
    'Carlos', 'Mendoza', 'aprobador@sistema.com',
    '$2a$11$UH0b8yqHpG3WdEY7yUlZ/OVnEWQyOCOFPQzGyQBvtHLcotGsALAPu',
    'Aprobador', 'Jefe de Área', 1
);

INSERT INTO Usuarios (nombre, apellido, correo, password_hash, rol, cargo, nivel_tecnico, activo)
VALUES (
    'Pedro', 'Garcia', 'tecnico@sistema.com',
    '$2a$11$UH0b8yqHpG3WdEY7yUlZ/OVnEWQyOCOFPQzGyQBvtHLcotGsALAPu',
    'Tecnico', 'Técnico de Mantenimiento', 'A', 1
);

INSERT INTO Areas (nombre, descripcion, activa)
VALUES ('Mantenimiento', 'Área de mantenimiento mecánico', 1);

INSERT INTO Maquinas (nombre, descripcion, area_id, activa)
VALUES ('Compresor Principal', 'Compresor de aire industrial', 1, 1);