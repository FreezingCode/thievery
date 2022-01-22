const express = require('express')
const pool = require("./db");

const app = express()
const port = 3000

app.use(express.json());

app.get('/', (req, res) => {
    let sensor_id = req.query.id;
    let sensor_val = req.query.value;
    
    if (sensor_id !== undefined && sensor_val !== undefined) {
        const sensorInfo = pool.query("SELECT * FROM sensors WHERE sensor_id = $1", [sensor_id])
        res.json(sensorInfo);
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
