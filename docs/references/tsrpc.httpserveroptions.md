<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [tsrpc](./tsrpc.md) &gt; [HttpServerOptions](./tsrpc.httpserveroptions.md)

## HttpServerOptions interface

<b>Signature:</b>

```typescript
export interface HttpServerOptions<ServiceType extends BaseServiceType> extends BaseServerOptions<ServiceType> 
```
<b>Extends:</b> BaseServerOptions&lt;ServiceType&gt;

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [cors?](./tsrpc.httpserveroptions.cors.md) | string | <i>(Optional)</i> Access-Control-Allow-Origin 默认：当 <code>NODE_ENV</code> 不为 <code>production</code> 时为 <code>*</code> |
|  [jsonEnabled](./tsrpc.httpserveroptions.jsonenabled.md) | boolean | 是否启用 JSON 启用后可兼容 http JSON 方式的调用，具体方法为： 1. Header 加入：<code>Content-type: application/json</code> 2. POST /<!-- -->{<!-- -->jsonUrlPath<!-- -->}<!-- -->/a/b/c/Test 3. body 为 JSON 4. 返回亦为JSON 默认为 <code>false</code> |
|  [jsonPrune](./tsrpc.httpserveroptions.jsonprune.md) | boolean | 是否剔除协议中未定义的多余字段 默认为 <code>true</code> |
|  [jsonUrlRoot](./tsrpc.httpserveroptions.jsonurlroot.md) | string | JSON 服务根目录 如配置为 <code>'/api/'</code>，则请求 URL <code>/api/a/b/c/Test</code> 将被映射到 API <code>a/b/c/Test</code> 默认为 <code>'/'</code> |
|  [keepAliveTimeout?](./tsrpc.httpserveroptions.keepalivetimeout.md) | number | <i>(Optional)</i> HTTP Socket连接 KeepAlive 超时时间（毫秒） 默认同 NodeJS 为 5000 |
|  [port](./tsrpc.httpserveroptions.port.md) | number | 服务端口 |
|  [socketTimeout?](./tsrpc.httpserveroptions.sockettimeout.md) | number | <i>(Optional)</i> Socket 超时时间（毫秒） |
