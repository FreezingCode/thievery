require("dotenv").config();
const express = require("express");
const pool = require("./db");
const http = require("http");
//const https = require("https");
//const fs = require("fs");

//const privateKey = fs.readFileSync("./server.key", "utf8");
//const certificate = fs.readFileSync("./server.cert", "utf8");
//const credentials = { key: privateKey, cert: certificate };
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  //Get the query parameters holding the sensor ID and value
  let sensor_id = req.query.id;
  let sensor_val = req.query.value;
  if (sensor_id !== undefined && sensor_val !== undefined) {
    try {
      //Lookup the DB record for the sensor ID passed in via query params
      const result = await pool.query("SELECT * FROM sensor WHERE id = $1;", [
        sensor_id,
      ]);

      //If no record is found matching the passed in ID, send text alert. This will mainly be for debugging when first setting up sensors.
      if (result.rows.length <= 0) {
        console.log("No record found.");
        client.messages
          .create({
            body: `No database record found matching sensor id value of ${sensor_id}.`,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
            to: process.env.TWILIO_VERIFIED_NUMBER,
          })
          .then((message) => console.log(message.sid))
          .done();
        res.send("No record found.");
      }

      let record = result.rows[0];
      //Check to see if the record is currently 'snoozed'. Do no send alerts if currently snoozed.
      if (record.issnoozed === true) {
        console.log(
          `Initial isnoozed condition hit. ${record.issnoozed} and ${record.updateddate}`
        );
        let currentTime = new Date().getTime();
        let snoozedTime = record.updateddate.getTime();
        console.log(
          `Current time is ${currentTime} and snoozedTime is ${snoozedTime}`
        );
        let elapsedTime = (currentTime - snoozedTime) / 1000 / 60;
        console.log(
          `Elapsed time is: ${elapsedTime}. Snooze duration is ${process.env.SNOOZE_DURATION}`
        );
        //If snoozed and has not been snoozed for more than 15 minutes do not send an alert
        if (elapsedTime <= process.env.SNOOZE_DURATION) {
          console.log(
            `ElapsedTime is <= Snooze Duration of ${process.env.SNOOZE_DURATION}`
          );
          res.send("Sensors are currently snoozed. No alert sent");
        }
      }

      //If record was found, and it's not currently snoozed, send text alert
      if (record.threshold <= sensor_val) {
        console.log("Passed all condition and sending SMS alert.");
        //TODO: Reset snooze values in DB
        //Send SMS Alert
        client.messages
          .create({
            body: `${record.description} has exceeded it's threshold of ${record.threshold}.`,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SID,
            to: process.env.TWILIO_VERIFIED_NUMBER,
          })
          .then((message) => console.log(message.sid))
          .done();
          res.send("Sensor lookup and SMS send completed.");
      }
      
    } catch (err) {
      console.dir(err.message);
      res.json(err.message);
    }
  }
});

app.post("/snooze", async (req, res) => {
  console.log("Someone replied to a Twilio SMS message.");
  try {
    const result = await pool.query(
      "UPDATE sensor SET issnoozed = true, updateddate = now()"
    );
  } catch (err) {
    console.dir(`Snooze error: ${err.message}`);
  }
  res.send("Sensors snoozed.");
});

//var httpsServer = https.createServer(credentials, app);
var httpsServer = http.createServer(app);

httpsServer.listen(process.env.PORT, () => {
  console.log(`Thievery app listening on port ${process.env.PORT}`);
});
