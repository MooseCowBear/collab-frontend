import {
  collab,
  getSyncedVersion,
  receiveUpdates,
  sendableUpdates,
} from "@codemirror/collab";
import { ChangeSet, Text } from "@codemirror/state";
import { ViewPlugin } from "@codemirror/view";

export async function getDocument(connection) {
  return connection.request({ type: "getDocument" }).then((data) => ({
    version: data.version,
    doc: Text.of(data.doc.split("\n")),
  }));
}

export function peerExtension(startVersion, connection) {
  const plugin = ViewPlugin.fromClass(
    class {
      pushing = false;
      done = false;

      constructor(view) {
        this.view = view;
        this.pull();
      }

      update(update) {
        if (update.docChanged) this.push();
      }

      async push() {
        let updates = sendableUpdates(this.view.state);
        if (this.pushing || !updates.length) return;
        this.pushing = true;
        let version = getSyncedVersion(this.view.state);
        await pushUpdates(connection, version, updates);
        this.pushing = false;
        if (sendableUpdates(this.view.state).length) {
          setTimeout(() => this.push(), 100); // try again if still have updates
        }
      }

      async pull() {
        while (!this.done) {
          let version = getSyncedVersion(this.view.state);
          let updates = await pullUpdates(connection, version);
          this.view.dispatch(receiveUpdates(this.view.state, updates));
        }
      }

      destroy() {
        this.done = true;
      }
    }
  );

  return [collab({startVersion}), plugin];
}

function pushUpdates(connection, version, fullUpdates) {
  const updates = fullUpdates.map((u) => ({
    clientID: u.clientID,
    changes: u.changes.toJSON(),
  }));
  return connection.request({ type: "pushUpdates", version, updates });
}

function pullUpdates(connection, version) {
  return connection.request({ type: "pullUpdates", version }).then((updates) =>
    updates.map((u) => ({
      changes: ChangeSet.fromJSON(u.changes),
      clientID: u.clientID,
    }))
  );
}
