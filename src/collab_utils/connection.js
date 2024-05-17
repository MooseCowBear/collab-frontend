export class Connection {
  constructor(worker) {
    this.worker = worker;
  }

  _request(value) {
    return new Promise((resolve) => {
      let channel = new MessageChannel();
      channel.port2.onmessage = (event) => resolve(JSON.parse(event.data));
      this.worker.postMessage(JSON.stringify(value), [channel.port1]);
    });
  }

  async request(value) {
    let result = await this._request(value);
    return result;
  }
}
