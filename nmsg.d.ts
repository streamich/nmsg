declare module 'nmsg/backoff' {
	export class Backoff {
	    retry(): void;
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
declare module 'nmsg/util' {
	export function extend<T>(obj1: T, obj2: T, ...objs: T[]): T;

}
declare module 'nmsg/server/transport' {
	import { Readable, Writable, Duplex, Transform } from 'stream';
	import { EventEmitter } from 'events';
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
	    start(): any;
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
	    abstract start(): any;
	    abstract stop(): any;
	    opts: ITransportOpts;
	    constructor(opts?: ITransportOpts);
	}

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
declare module 'nmsg/server/server' {
	import * as transport from 'nmsg/server/transport';
	import { EventEmitter } from 'events';
	import { Serializer } from 'nmsg/serialize';
	export type TMessage = string | number | any;
	export type TcallbackOnMessage = (msg: TMessage) => void;
	export interface ISocket {
	    onmessage: TcallbackOnMessage;
	    send(msg: TMessage): any;
	}
	export class Socket implements ISocket {
	    protected conn: transport.Connection;
	    protected serializer: Serializer;
	    onmessage: (msg: any) => void;
	    constructor(connection: transport.Connection, serializer: Serializer);
	    send(msg: TMessage): void;
	}
	export interface IServerOpts {
	    transport?: transport.Transport;
	    serializer?: Serializer;
	}
	export interface IServer {
	    start(): this;
	    stop(): any;
	}
	export class Server extends EventEmitter implements IServer {
	    static defaultOpts: IServerOpts;
	    protected transport: transport.Transport;
	    protected opts: IServerOpts;
	    constructor(opts?: IServerOpts);
	    start(): this;
	    stop(): void;
	}

}
declare module 'nmsg/rpc' {
	import { ISocket } from 'nmsg/server/server';
	export type TeventCallback = (...args: any[]) => void;
	export type TeventCallbackList = TeventCallback[];
	export interface IFrameData {
	    i: number;
	    a?: any[];
	    c?: number[];
	    t?: number;
	}
	export interface IFrameDataInitiation extends IFrameData {
	    e: string;
	}
	export interface IFrameDataResponse extends IFrameData {
	    r: number;
	    f: number;
	}
	export abstract class Frame {
	    static id: number;
	    static getNextId(): number;
	    static timeout: number;
	    data: IFrameDataInitiation | IFrameDataResponse;
	    id: number;
	    event: string;
	    args: any[];
	    callbacks: ((...args: any[]) => void)[];
	    rid: number;
	    func: number;
	    timeout: number;
	    hasCallbacks(): boolean;
	    isResponse(): boolean;
	}
	export class FrameOutgoing extends Frame {
	    static createResponse(request: Frame, cb_pos: number, args: any[]): FrameOutgoing;
	    constructor(args?: any[], event?: string);
	    processResponse(response: FrameIncoming): void;
	    serialize(): IFrameDataInitiation | IFrameDataResponse;
	}
	export class FrameIncoming extends Frame {
	    reply(index: any, args: any): void;
	    createTimedFunction(index: any): void;
	    unserialize(data: any, onCallback: any): void;
	}
	export class Manager {
	    latency: number;
	    protected frame: {
	        [id: number]: FrameOutgoing;
	    };
	    send: (data) => void;
	    protected subs: {
	        [event: string]: TeventCallbackList;
	    };
	    protected genCallack(frame: FrameIncoming, pos: number): (...args: any[]) => void;
	    protected getSubList(event: string): TeventCallbackList;
	    protected pub(frame: Frame): void;
	    protected dispatch(frame: FrameOutgoing): void;
	    protected processResponse(frame: FrameIncoming): void;
	    constructor(socket?: ISocket);
	    onmessage(msg: any): void;
	    on(event: string, callback: TeventCallback): this;
	    emit(event: string, ...args: any[]): void;
	}
	export class ManagerBuffered extends Manager {
	    cycle: number;
	    protected buffer: FrameOutgoing[];
	    protected flush(): void;
	}

}
declare module 'nmsg/client/transport' {
	import { IConnection, ITransport } from 'nmsg/server/transport';
	export interface IClientTransport extends IConnection, ITransport {
	}

}
declare module 'nmsg/client/client' {
	import { EventEmitter } from 'events';
	import { IClientTransport } from 'nmsg/client/transport';
	import { ISocket, IServer } from 'nmsg/server/server';
	import { Serializer } from 'nmsg/serialize';
	export interface IClientOpts {
	    transport?: IClientTransport;
	    serializer?: Serializer;
	}
	export class Client extends EventEmitter implements ISocket, IServer {
	    static defaultOpts: IClientOpts;
	    onmessage: TcallbackOnMessage;
	    onstart: TcallbackOnStart;
	    onstop: TcallbackOnStop;
	    protected opts: IClientOpts;
	    constructor(opts?: IClientOpts);
	    send(msg: any): void;
	    start(): this;
	    stop(): void;
	}

}
declare module 'nmsg/client/transport/tcp' {
	import { IClientTransport } from 'nmsg/client/transport';
	import { Transform } from 'stream';
	import * as net from 'net';
	import * as message from 'nmsg/message';
	export interface ITransportOpts {
	    host?: string;
	    port?: number;
	}
	export class Transport extends Transform implements IClientTransport {
	    static defaultOpts: ITransportOpts;
	    protected socket: net.Socket;
	    protected 'in': message.LPDecoderStream;
	    protected out: message.LPEncoderStream;
	    onmessage: TcallbackOnMessage;
	    onstart: TcallbackOnStart;
	    onstop: TcallbackOnStop;
	    opts: ITransportOpts;
	    constructor(opts?: ITransportOpts);
	    send(chunk: Buffer | string): void;
	    start(): void;
	    stop(): void;
	    _transform(data: any, encoding: any, callback: any): void;
	}

}
declare module 'nmsg/server/transport/tcp' {
	import * as net from 'net';
	import * as transport from 'nmsg/server/transport';
	import * as message from 'nmsg/message';
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
	    start(): void;
	    stop(): void;
	}

}
/// <reference path="../typings/node/node.d.ts" />

type TcallbackOnMessage  = (chunk: Buffer|string) => void;
type TcallbackOnStart    = () => void;
type TcallbackOnStop     = () => void;
declare module 'nmsg' {
	import main = require('nmsg');
	export = main;
}
