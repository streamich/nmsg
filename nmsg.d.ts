declare module 'nmsg/stream' {
	import { Transform } from 'stream';
	export interface MessageEncoder {
	    encode(packet: Buffer): Buffer;
	}
	export interface MessageDecoder {
	    add(data: Buffer): this;
	    shift(): Buffer;
	}
	export class LPEncoder implements MessageEncoder {
	    encode(buf: Buffer): Buffer;
	}
	export class LPDecoder implements MessageDecoder {
	    buf: Buffer;
	    add(buf: Buffer): this;
	    shift(): Buffer;
	}
	export class LPEncoderStream extends Transform {
	    encoder: LPEncoder;
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}
	export class LPDecoderStream extends Transform {
	    decoder: LPDecoder;
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}

}
declare module 'nmsg/transport/tcp' {
	export class Transport {
	}

}
/// <reference path="../typings/node/node.d.ts" />

declare module 'nmsg' {
	import main = require('nmsg');
	export = main;
}
