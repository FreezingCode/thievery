CREATE TABLE sensor(
    SensorId SERIAL PRIMARY KEY,
    [Description] VARCHAR(255),
    Threshold INTEGER NOT NULL
);