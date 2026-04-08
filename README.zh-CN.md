# gs-web-hooks

一个轻量级库，为 Web 应用中的 `XMLHttpRequest` 和 `fetch` API 提供响应拦截器。它允许您在应用处理 HTTP 响应之前拦截和修改它们。

[English](README.md)

### 安装

```bash
yarn add gs-web-hooks
```

#### 对于 XMLHttpRequest

```typescript
import { addXhrResponseInterceptor, removeXhrResponseInterceptor } from 'gs-web-hooks';

// 添加拦截器
addXhrResponseInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  beforeResponse: (method, url, body) => {
    // 返回 true 以拦截响应
    return true;
  },
  afterResponse: (beforeReturnValue, responseText) => {
    // 修改响应
    const data = JSON.parse(responseText);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// 移除拦截器
removeXhrResponseInterceptor('test-interceptor');
```

#### 对于 fetch

```typescript
import { addFetchResponseInterceptor, removeFetchResponseInterceptor } from 'gs-web-hooks';

// 添加拦截器
addFetchResponseInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  beforeResponse: (method, url, body) => {
    // 返回 true 以拦截响应
    return true;
  },
  afterResponse: (beforeReturnValue, responseText) => {
    // 修改响应
    const data = JSON.parse(responseText);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// 移除拦截器
removeFetchResponseInterceptor('test-interceptor');
```

### 拦截器选项

- `id` (必填): 拦截器的唯一标识符
- `modifyResponse` (可选): 是否修改响应。默认为 `true`
- `weights` (可选): 拦截器的权重。权重较高的拦截器先执行。默认为 `0`
- `beforeResponse` (必填): 在处理响应之前调用的函数。返回除 `undefined` 以外的值以拦截响应
- `afterResponse` (必填): 在收到响应后调用的函数。返回值以修改响应
- `onInterceptorError` (可选): 当拦截器中发生错误时调用的函数
- `onStatusError` (可选): 当发生状态错误时调用的函数（例如 404, 500）

## API

```typescript
// 为 XMLHttpRequest 添加拦截器
function addXhrResponseInterceptor(interceptor: IResponseInterceptor): IRequiredResponseInterceptor[] {}

// 通过 ID 移除 XMLHttpRequest 的拦截器
function removeXhrResponseInterceptor(id: string): void {}

// 为 fetch API 添加拦截器
function addFetchResponseInterceptor(interceptor: IResponseInterceptor): IRequiredResponseInterceptor[] {}

// 通过 ID 移除 fetch API 的拦截器
function removeFetchResponseInterceptor(id: string): void {}
```
