import {IConnection, ITransport, TcallbackOnMessage} from '../server/transport';

export interface IClientTransport extends IConnection, ITransport {

}

export type TcallbackOnMessage = TcallbackOnMessage;
