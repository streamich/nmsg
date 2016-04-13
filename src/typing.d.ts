/// <reference path="../typings/node/node.d.ts" />

type TcallbackOnMessage  = (chunk: Buffer|string) => void;
type TcallbackOnStart    = () => void;
type TcallbackOnStop     = () => void;
