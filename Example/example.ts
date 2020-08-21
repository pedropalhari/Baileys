import {
  WAConnection,
  MessageType,
  Presence,
  MessageOptions,
  Mimetype,
  WALocationMessage,
  MessageLogLevel,
  WAMessageType,
  ReconnectMode,
} from "../src/WAConnection/WAConnection";
import * as fs from "fs";
import { doStateMachine } from "./StateMachine";

async function example() {
  const conn = new WAConnection(); // instantiate
  conn.autoReconnect = ReconnectMode.onConnectionLost; // only automatically reconnect when the connection breaks
  conn.logLevel = MessageLogLevel.info; // set to unhandled to see what kind of stuff you can implement

  // loads the auth file credentials if present
  if (fs.existsSync("./auth_info.json")) conn.loadAuthInfo("./auth_info.json");
  // connect or timeout in 20 seconds
  await conn.connect(90 * 1000);

  const unread = await conn.loadAllUnreadMessages();

  console.log("oh hello " + conn.user.name + " (" + conn.user.id + ")");
  console.log(
    "you have " +
      conn.chats.all().length +
      " chats & " +
      Object.keys(conn.contacts).length +
      " contacts"
  );
  console.log("you have " + unread.length + " unread messages");

  const authInfo = conn.base64EncodedAuthInfo(); // get all the auth info we need to restore this session
  fs.writeFileSync("./auth_info.json", JSON.stringify(authInfo, null, "\t")); // save this info to a file
  /*  Note: one can take this auth_info.json file and login again from any computer without having to scan the QR code, 
        and get full access to one's WhatsApp. Despite the convenience, be careful with this file */
  conn.on("user-presence-update", (json) =>
    console.log(json.id + " presence is " + json.type)
  );
  conn.on("message-update", (json) => {
    const participant = json.participant ? " (" + json.participant + ")" : ""; // participant exists when the message is from a group
    console.log(
      `${json.to}${participant} acknlowledged message(s) ${json.ids} as ${json.type}`
    );
  });
  // set to false to NOT relay your own sent messages
  conn.on("message-new", async (m) => {
    const messageStubType = WAMessageType[m.messageStubType] || "MESSAGE";
    console.log("got notification of type: " + messageStubType);

    const messageContent = m.message;
    // if it is not a regular text or media message
    if (!messageContent) return;

    if (m.key.fromMe) {
      console.log("relayed my own message");
      return;
    }

    let sender = m.key.remoteJid;

    if (m.key.participant) {
      // participant exists if the message is in a group
      sender += " (" + m.key.participant + ")";
      return;
    }
    const messageType = Object.keys(messageContent)[0]; // message will always contain one key signifying what kind of message
    if (messageType === MessageType.text) {
      const text = m.message.conversation;
      console.log(sender + " sent: " + text);
      let responseState = doStateMachine(sender, text);

      await conn.sendReadReceipt(m.key.remoteJid, m.key.id); // send read receipt
      await conn.updatePresence(m.key.remoteJid, Presence.available); // tell them we're available
      await conn.updatePresence(m.key.remoteJid, Presence.composing); // tell them we're composing

      //5511973205559@s.whatsapp.net
      if (responseState.includes("Pedido realizado com sucesso!")) {
        let responseFinalizedState = responseState
          .split("*Pedido realizado com sucesso!*\n\n")[1]
          .split("*Escolha uma das opções abaixo:*\n\n")[0];
        await conn.updatePresence(
          "5511973205559@s.whatsapp.net",
          Presence.available
        ); // tell them we're available
        await conn.updatePresence(
          "5511973205559@s.whatsapp.net",
          Presence.composing
        ); // tell them we're composing
        const options: MessageOptions = {
          //    quoted: m
        };
        let content;
        let type: MessageType;

        content = responseFinalizedState; // send a "hello!" & quote the message recieved
        type = MessageType.text;
        const response = await conn.sendMessage(
          "5511973205559@s.whatsapp.net",
          content,
          type,
          options
        );

        console.log(
          "sent message with ID '" +
            response.key.id +
            "' successfully: " +
            (response.status === 200)
        );
      }

      const options: MessageOptions = {
        //    quoted: m
      };
      let content;
      let type: MessageType;

      content = responseState; // send a "hello!" & quote the message recieved
      type = MessageType.text;
      const response = await conn.sendMessage(
        m.key.remoteJid,
        content,
        type,
        options
      );
      console.log(
        "sent message with ID '" +
          response.key.id +
          "' successfully: " +
          (response.status === 200)
      );
    }
  });

  /* example of custom functionality for tracking battery */
  conn.registerCallback(["action", null, "battery"], (json) => {
    const batteryLevelStr = json[2][0][1].value;
    const batterylevel = parseInt(batteryLevelStr);
    console.log("battery level: " + batterylevel);
  });
  conn.on("closed", ({ reason, isReconnecting }) =>
    console.log(
      "oh no got disconnected: " + reason + ", reconnecting: " + isReconnecting
    )
  );
}

example().catch((err) => console.log(`encountered error: ${err}`));
