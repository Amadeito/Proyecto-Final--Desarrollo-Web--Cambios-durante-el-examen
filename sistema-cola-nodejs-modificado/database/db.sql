-- Script de creación y datos de ejemplo
CREATE TABLE Roles (
  RoleId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
  UserId INT IDENTITY(1,1) PRIMARY KEY,
  Username NVARCHAR(100) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(256) NOT NULL,
  FullName NVARCHAR(150),
  RoleId INT NOT NULL,
  CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

CREATE TABLE Clinics (
  ClinicId INT IDENTITY(1,1) PRIMARY KEY,
  Code NVARCHAR(20) NOT NULL UNIQUE,
  Name NVARCHAR(150) NOT NULL,
  Description NVARCHAR(250) NULL
);

CREATE TABLE Patients (
  PatientId INT IDENTITY(1,1) PRIMARY KEY,
  FirstName NVARCHAR(100),
  LastName NVARCHAR(100),
  BirthDate DATE NULL,
  Phone NVARCHAR(30) NULL,
  Identification NVARCHAR(50) NULL,
  CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE PretriageRecords (
  PretriageId INT IDENTITY(1,1) PRIMARY KEY,
  PatientId INT NOT NULL,
  NurseId INT NULL,
  ClinicId INT NOT NULL,
  Priority TINYINT NOT NULL DEFAULT 3,
  Notes NVARCHAR(400) NULL,
  CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),
  FOREIGN KEY (NurseId) REFERENCES Users(UserId),
  FOREIGN KEY (ClinicId) REFERENCES Clinics(ClinicId)
);

CREATE TABLE Turns (
  TurnId INT IDENTITY(1,1) PRIMARY KEY,
  ClinicId INT NOT NULL,
  PatientId INT NOT NULL,
  Number INT NOT NULL,
  Status NVARCHAR(30) NOT NULL DEFAULT 'waiting',
  Priority TINYINT NOT NULL DEFAULT 3,
  CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  CalledAt DATETIME2 NULL,
  FinishedAt DATETIME2 NULL,
  DoctorId INT NULL,
  FOREIGN KEY (ClinicId) REFERENCES Clinics(ClinicId),
  FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),
  FOREIGN KEY (DoctorId) REFERENCES Users(UserId)
);

CREATE TABLE AuditLog (
  LogId INT IDENTITY(1,1) PRIMARY KEY,
  UserId INT NULL,
  Action NVARCHAR(100),
  Details NVARCHAR(MAX),
  CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
  FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- seed roles
INSERT INTO Roles (Name) VALUES ('admin'), ('recepcion'), ('enfermero'), ('medico');

-- seed clinics
INSERT INTO Clinics (Code, Name, Description) VALUES
('C001', 'Urgencias', 'Atención de emergencias'),
('C002', 'Consulta General', 'Consultas generales'),
('C003', 'Pediatría', 'Consultas pediátricas');

-- seed users (passwords: Demo1234!)
-- Genera hashes con bcrypt (ejecutar desde Node) o pega hashes
-- A continuación hay ejemplos de hashes para 'Demo1234!' con bcrypt salt 10 (pueden variar)
INSERT INTO Users (Username, PasswordHash, FullName, RoleId) VALUES
('admin@demo', '$2b$10$K9u1JqG1.6zGkYwQ5pR0Q.6j8kWqT3a7Zp8eW5y6r0Qb3n9xYz1a', 'Administrador', 1),
('recepcion@demo', '$2b$10$K9u1JqG1.6zGkYwQ5pR0Q.6j8kWqT3a7Zp8eW5y6r0Qb3n9xYz1a', 'Recepción', 2),
('enfermero@demo', '$2b$10$K9u1JqG1.6zGkYwQ5pR0Q.6j8kWqT3a7Zp8eW5y6r0Qb3n9xYz1a', 'Enfermero', 3),
('medico@demo', '$2b$10$K9u1JqG1.6zGkYwQ5pR0Q.6j8kWqT3a7Zp8eW5y6r0Qb3n9xYz1a', 'Médico', 4);

-- seed patients
INSERT INTO Patients (FirstName, LastName, BirthDate, Phone, Identification) VALUES
('Juan', 'Perez', '1985-03-12', '50212345678', '1234567'),
('Maria', 'Lopez', '1990-07-22', '50287654321', '7654321');
