import dgram from 'dgram';

const message = Buffer.from('Hello world');
const host = '127.0.0.1';
const port = 6881;

const client = dgram.createSocket('udp4');
client.send(
  message,
  0,
  message.length,
  port,
  host,
  (err, bytes) => {
    if (err) {
      throw err;
    }
    console.log('UDP message sent to %s:%s %s bytes', host, port, bytes);
    client.close();
  },
);
