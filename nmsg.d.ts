declare module 'nmsg/backoff' {
	export type cbSuccess = () => void;
	export type cbError = (err?: any) => void;
	export type cbOperation = (success: cbSuccess, error: cbError) => void;
	export abstract class Backoff {
	    protected retryCount: number;
	    protected operation: cbOperation;
	    protected abstract onError(err: any): any;
	    protected onSuccess(): void;
	    protected retry(): void;
	    attempt(operation: (success: cbSuccess, error: cbError) => void): void;
	}
	export class BackoffRetry extends Backoff {
	    maxRetries: number;
	    constructor(max_retries?: number);
	    protected onError(err: any): void;
	}
	export class BackoffExponential extends Backoff {
	    minTimeout: number;
	    base: number;
	    maxTimeout: number;
	    protected onError(err: any): void;
	}

}
declare module 'nmsg/message' {
	import { Readable, Writable, Duplex, Transform } from 'stream';
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
	    constructor(destination?: Writable | Duplex | Transform);
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}
	export class LPDecoderStream extends Transform {
	    decoder: LPDecoder;
	    constructor(source?: Readable | Duplex | Transform);
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}

}
declare module 'nmsg/rpc' {
	import * as rpc from '../nmsg-rpc';
	export = rpc;

}
declare module 'nmsg/serialize' {
	export type TUnpacked = any | string | number | Array<any>;
	export type TBufferable = any | string | Buffer;
	export type TPacked = string | Buffer;
	export interface ISerializer {
	    pack(data: TUnpacked): TPacked;
	    unpack(data: TPacked): TUnpacked;
	}
	export abstract class Serializer implements ISerializer {
	    static toBuffer(data: TBufferable): TPacked;
	    static toString(data: TPacked): string;
	    abstract pack(data: TUnpacked): TPacked;
	    abstract unpack(data: TPacked): TUnpacked;
	}
	export class Json extends Serializer {
	    pack(data: TUnpacked): TPacked;
	    unpack(data: TPacked): TUnpacked;
	}
	export class Msgpack extends Serializer {
	    pack(data: TUnpacked): TPacked;
	    unpack(data: TPacked): TUnpacked;
	}

}
declare module 'nmsg/util' {
	export function extend<T>(obj1: T, obj2: T, ...objs: T[]): T;

}
declare module 'nmsg/server/transport' {
	import { Readable, Writable, Duplex, Transform } from 'stream';
	import { EventEmitter } from 'events';
	import { Backoff } from 'nmsg/backoff';
	export type TcallbackOnMessage = (chunk: Buffer | string) => void;
	export type TcallbackOnStart = () => void;
	export type TcallbackOnStop = () => void;
	export interface IConnection {
	    onmessage: TcallbackOnMessage;
	    onstart?: TcallbackOnStart;
	    onstop?: TcallbackOnStop;
	    send(chunk: Buffer | string): any;
	}
	export interface ITransport {
	    opts: ITransportOpts;
	    start(backoff: Backoff): any;
	    stop(): any;
	}
	export abstract class Connection extends Duplex implements IConnection {
	    onmessage: TcallbackOnMessage;
	    send(chunk: Buffer | string): void;
	}
	export abstract class ConnectionStream extends Transform implements IConnection {
	    'in': Readable | Duplex | Transform;
	    out: Writable | Duplex | Transform;
	    onmessage: TcallbackOnMessage;
	    send(chunk: Buffer | string): void;
	    _transform(data: any, encoding: any, callback: any): void;
	}
	export interface ITransportOpts {
	}
	export abstract class Transport extends EventEmitter implements ITransport {
	    static defaultOpts: {};
	    abstract start(backoff: Backoff): any;
	    abstract stop(): any;
	    opts: ITransportOpts;
	    constructor(opts?: ITransportOpts);
	}

}
declare module 'nmsg/client/transport' {
	import { IConnection, ITransport } from 'nmsg/server/transport';
	export interface IClientTransport extends IConnection, ITransport {
	}

}
declare module 'nmsg/server/transport/tcp' {
	import * as net from 'net';
	import * as transport from 'nmsg/server/transport';
	import * as message from 'nmsg/message';
	import { Backoff } from 'nmsg/backoff';
	export class Connection extends transport.ConnectionStream {
	    in: message.LPDecoderStream;
	    out: message.LPEncoderStream;
	    constructor(socket: net.Socket);
	}
	export interface ITransportOpts extends transport.ITransportOpts {
	    host?: string;
	    port?: number;
	}
	export class Transport extends transport.Transport {
	    static defaultOpts: ITransportOpts;
	    protected server: net.Server;
	    opts: ITransportOpts;
	    constructor(opts?: ITransportOpts);
	    start(backoff: Backoff): void;
	    stop(): void;
	}

}
declare module 'nmsg' {
	import main = require('nmsg');
	export = main;
}
