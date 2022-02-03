CREATE DATABASE Thievery;

CREATE TABLE Sensor(
    Id SERIAL PRIMARY KEY,
    Description VARCHAR(255),
    Threshold INTEGER NOT NULL,
    UpdatedDate TIMESTAMP NULL,
    IsSnoozed BIT NULL
);

INSERT INTO Sensor(Description, Threshold) VALUES ('Noise Sensor', 1000), ('Vibration Sensor', 1500);