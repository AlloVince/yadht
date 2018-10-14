import DHTNode from '../src/index';
import Node, { NODE_EVENTS } from '../src/node';
import fs from 'fs';

const dht = new DHTNode({
  logger: ({
    debug: () => {
    },
    info: console.info,
    warn: console.warn,
    error: console.error,
  }) as Console,
});
dht.setBootstrapNodes([
  new Node({
    id: Node.generateId().toString('hex'),
    ip: 'router.bittorrent.com',
    port: 6881,
  }),
  new Node({
    id: Node.generateId().toString('hex'),
    ip: 'dht.transmissionbt.com',
    port: 6881,
  }),
]);

dht.onReceivedInfoHash((infoHash: string) => {
  console.info('magnet:?xt=urn:btih:%s', infoHash.toUpperCase());
});

dht.getNode().getEmitter().on(NODE_EVENTS.SENT_MESSAGE, ({ message, targetIp, targetPort }) => {
  fs.writeFileSync(
    `${__dirname}/../logs/magnet.log`,
    `sent,${targetIp},${targetPort},${message.toBuffer().toString('base64')}\n`,
    { flag: 'a' },
  );
});

dht.getNode().getEmitter().on(NODE_EVENTS.RECEIVED_MESSAGE, ({ message, messageFrom }) => {
  fs.writeFileSync(
    `${__dirname}/../logs/magnet.log`,
    `received,${messageFrom.address},${messageFrom.port},${message.toString('base64')}\n`,
    { flag: 'a' },
  );
});

dht.sonar();

setInterval(
  () => {
    const hashTable = dht.getHashTable();
    console.info('Hash table stats: %j', hashTable.getStats());
  },
  5000,
);
