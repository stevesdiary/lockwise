// Download the helper library from https://www.twilio.com/docs/node/install
import twilio from "twilio";
import { SMSPayload } from "../types/type";
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendSMS(smsPayload: SMSPayload) {
  const SMSData = {
    body: smsPayload.body || "This is the sample SMS from twillio",
    from: process.env.SENDER_PHONE_NUMBER,
    to: smsPayload.to
  }
  const message = await client.messages.create({
    body: SMSData.body,
    from: SMSData.from,
    to: SMSData.to
  });

  console.log(message.body);
}

export default sendSMS;
