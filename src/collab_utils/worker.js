import { ChangeSet, Text } from "@codemirror/state";
import { rebaseUpdates } from "@codemirror/collab";

// The updates received so far (updates.length gives the current
// version)
let updates = [];
let doc = Text.of(["Start document"]);
let pending = [];

self.onmessage = (event) => {
  function resp(value) {
    event.ports[0].postMessage(JSON.stringify(value));
  }
  let data = JSON.parse(event.data);
  console.log("worker onmessage data", data); // NOT BEING TRIGGERED

  if (data.type == "pullUpdates") {
    if (data.version < updates.length) resp(updates.slice(data.version));
    else pending.push(resp);
  } else if (data.type == "pushUpdates") {
    // Convert the JSON representation to an actual ChangeSet
    // instance
    let received = data.updates.map((json) => ({
      clientID: json.clientID,
      changes: ChangeSet.fromJSON(json.changes),
    }));

    if (data.version != updates.length)
      received = rebaseUpdates(received, updates.slice(data.version));

    for (let update of received) {
      updates.push(update);
      doc = update.changes.apply(doc);
    }
    
    resp(true);
    if (received.length) {
      // Notify pending requests
      let json = received.map((update) => ({
        clientID: update.clientID,
        changes: update.changes.toJSON(),
      }));
      while (pending.length) pending.pop()(json); // what is this doing?
    }
  } else if (data.type == "getDocument") {
    resp({ version: updates.length, doc: doc.toString() });
  }
};
