import { BaseServer, BaseServerOptions, defualtBaseServerOptions } from '../BaseServer';
import * as http from "http";
import { HttpConnection } from './HttpConnection';
import { HttpUtil } from '../../models/HttpUtil';
import { ApiCallHttp, MsgCallHttp } from './HttpCall';
import { ParsedServerInput } from '../../models/TransportDataUtil';
import { BaseServiceType } from 'tsrpc-proto';
import { Pool } from '../../models/Pool';
import { Counter } from '../../models/Counter';

export class HttpServer<ServiceType extends BaseServiceType = any> extends BaseServer<HttpServerOptions<ServiceType>, ServiceType>{

    protected _poolApiCall: Pool<ApiCallHttp> = new Pool<ApiCallHttp>(ApiCallHttp);
    protected _poolMsgCall: Pool<MsgCallHttp> = new Pool<MsgCallHttp>(MsgCallHttp);

    private _apiSnCounter = new Counter(1);

    constructor(options?: Partial<HttpServerOptions<ServiceType>>) {
        super(Object.assign({}, defaultHttpServerOptions, options));
    }

    private _status: HttpServerStatus = 'closed';
    public get status(): HttpServerStatus {
        return this._status;
    }

    private _server?: http.Server;
    start(): Promise<void> {
        if (this._server) {
            throw new Error('Server already started');
        }

        return new Promise(rs => {
            this._status = 'opening';
            this.logger.log(`Starting HTTP server ...`);
            this._server = http.createServer((httpReq, httpRes) => {
                let conn: HttpConnection<ServiceType> | undefined;

                httpRes.statusCode = 200;
                if (this.options.cors) {
                    httpRes.setHeader('Access-Control-Allow-Origin', this.options.cors)
                };

                httpReq.on('data', data => {
                    if (!conn) {
                        let ip = HttpUtil.getClientIp(httpReq);
                        conn = HttpConnection.pool.get({
                            server: this,
                            ip: ip,
                            httpReq: httpReq,
                            httpRes: httpRes
                        });
                    }
                    this.onData(conn, data);
                });

                httpReq.on('end', () => {
                    if (!conn) {
                        httpRes.statusCode = 400;
                        httpRes.end();
                        this.logger.log(`[${HttpUtil.getClientIp(httpReq)}] [Bad Request] ${httpReq.method} ${httpReq.url}`)
                    }
                });
            });

            if (this.options.timeout !== undefined) {
                this._server.setTimeout(this.options.timeout);
            }

            this._server.listen(this.options.port, () => {
                this._status = 'open';
                this.logger.log(`Server started at ${this.options.port}`);
                rs();
            })
        });
    }

    stop(): Promise<void> {
        return new Promise(rs => {
            if (!this._server) {
                rs();
                return;
            }
            this._status = 'closing';

            // 立即close，不再接受新请求
            // 等所有连接都断开后rs
            this._server.close(() => {
                this.logger.log('Server stopped');
                rs();
            });

            this._server = undefined;
        })
    }

    protected _parseBuffer(conn: HttpConnection<ServiceType>, buf: Uint8Array): ParsedServerInput {
        let parsed: ParsedServerInput = super._parseBuffer(conn, buf);

        if (parsed.type === 'api') {
            parsed.sn = this._apiSnCounter.getNext();
        }
        else if (parsed.type === 'msg') {
            conn.options.httpRes.end();
        }
        return parsed;
    }

    // Override function type
    implementApi!: <T extends keyof ServiceType['req']>(apiName: T, handler: ApiHandlerHttp<ServiceType['req'][T], ServiceType['res'][T], ServiceType>) => void;
    listenMsg!: <T extends keyof ServiceType['msg']>(msgName: T, handler: MsgHandlerHttp<ServiceType['msg'][T], ServiceType>) => void;
}

export const defaultHttpServerOptions: HttpServerOptions<any> = {
    ...defualtBaseServerOptions,
    port: 3000
}

export interface HttpServerOptions<ServiceType extends BaseServiceType> extends BaseServerOptions<ServiceType> {
    port: number,
    // Socket Timeout
    timeout?: number,
    cors?: string,
    // 是否在message后加入ErrorSN
    showErrorSn?: boolean
}

type HttpServerStatus = 'opening' | 'open' | 'closing' | 'closed';

export type ApiHandlerHttp<Req, Res, ServiceType extends BaseServiceType = any> = (call: ApiCallHttp<Req, Res, ServiceType>) => void | Promise<void>;
export type MsgHandlerHttp<Msg, ServiceType extends BaseServiceType = any> = (msg: MsgCallHttp<Msg, ServiceType>) => void | Promise<void>;