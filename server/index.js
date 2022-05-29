require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/textYvan", (req, res) => {
  sendTextMessage();
  res.send("Text message sent!");
});

app.get("/call", (req, res) => {
  call();
  res.send("Calling!");
});

app.post("/twiResponse", (req, res) => {
  const twiml = new VoiceResponse();
  twiml.say("Hello from your mom. It's bed time");
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const sendTextMessage = () => {
  client.messages
    .create({
      body: "Hello from Twilio!",
      from: `${process.env.TWILIO_NUMBER}`,
      to: `${process.env.YVAN_NUMBER}`,
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err));
};

const call = () => {
  client.calls
    .create({
      url: "https://884b-207-237-240-65.ngrok.io/twiResponse",
      from: `${process.env.TWILIO_NUMBER}`,
      to: `${process.env.YVAN_NUMBER}`,
    })
    .then((call) => console.log(call.sid));
};
