import { format, inspect } from 'util';
import Bignum from 'bignum';
import crypto from 'crypto';
import dgram from 'dgram';
import { EventEmitter2 } from 'eventemitter2';
import {
  PingQuery,
  KRPCMessageInterface,
  MessageBuilder,
  PingResponse,
  FindNodeQuery,
  FindNodeResponse,
  GetPeersQuery,
  GetPeersResponse,
  AnnouncePeerQuery,
  AnnouncePeerResponse,
  NodeInterface,
  AddressInterface,
  PeerInterface,
} from './protocol';
// import fs from 'fs';

// const convert = {
//   bin2dec : s => parseInt(s, 2).toString(10),
//   bin2hex : s => parseInt(s, 2).toString(16),
//   dec2bin : s => parseInt(s, 10).toString(2),
//   dec2hex : s => parseInt(s, 10).toString(16),
//   hex2bin : s => parseInt(s, 16).toString(2),
//   hex2dec : s => parseInt(s, 16).toString(10)
// };
//
// Binary/Decimal/Hexadecimal

export const NODE_EVENTS = {
  SENT_MESSAGE: 'sentMessage',
  RECEIVED_MESSAGE: 'receivedMessage',
  SENT_PING_QUERY: 'sentPingQuery',
  REPLIED_PING_QUERY: 'repliedPingQuery',
  RECEIVED_PING_QUERY: 'receivedPingQuery',
  RECEIVED_PING_RESPONSE: 'receivedPingResponse',
  SENT_FIND_NODE_QUERY: 'sentFindNodeQuery',
  REPLIED_FIND_NODE_QUERY: 'repliedFindNodeQuery',
  RECEIVED_FIND_NODE_QUERY: 'receivedFindNodeQuery',
  RECEIVED_FIND_NODE_RESPONSE: 'receivedFindNodeResponse',
  SENT_GET_PEERS_QUERY: 'sentGetPeersQuery',
  REPLIED_GET_PEERS_QUERY: 'repliedGetPeersQuery',
  RECEIVED_GET_PEERS_QUERY: 'receivedGetPeersQuery',
  RECEIVED_GET_PEERS_RESPONSE: 'receivedGetPeersResponse',
  SENT_ANNOUNCE_PEER_QUERY: 'sentAnnouncePeerQuery',
  REPLIED_ANNOUNCE_PEER_QUERY: 'repliedAnnouncePeerQuery',
  RECEIVED_ANNOUNCE_PEER_QUERY: 'receivedAnnouncePeerQuery',
  RECEIVED_ANNOUNCE_PEER_RESPONSE: 'receivedAnnouncePeerResponse',
};

export default class Node {
  id: string;
  decId: Bignum;
  port: number;
  ip: string;
  udp: dgram.Socket;
  eventEmitter: EventEmitter2;
  logger: Console;

  static generateId() {
    return crypto
      .createHash('sha1')
      .update(`${(new Date).getTime()}:${Math.random() * 99999}`)
      .digest();
  }

  constructor(
    input: {
      id: string,
      ip: string,
      port: number,
      logger?: Console,
    },
    udp?: dgram.Socket,
  ) {
    this.id = input.id;
    this.port = input.port;
    this.ip = input.ip;
    this.logger = input.logger || console;
    this.decId = new Bignum(this.id, 16);
    this.udp = udp;
  }

  getEmitter(): EventEmitter2 {
    if (this.eventEmitter) {
      return this.eventEmitter;
    }
    this.eventEmitter = new EventEmitter2();
    return this.eventEmitter;
  }

  sendMessage(message: KRPCMessageInterface, targetIp: string, targetPort: number) {
    const msg = message.toBuffer();
    this.udp.send(msg, 0, msg.length, targetPort, targetIp);
    this.getEmitter().emit(NODE_EVENTS.SENT_MESSAGE, message);
    // fs.writeFileSync(
    //   `${__dirname}/../logs/magnet.log`,
    //   `sent,${targetIp},${targetPort},${msg.toString('base64')}\n`,
    //   { flag: 'a' },
    // );
    this.logger.debug(
      '[NODE:%s] sent message to [NODE:%s:%s] %j',
      this.toString(), targetIp, targetPort, message.toJSON());
  }

  receiveMessage(rawBuffer: Buffer, messageFrom: AddressInterface): KRPCMessageInterface {
    const emitter = this.getEmitter();
    // fs.writeFileSync(
    //   `${__dirname}/../logs/magnet.log`,
    //   `received,${messageFrom.address},${messageFrom.port},${rawBuffer.toString('base64')}\n`,
    //   { flag: 'a' },
    // );
    const message = MessageBuilder.build(rawBuffer, messageFrom);
    this.logger.debug(
      '[NODE:%s] received message %s',
      this.toString(),
      rawBuffer.toString('base64'),
      inspect(message, { depth: null, colors: true }),
    );
    emitter.emit(NODE_EVENTS.RECEIVED_MESSAGE, message);
    if (message instanceof PingQuery) {
      emitter.emit(NODE_EVENTS.RECEIVED_PING_QUERY, message);
    } else if (message instanceof PingResponse) {
      emitter.emit(NODE_EVENTS.RECEIVED_PING_RESPONSE, message);
    } else if (message instanceof FindNodeQuery) {
      emitter.emit(NODE_EVENTS.RECEIVED_FIND_NODE_QUERY, message);
    } else if (message instanceof FindNodeResponse) {
      emitter.emit(NODE_EVENTS.RECEIVED_FIND_NODE_RESPONSE, message);
    } else if (message instanceof GetPeersQuery) {
      emitter.emit(NODE_EVENTS.RECEIVED_GET_PEERS_QUERY, message);
    } else if (message instanceof GetPeersResponse) {
      emitter.emit(NODE_EVENTS.RECEIVED_GET_PEERS_RESPONSE, message);
    } else if (message instanceof AnnouncePeerQuery) {
      emitter.emit(NODE_EVENTS.RECEIVED_ANNOUNCE_PEER_QUERY, message);
    } else if (message instanceof AnnouncePeerResponse) {
      emitter.emit(NODE_EVENTS.RECEIVED_ANNOUNCE_PEER_RESPONSE, message);
    }
    return message;
  }

  ping(targetNode: Node): PingQuery {
    const query = new PingQuery({
      queryArguments: { id: targetNode.id },
      fromIp: this.ip,
      fromPort: this.port,
    });
    this.sendMessage(query, targetNode.ip, targetNode.port);
    this.getEmitter().emit(NODE_EVENTS.SENT_PING_QUERY, query);
    return query;
  }

  replyPing(query: PingQuery, selfNode: NodeInterface): PingResponse {
    const response = new PingResponse(
      {
        query,
        transactionId: query.getTransactionId(),
        response: {
          id: selfNode.id,
        },
        fromIp: this.ip,
        fromPort: this.port,
      },
    );
    this.sendMessage(response, query.getFromIp(), query.getFromPort());
    this.getEmitter().emit(NODE_EVENTS.REPLIED_PING_QUERY, response);
    return response;
  }

  onPingQuery(callback: (query: PingQuery) => void): void {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_PING_QUERY, callback);
  }

  onPingResponse(callback: (response: PingResponse) => void): void {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_PING_RESPONSE, callback);
  }

  findNode(targetNodeId: string, askNode: NodeInterface): FindNodeQuery {
    const query = new FindNodeQuery({
      queryArguments: {
        id: this.id,
        target: targetNodeId,
      },
      fromIp: this.ip,
      fromPort: this.port,
    });
    this.sendMessage(query, askNode.ip, askNode.port);
    this.getEmitter().emit(NODE_EVENTS.SENT_PING_QUERY, query);
    return query;
  }

  replyFindNode(query: FindNodeQuery, repliedNodes: NodeInterface[]): FindNodeResponse {
    const response = new FindNodeResponse(
      {
        query,
        transactionId: query.getTransactionId(),
        response: {
          id: query.getTargetNodeId(),
          nodes: repliedNodes,
        },
        fromIp: this.ip,
        fromPort: this.port,
      },
    );
    this.sendMessage(response, query.getFromIp(), query.getFromPort());
    this.getEmitter().emit(NODE_EVENTS.REPLIED_FIND_NODE_QUERY, response);
    return response;
  }

  onFindNodeQuery(callback: (query: FindNodeQuery) => void): void {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_FIND_NODE_QUERY, callback);
  }

  onFindNodeResponse(callback: (response: FindNodeResponse) => void): void {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_FIND_NODE_RESPONSE, callback);
  }

  getPeers(infoHash: string, askNode: NodeInterface): GetPeersQuery {
    const query = new GetPeersQuery({
      queryArguments: {
        id: this.id,
        info_hash: infoHash,
      },
      fromIp: this.ip,
      fromPort: this.port,
    });
    this.sendMessage(query, askNode.ip, askNode.port);
    this.getEmitter().emit(NODE_EVENTS.SENT_GET_PEERS_QUERY, query);
    return query;
  }

  replyGetPeers(query: GetPeersQuery, token: string, nodes: NodeInterface[]): GetPeersResponse;
  replyGetPeers(query: GetPeersQuery, token: string, peers: PeerInterface[]): GetPeersResponse;
  replyGetPeers(
    query: GetPeersQuery,
    token: string,
    peersOrNodes: PeerInterface[] | NodeInterface[],
  ): GetPeersResponse {
    const body = {
      token,
      id: this.id,
    } as any;

    if ((<NodeInterface>peersOrNodes[0]).id) {
      Object.assign(body, {
        nodes: peersOrNodes,
      });
    } else {
      Object.assign(body, {
        values: peersOrNodes,
      });
    }
    const response = new GetPeersResponse(
      {
        query,
        transactionId: query.getTransactionId(),
        response: body,
        fromIp: this.ip,
        fromPort: this.port,
      },
    );
    this.sendMessage(response, query.getFromIp(), query.getFromPort());
    this.getEmitter().emit(NODE_EVENTS.REPLIED_GET_PEERS_QUERY, response);
    return response;
  }

  onGetPeersQuery(callback: (query: GetPeersQuery) => void) {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_GET_PEERS_QUERY, callback);
  }

  onGetPeersResponse(callback: (response: GetPeersResponse) => void) {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_GET_PEERS_RESPONSE, callback);
  }

  onAnnouncePeerQuery(callback: (query: AnnouncePeerQuery) => void) {
    this.getEmitter().on(NODE_EVENTS.RECEIVED_ANNOUNCE_PEER_QUERY, callback);
  }

  distanceTo(node: Node, base: number = 10): string {
    return this.decId.xor(node.decId).toString(base);
  }

  toString(): string {
    return format('%s:%s_%s', this.ip, this.port, this.id);
  }

  toJSON(): NodeInterface {
    return {
      id: this.id,
      ip: this.id,
      port: this.port,
    };
  }
}
