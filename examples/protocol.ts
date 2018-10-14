import { QueryMessage, QUERY_TYPES, ERROR_CODES, ErrorMessage } from '../src/protocol';

const message = new QueryMessage({
  queryType: QUERY_TYPES.PING,
  queryArguments: { foo: 'bar' },
  fromIp: '127.0.0.1',
  fromPort: 6881,
});

console.log(message);
console.log(message.toJSON());
console.log(message.toBuffer());
console.log(message.toString());

const err = new ErrorMessage({
  errorCode: ERROR_CODES.GENERIC_ERROR,
  errorMessage: 'some error',
  fromIp: '127.0.0.1',
  fromPort: 6881,
});

console.log(err);
console.log(err.toJSON());
console.log(err.toBuffer());
console.log(err.toString());
