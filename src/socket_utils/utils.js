import { ViewPlugin } from "@codemirror/view";
import { Text, ChangeSet } from "@codemirror/state";
import {
  receiveUpdates,
  sendableUpdates,
  collab,
  getSyncedVersion,
} from "@codemirror/collab";

import { addCursor } from "./cursor";

async function pushUpdates(socket, docName, version, fullUpdates) {
  const updates = fullUpdates.map((u) => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
    effects: u.effects,
  }));

  console.log("pushUpdates called", updates);
  if (!updates) return;
  return new Promise(function (resolve) {
    socket.emit("pushUpdates", docName, version, JSON.stringify(updates));

    socket.once("pushUpdateResponse", function (status) {
      resolve(status);
    });
  });
}

async function pullUpdates(socket, docName, version) {
  console.log("pullUpdates called");
  return new Promise(function (resolve) {
    socket.emit("pullUpdates", docName, version);
    socket.once("pullUpdateResponse", function (updates) {
      resolve(JSON.parse(updates));
    });
  }).then((updates) =>
    updates.map((u) => {
      if (u.effects[0]) {
        const effects = [];

        // don't worry about cursor yet
        u.effects.forEach((effect) => {
          console.log("update had effects:", u.effects); // currently no ids associated with effect values
          if (effect.value?.id) {
            const cursor = {
              id: effect.value.id,
              from: effect.value.from,
              to: effect.value.to,
            };
            effects.push(addCursor.of(cursor));
            console.log("ids of effects values", effect.value?.id);
          }
        });

        return {
          changes: ChangeSet.fromJSON(u.changes),
          clientID: u.clientID,
          effects,
        };
      }

      return {
        changes: ChangeSet.fromJSON(u.changes),
        clientID: u.clientID,
      };
    })
  );
}

export function getDocument(socket, docName) {
  return new Promise(function (resolve) {
    socket.emit("getDocument", docName);

    socket.once("getDocumentResponse", function (version, doc) {
      resolve({
        version,
        doc: Text.of(doc.split("\n")),
      });
    });
  });
}

export const peerExtension = (socket, docName, startVersion, id) => {
  const plugin = ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.view = view;
        this.pushing = false;
        this.done = false;
        this.pull();
      }

      update(update) {
        console.log("UPDATE WAS", update);
        if (update.docChanged || update.transactions[0]?.effects[0]) {
          this.push();
        }
      }

      async push() {
        const updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        const version = getSyncedVersion(this.view.state);
        await pushUpdates(socket, docName, version, updates);
        this.pushing = false;
        if (sendableUpdates(this.view.state).length) {
          setTimeout(() => this.push(), 100);
        }
      }

      async pull() {
        while (!this.done) {
          const version = getSyncedVersion(this.view.state);
          const updates = await pullUpdates(socket, docName, version);
          const newUpdates = receiveUpdates(this.view.state, updates);
          this.view.dispatch(newUpdates);
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );

  return [
    collab({
      startVersion,
      clientID: id,
      sharedEffects: (tr) => {
        const effects = tr.effects.filter((e) => {
          return e.is(addCursor);
        });

        return effects;
      },
    }),
    plugin,
  ];
};
