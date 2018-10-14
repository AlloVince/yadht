import Crawler from '../src/index';
import Node, { NODE_EVENTS } from '../src/node';
import fs from 'fs';

const crawler = new Crawler({
  logger: ({
    debug: () => {
    },
    info: console.info,
    error: console.error,
  }) as Console,
});
crawler.setBootstrapNodes([
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

crawler.onReceivedInfoHash((infoHash: string) => {
  console.info(infoHash);
});

crawler.getNode().getEmitter().on(NODE_EVENTS.SENT_MESSAGE, ({ message, targetIp, targetPort }) => {
  fs.writeFileSync(
    `${__dirname}/../logs/magnet.log`,
    `sent,${targetIp},${targetPort},${message.toBuffer().toString('base64')}\n`,
    { flag: 'a' },
  );
});

crawler.getNode().getEmitter().on(NODE_EVENTS.RECEIVED_MESSAGE, ({ message, messageFrom }) => {
  fs.writeFileSync(
    `${__dirname}/../logs/magnet.log`,
    `received,${messageFrom.address},${messageFrom.port},${message.toString('base64')}\n`,
    { flag: 'a' },
  );
});

crawler.start('90289fd34dfc1cf8f316a268add8354c85334458');
