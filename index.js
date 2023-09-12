const dialogFlow = require("@google-cloud/dialogflow");
const { WebhookClient, Suggestion } = require("dialogflow-fulfillment");
const express = require("express");
const cors = require("cors");
const accountSid = 'AC85933b8d9f666ee20bf4fee3b3737a76';
const authToken = '018031d58b3f33405b4ff30a4fa6b3f7';
const client = require('twilio')(accountSid, authToken);

const app = express();
app.use(express.json());
app.use(cors());

const Port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post("/webhook", async (req, res) => {
  var id = res.req.body.session.substr(43);
  console.log(id);
  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log(`intent => hi`);

    const number = 10;
    agent.add(`hi from server side ${number}`);
  }

  function fallback(agent) {
    // const {number,dates,email} = agent.parameters;
    console.log(`intent => fallback`);
    agent.add("sorry from server side");
  }
  function reservation(agent) {

    const { number, time, phone, date, emails } = agent.parameters;
    agent.add(
      `Your order of reservation for ${number} people at ${time} for ${date} is done successfully, We also sent you confirmation message at your email ${emails} and phone number ${phone}`
    );
    client.messages
      .create({
        body: `Your order of reservation for ${number} people at ${time} for ${date} is done successfully, We also sent you confirmation message at your email ${emails} and phone number ${phone} `,
        to: phone
      })
      .then(message => console.log(message.sid))
      .done();
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", hi);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("reservation", reservation);

  agent.handleRequest(intentMap);
});
app.listen(Port, () => {
  console.log(`server is running on por ${Port}`);
});
