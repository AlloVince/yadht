import Crawler from '../src/index';
import Node from '../src/node';

const crawler = new Crawler({});
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

crawler.start('90289fd34dfc1cf8f316a268add8354c85334458');
// crawler.listen(6881);
