import bencode from 'bencode';

export const KEY_TRANSACTION_ID = Symbol.for('t');
export const KEY_TYPE = Symbol.for('y');
export const KEY_ERROR = Symbol.for('e');
export const KEY_QUERY = Symbol.for('q');
export const KEY_ARGUMENTS = Symbol.for('a');
export const KEY_RESPONSE = Symbol.for('r');

export interface NodeInterface {
  id: string;
  ip: string;
  port: number;
}

export interface PeerInterface {
  ip: string;
  port: number;
}

export enum MESSAGE_TYPES {
  QUERY = 'q',
  RESPONSE = 'r',
  ERROR = 'e',
}

export enum ERROR_CODES {
  GENERIC_ERROR = 201,
  SERVER_ERROR = 202,
  PROTOCOL_ERROR = 203,
  METHOD_UNKNOWN_ERROR = 204,
}

export enum QUERY_TYPES {
  PING = 'ping',
  FIND_NODE = 'find_node',
  GET_PEERS = 'get_peers',
  ANNOUNCE_PEER = 'announce_peer',
}

const randomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// HEX 1000~FFFF to deceimal is 4096~65535
export const generateTransactionId =
  () => randomNumber(4096, 65535).toString(16);

export interface KRPCMessageInterface {
  [KEY_TRANSACTION_ID]: string;
  [KEY_TYPE]: MESSAGE_TYPES;
  fromIp: string;
  fromPort: number;

  getFromIp(): string;

  getFromPort(): number;

  getTransactionId(): string;

  toJSON(): object;

  toString(): string;

  toBuffer(): Buffer;
}

export interface AddressInterface {
  address: string;
  port: number;
  family?: string;
}

export class QueryMessage implements KRPCMessageInterface {
  [KEY_TRANSACTION_ID]: string;
  [KEY_TYPE] = MESSAGE_TYPES.QUERY;
  [KEY_QUERY]: QUERY_TYPES;
  [KEY_ARGUMENTS]: { id: string };
  fromIp: string;
  fromPort: number;

  constructor(
    {
      queryType,
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
    }: {
      queryType: QUERY_TYPES,
      queryArguments: any,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
    }) {
    this[KEY_TRANSACTION_ID] = transactionId || generateTransactionId();
    this[KEY_QUERY] = queryType;
    this[KEY_ARGUMENTS] = queryArguments;
    this.fromIp = fromIp;
    this.fromPort = fromPort;
  }

  getTransactionId() {
    return this[KEY_TRANSACTION_ID];
  }

  getArguments() {
    return this[KEY_ARGUMENTS];
  }

  getEncodedArguments(): any {
    return this[KEY_ARGUMENTS];
  }

  getFromIp() {
    return this.fromIp;
  }

  getFromPort() {
    return this.fromPort;
  }

  getId() {
    return this[KEY_ARGUMENTS].id;
  }

  toJSON() {
    return {
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: this[KEY_TRANSACTION_ID],
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_QUERY)]: this[KEY_QUERY],
      [Symbol.keyFor(KEY_ARGUMENTS)]: this[KEY_ARGUMENTS],
    };
  }

  toBuffer() {
    return bencode.encode({
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: Buffer.from(this[KEY_TRANSACTION_ID], 'hex'),
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_QUERY)]: this[KEY_QUERY],
      [Symbol.keyFor(KEY_ARGUMENTS)]: this.getEncodedArguments(),
    });
  }

  toString() {
    return this.toBuffer().toString();
  }
}

export class ResponseMessage implements KRPCMessageInterface {
  [KEY_TRANSACTION_ID]: string;
  [KEY_TYPE] = MESSAGE_TYPES.RESPONSE;
  [KEY_RESPONSE]: { id: string };
  query: QueryMessage;
  fromIp: string;
  fromPort: number;

  constructor(
    {
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    }: {
      response: any,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
      query?: QueryMessage,
    }) {
    this[KEY_TRANSACTION_ID] = transactionId || query.getTransactionId();
    this[KEY_RESPONSE] = response;
    this.query = query;
    this.fromIp = fromIp;
    this.fromPort = fromPort;
  }

  getQuery() {
    return this.query;
  }

  setQuery(query: QueryMessage) {
    this.query = query;
    return this;
  }

  getTransactionId() {
    return this[KEY_TRANSACTION_ID];
  }

  getFromIp() {
    return this.fromIp;
  }

  getFromPort() {
    return this.fromPort;
  }

  getId() {
    return this[KEY_RESPONSE].id;
  }

  getEncodedResponse(): any {
    return this[KEY_RESPONSE];
  }

  toJSON() {
    return {
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: this[KEY_TRANSACTION_ID],
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_RESPONSE)]: this[KEY_RESPONSE],
    };
  }

  toBuffer() {
    return bencode.encode({
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: this[KEY_TRANSACTION_ID],
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_RESPONSE)]: this.getEncodedResponse(),
    });
  }

  toString() {
    return this.toBuffer().toString();
  }
}

export class ErrorMessage implements KRPCMessageInterface {
  [KEY_TRANSACTION_ID]: string;
  [KEY_TYPE] = MESSAGE_TYPES.ERROR;
  [KEY_ERROR]: [ERROR_CODES, string];
  fromIp: string;
  fromPort: number;

  constructor(
    {
      errorCode,
      errorMessage,
      fromIp,
      fromPort,
      transactionId,
    }: {
      errorCode: ERROR_CODES,
      errorMessage: string,
      fromIp: string,
      fromPort: number,
      transactionId?: string,
    },
  ) {
    this[KEY_TRANSACTION_ID] = transactionId || generateTransactionId();
    this[KEY_ERROR] = [errorCode, errorMessage];
    this.fromIp = fromIp;
    this.fromPort = fromPort;
  }

  getTransactionId() {
    return this[KEY_TRANSACTION_ID];
  }

  getFromIp() {
    return this.fromIp;
  }

  getFromPort() {
    return this.fromPort;
  }

  toJSON() {
    return {
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: this[KEY_TRANSACTION_ID],
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_ERROR)]: this[KEY_ERROR],
    };
  }

  toBuffer() {
    return bencode.encode({
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: Buffer.from(this[KEY_TRANSACTION_ID], 'hex'),
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_ERROR)]: this[KEY_ERROR],
    });
  }

  toString() {
    return this.toBuffer().toString();
  }
}

export interface PingQueryArgumentsInterface {
  id: string;
}

export class PingQuery extends QueryMessage {
  [KEY_ARGUMENTS]: PingQueryArgumentsInterface;

  constructor(
    {
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
    }: {
      queryArguments: PingQueryArgumentsInterface
      transactionId?: string,
      fromIp: string,
      fromPort: number,
    }) {
    super({
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
      queryType: QUERY_TYPES.PING,
    });
  }

  getEncodedArguments() {
    return {
      id: Buffer.from(this[KEY_ARGUMENTS].id, 'hex'),
    };
  }
}

export interface PingResponseInterface {
  id: string;
}

export class PingResponse extends ResponseMessage {
  [KEY_RESPONSE]: PingResponseInterface;
  query: PingQuery;

  constructor(
    {
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    }: {
      response: PingResponseInterface,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
      query?: PingQuery,
    }) {
    super({
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    });
  }

  getEncodedResponse(): any {
    return { id: Buffer.from(this[KEY_RESPONSE].id, 'hex') };
  }
}

export interface FindNodeQueryArgumentsInterface {
  id: string;
  target: string;
}

export class FindNodeQuery extends QueryMessage {
  [KEY_ARGUMENTS]: FindNodeQueryArgumentsInterface;

  constructor(
    {
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
    }: {
      queryArguments: FindNodeQueryArgumentsInterface
      transactionId?: string,
      fromIp: string,
      fromPort: number,
    }) {
    super({
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
      queryType: QUERY_TYPES.FIND_NODE,
    });
  }

  getTargetNodeId() {
    return this[KEY_ARGUMENTS].target;
  }

  getEncodedArguments() {
    return {
      id: Buffer.from(this[KEY_ARGUMENTS].id, 'hex'),
      target: Buffer.from(this[KEY_ARGUMENTS].target, 'hex'),
    };
  }
}

export interface FindNodeResponseInterface {
  id: string;
  nodes: NodeInterface[];
}

export class FindNodeResponse extends ResponseMessage {
  [KEY_RESPONSE]: FindNodeResponseInterface;
  query: FindNodeQuery;

  constructor(
    {
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    }: {
      response: FindNodeResponseInterface,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
      query?: FindNodeQuery,
    }) {
    super({
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    });
  }

  getNodes(): NodeInterface[] {
    const { nodes } = this[KEY_RESPONSE];
    const uniqueNodes = new Set(nodes.map(n => `${n.id}_${n.ip}_${n.port}`));
    return Array.from(uniqueNodes).map((n) => {
      const [id, ip, port] = n.split('_');
      return {
        id,
        ip,
        port: Number.parseInt(port, 10),
      };
    });
  }

  toJSON() {
    return {
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: this[KEY_TRANSACTION_ID],
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_RESPONSE)]: this[KEY_RESPONSE],
    };
  }

  toBuffer() {
    return bencode.encode({
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: Buffer.from(this[KEY_TRANSACTION_ID], 'hex'),
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_RESPONSE)]: {
        id: Buffer.from(this[KEY_RESPONSE].id, 'hex'),
        nodes: CompactNode.encode(this[KEY_RESPONSE].nodes),
      },
    });
  }
}

export interface GetPeersQueryArgumentsInterface {
  id: string;
  info_hash: string;
}

export class GetPeersQuery extends QueryMessage {
  [KEY_ARGUMENTS]: GetPeersQueryArgumentsInterface;

  constructor(
    {
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
    }: {
      queryArguments: GetPeersQueryArgumentsInterface,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
    }) {
    super({
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
      queryType: QUERY_TYPES.GET_PEERS,
    });
  }

  getInfoHash(): string {
    return this[KEY_ARGUMENTS].info_hash;
  }

  getEncodedArguments() {
    return {
      id: Buffer.from(this[KEY_ARGUMENTS].id, 'hex'),
      info_hash: Buffer.from(this[KEY_ARGUMENTS].info_hash, 'hex'),
    };
  }
}

export interface GetPeersResponseNodesInterface {
  id: string;
  token: string;
  nodes: NodeInterface[];
}

export interface GetPeersResponsePeersInterface {
  id: string;
  token: string;
  values: PeerInterface[];
}

export class GetPeersResponse extends ResponseMessage {
  [KEY_RESPONSE]: GetPeersResponseNodesInterface | GetPeersResponsePeersInterface;
  query: GetPeersQuery;

  constructor(
    {
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    }: {
      response: GetPeersResponseNodesInterface | GetPeersResponsePeersInterface,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
      query?: GetPeersQuery,
    }) {
    super({
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    });
  }

  foundPeers(): boolean {
    return !!(<GetPeersResponsePeersInterface>this[KEY_RESPONSE]).values;
  }

  getNodes(): NodeInterface[] {
    const { nodes } = <GetPeersResponseNodesInterface>this[KEY_RESPONSE];
    const uniqueNodes = new Set(nodes.map(n => `${n.id}_${n.ip}_${n.port}`));
    return Array.from(uniqueNodes).map((n) => {
      const [id, ip, port] = n.split('_');
      return {
        id,
        ip,
        port: Number.parseInt(port, 10),
      };
    });
  }

  getPeers(): PeerInterface[] {
    const { values: peers } = <GetPeersResponsePeersInterface>this[KEY_RESPONSE];
    return peers;
  }

  toBuffer() {
    const response = {
      id: Buffer.from(this[KEY_RESPONSE].id, 'hex'),
      token: Buffer.from(this[KEY_RESPONSE].token, 'hex'),
    };
    if ((<GetPeersResponseNodesInterface>this[KEY_RESPONSE]).nodes) {
      Object.assign(response, {
        nodes: CompactNode.encode((<GetPeersResponseNodesInterface>this[KEY_RESPONSE]).nodes),
      });
    } else {
      Object.assign(response, {
        values: CompactPeer.encode((<GetPeersResponsePeersInterface>this[KEY_RESPONSE]).values),
      });
    }
    return bencode.encode({
      [Symbol.keyFor(KEY_TRANSACTION_ID)]: this[KEY_TRANSACTION_ID],
      [Symbol.keyFor(KEY_TYPE)]: this[KEY_TYPE],
      [Symbol.keyFor(KEY_RESPONSE)]: response,
    });
  }
}

export interface AnnouncePeerQueryArgumentsInterface {
  id: string;
  implied_port: number;
  info_hash: string;
  port: number;
  token: string;
}

export class AnnouncePeerQuery extends QueryMessage {
  [KEY_ARGUMENTS]: AnnouncePeerQueryArgumentsInterface;

  constructor(
    {
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
    }: {
      queryArguments: AnnouncePeerQueryArgumentsInterface,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
    }) {
    super({
      queryArguments,
      transactionId,
      fromIp,
      fromPort,
      queryType: QUERY_TYPES.ANNOUNCE_PEER,
    });
  }

  getPeerPort(): number {
    return this[KEY_ARGUMENTS].port;
  }

  getInfoHash(): string {
    return this[KEY_ARGUMENTS].info_hash;
  }

  getEncodedArguments() {
    return {
      id: Buffer.from(this[KEY_ARGUMENTS].id, 'hex'),
      implied_port: this[KEY_ARGUMENTS].implied_port,
      info_hash: Buffer.from(this[KEY_ARGUMENTS].info_hash, 'hex'),
      port: this[KEY_ARGUMENTS].port,
      token: Buffer.from(this[KEY_ARGUMENTS].token, 'hex'),
    };
  }
}

export interface AnnouncePeerResponseInterface {
  id: string;
}

export class AnnouncePeerResponse extends ResponseMessage {
  [KEY_RESPONSE]: AnnouncePeerResponseInterface;
  query: AnnouncePeerQuery;

  constructor(
    {
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    }: {
      response: AnnouncePeerResponseInterface,
      transactionId?: string,
      fromIp: string,
      fromPort: number,
      query?: AnnouncePeerQuery,
    }) {
    super({
      response,
      query,
      transactionId,
      fromIp,
      fromPort,
    });
  }

  getEncodedResponse(): any {
    return { id: Buffer.from(this[KEY_RESPONSE].id, 'hex') };
  }
}

export class CompactNode {
  static encode(nodes: NodeInterface[]): Buffer {
    return Buffer.concat(nodes.map((node) => {
      const port = Buffer.alloc(2);
      port.writeUInt16BE(node.port, 0);
      return Buffer.concat([
        Buffer.from(node.id),
        Buffer.from(node.ip.split('.').map(i => Number.parseInt(i, 10))),
        port,
      ]);
    }));
  }

  static decode(rawNodes: Buffer): NodeInterface[] {
    const nodes = [];
    for (let i = 0; i + 26 <= rawNodes.length; i += 26) {
      nodes.push({
        id: rawNodes.slice(i, i + 20).toString('hex'),
        ip: `${rawNodes[i + 20]}.${rawNodes[i + 21]}.${rawNodes[i + 22]}.${rawNodes[i + 23]}`,
        port: rawNodes.readUInt16BE(i + 24),
      });
    }
    return nodes;
  }
}

export class CompactPeer {
  static encode(peers: PeerInterface[]): Buffer {
    return Buffer.concat(peers.map((peer) => {
      const port = Buffer.alloc(2);
      port.writeUInt16BE(peer.port, 0);
      return Buffer.concat([
        Buffer.from(peer.ip.split('.').map(i => Number.parseInt(i, 10))),
        port,
      ]);
    }));
  }

  static decode(rawPeers: Buffer[]): PeerInterface[] {
    return rawPeers.map((rawPeer) => {
      return {
        ip: `${rawPeer[0]}.${rawPeer[1]}.${rawPeer[2]}.${rawPeer[3]}`,
        port: rawPeer.readUInt16BE(4),
      };
    });
  }
}

export class MessageBuilder {
  static buildErrorMessage(
    decodedMessage: any,
    messageFrom: AddressInterface,
  ): ErrorMessage {
    const transactionId = decodedMessage[Symbol.keyFor(KEY_TRANSACTION_ID)].toString('hex');
    const [errorCode, errorMessage] = decodedMessage[Symbol.keyFor(KEY_ERROR)];
    return new ErrorMessage({
      transactionId,
      errorCode,
      errorMessage: errorMessage.toString('utf8'),
      fromIp: messageFrom.address,
      fromPort: messageFrom.port,
    });
  }

  static buildResponseMessage(
    decodedMessage: any,
    messageFrom: AddressInterface,
  ): ResponseMessage {
    const transactionId = decodedMessage[Symbol.keyFor(KEY_TRANSACTION_ID)].toString('hex');
    const responseBuffer = decodedMessage[Symbol.keyFor(KEY_RESPONSE)];
    if (responseBuffer.token && (responseBuffer.nodes || responseBuffer.values)) {
      const response = Object
        .entries(responseBuffer)
        .map(([key, value]) => {
          if (['id', 'token'].includes(key)) {
            return [key, (value as Buffer).toString('hex')];
          }
          if (['values'].includes(key) && value) {
            return [key, CompactPeer.decode(value as Buffer[])];
          }
          if (['nodes'].includes(key) && value) {
            return [key, CompactNode.decode(value as Buffer)];
          }
          return [key, value];
        })
        .reduce((obj, [k, v]) => ({ ...obj, [k as string]: v }), {});
      return new GetPeersResponse({
        transactionId,
        response: response as (GetPeersResponsePeersInterface | GetPeersResponseNodesInterface),
        fromIp: messageFrom.address,
        fromPort: messageFrom.port,
      });
    }
    if (responseBuffer.nodes) {
      const response = Object
        .entries(responseBuffer)
        .map(([key, value]) => {
          if (['id', 'ip'].includes(key)) {
            return [key, (value as Buffer).toString('hex')];
          }
          if (['nodes'].includes(key) && value) {
            return [key, CompactNode.decode(value as Buffer)];
          }
          return [key, value];
        })
        .reduce((obj, [k, v]) => ({ ...obj, [k as string]: v }), {});
      return new FindNodeResponse({
        transactionId,
        response: response as FindNodeResponseInterface,
        fromIp: messageFrom.address,
        fromPort: messageFrom.port,
      });
    }

    const response = Object
      .entries(responseBuffer)
      .map(([key, value]) => {
        if (['id', 'token'].includes(key)) {
          return [key, (value as Buffer).toString('hex')];
        }
        if (['name'].includes(key)) {
          return [key, CompactPeer.decode(value as Buffer[])];
        }
        return [key, value];
      })
      .reduce((obj, [k, v]) => ({ ...obj, [k as string]: v }), {});
    return new AnnouncePeerResponse({
      transactionId,
      response: response as AnnouncePeerResponseInterface,
      fromIp: messageFrom.address,
      fromPort: messageFrom.port,
    });
  }

  static buildQueryMessage(
    decodedMessage: any,
    messageFrom: AddressInterface,
  ): QueryMessage {
    const transactionId = decodedMessage[Symbol.keyFor(KEY_TRANSACTION_ID)].toString('hex');
    const queryType: QUERY_TYPES = decodedMessage[Symbol.keyFor(KEY_QUERY)];
    const queryBufferArguments = decodedMessage[Symbol.keyFor(KEY_ARGUMENTS)];
    const queryArguments = Object
      .entries(queryBufferArguments)
      .map(([key, value]) => {
        if (['id', 'info_hash', 'target'].includes(key)) {
          return [key, (value as Buffer).toString('hex')];
        }
        return [key, value];
      })
      .reduce((obj, [k, v]) => ({ ...obj, [k as string]: v }), {});

    return ({
      [QUERY_TYPES.PING]: () => new PingQuery({
        transactionId,
        queryArguments: queryArguments as PingQueryArgumentsInterface,
        fromIp: messageFrom.address,
        fromPort: messageFrom.port,
      }),
      [QUERY_TYPES.FIND_NODE]: () => new FindNodeQuery({
        transactionId,
        queryArguments: queryArguments as FindNodeQueryArgumentsInterface,
        fromIp: messageFrom.address,
        fromPort: messageFrom.port,
      }),
      [QUERY_TYPES.GET_PEERS]: () => new GetPeersQuery({
        transactionId,
        queryArguments: queryArguments as GetPeersQueryArgumentsInterface,
        fromIp: messageFrom.address,
        fromPort: messageFrom.port,
      }),
      [QUERY_TYPES.ANNOUNCE_PEER]: () => new AnnouncePeerQuery({
        transactionId,
        queryArguments: queryArguments as AnnouncePeerQueryArgumentsInterface,
        fromIp: messageFrom.address,
        fromPort: messageFrom.port,
      }),
    })[queryType]();
  }

  static build(
    rawBuffer: Buffer,
    messageFrom: AddressInterface,
  ): QueryMessage | ResponseMessage | ErrorMessage {
    const decodedMessage = bencode.decode(rawBuffer);
    if (!decodedMessage[Symbol.keyFor(KEY_TYPE)]
      || !decodedMessage[Symbol.keyFor(KEY_TRANSACTION_ID)]) {
      throw new Error(`Message invalid, raw buffer: ${rawBuffer.toString('base64')}`);
    }
    const keyType = decodedMessage[Symbol.keyFor(KEY_TYPE)].toString('utf8');

    if (keyType === MESSAGE_TYPES.QUERY) {
      return MessageBuilder.buildQueryMessage(decodedMessage, messageFrom);
    }

    if (keyType === MESSAGE_TYPES.RESPONSE) {
      return MessageBuilder.buildResponseMessage(decodedMessage, messageFrom);
    }

    return MessageBuilder.buildErrorMessage(decodedMessage, messageFrom);
  }
}
