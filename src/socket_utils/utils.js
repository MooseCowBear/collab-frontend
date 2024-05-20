import { ViewPlugin } from "@codemirror/view";
import { Text, ChangeSet } from "@codemirror/state";
import {
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from "@codemirror/collab";

async function pushUpdates(socket, version, fullUpdates) {
  const updates = fullUpdates.map((u) => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
    effects: u.effects,
  }));

  return new Promise(function (resolve) {
    socket.socket.emit("pushUpdates", version, JSON.stringify(updates));
    socket.socket.once("pushUpdateResponse", function (status) {
      resolve(status);
    });
  });
}

async function pullUpdates(socket, version) {
  return new Promise(function (resolve) {
    socket.socket.emit("pullUpdates", version);
    socket.socket.once("pullUpdateResponse", function (updates) {
      resolve(JSON.parse(updates));
    });
  }).then((updates) =>
    updates.map((u) => ({
      changes: ChangeSet.fromJSON(u.changes),
      clientID: u.clientID,
    }))
  );
}

export async function getDocument(socket) {
  console.log("calling get document");
  return new Promise(function (resolve) {
    socket.socket.emit("getDocument");
    socket.socket.once("getDocumentResponse", function (version, doc) {
      console.log("from server on client side", version, doc); // is getting it
      resolve({ version, doc: Text.of(doc.split("\n")) });
    });
  });
}

export const peerExtension = (socket, startVersion) => {
  const plugin = ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.view = view;
        this.pushing = false;
        this.done = false;
        this.pull();
      }

      update(update) {
        if (update.docChanged || update.transactions.length) {
          this.push();
        }
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        const success = await pushUpdates(socket, version, updates);
        console.log("success", success); // after first change... goes insane
        this.pushing = false;
        if (sendableUpdates(this.view.state).length) {
          console.log("resending");
          setTimeout(() => this.push(), 100);
        }
      }

      async pull() {
        while (!this.done) {
          const version = getSyncedVersion(this.view.state);
          const updates = await pullUpdates(socket, version);
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );

  return [collab({ startVersion }), plugin];
};
