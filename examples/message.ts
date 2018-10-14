import { inspect } from 'util';
import { GetPeersResponse, MessageBuilder } from '../src/protocol';

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  // input: fs.createReadStream(`${__dirname}/magnet.log`),
  input: fs.createReadStream(`${__dirname}/../logs/magnet.log`),
});

let i = 0;
const targetLine = 0 || Number.parseInt(process.env.TARGET_LINE, 10);

rl.on('line', (line: string) => {
  i += 1;
  if (targetLine && targetLine !== i) {
    return false;
  }
  const [method, address, port, bufferText] = line.split(',');
  const rawMessage = Buffer.from(
    bufferText, 'base64',
  );
  try {
    const message = MessageBuilder.build(rawMessage, {
      address,
      port: Number.parseInt(port, 10),
    });
    // console.log('%s %s ', i, method, inspect(message, { depth: null, colors: true }));
    console.log('%s %s %s %j', i, method, message.constructor.name, message);
    // if (message instanceof GetPeersResponse && message.foundPeers()) {
    //   const peers = message.getPeers();
    //   for (const peer of peers) {
    //     console.log('\'%s:%s\',', peer.ip, peer.port);
    //   }
    // }
  } catch (e) {
    console.error(i, e);
  }

  return true;
});
