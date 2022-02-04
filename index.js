require("dotenv").config();
const https = require("https");
const express = require("express");
const fs = require("fs");
const pool = require("./db");

// const privateKey = fs.readFileSync("./server.key", "utf8");
// const certificate = fs.readFileSync("./server.cert", "utf8");
// const credentials = { key: privateKey, cert: certificate };
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  let sensor_id = req.query.id;
  let sensor_val = req.query.value;

  if (sensor_id !== undefined && sensor_val !== undefined) {
    try {
      const result = await pool.query(
        'SELECT * FROM public."Sensor" WHERE "Id" = $1',
        [sensor_id]
      );

      if (result.rows.length > 0 && result.rows[0].Threshold <= sensor_val) {
        client.messages
          .create({
            body: `Sensor ${sensor_id} has exceeded it's threshold value.`,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
            to: process.env.TWILIO_VERIFIED_NUMBER,
          })
          .then((message) => console.log(message.sid))
          .done();
      }
    } catch (err) {
      res.json(err.message);
    }
  }
});

app.get("/message", async (req, res) => {});

var httpsServer = https.createServer(app);

httpsServer.listen(process.env.PORT, () => {
  console.log("Example app listening on port 8443");
});
