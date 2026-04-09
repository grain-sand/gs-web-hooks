# gs-web-hooks

一个轻量级库，为 Web 应用中的 `XMLHttpRequest` 和 `fetch` API 提供响应拦截器。它允许您在应用处理 HTTP 响应之前拦截和修改它们。

[English](README.md)

### 安装

```bash
yarn add gs-web-hooks
```

#### 对于 XMLHttpRequest

```typescript
import { addXhrInterceptor, removeXhrInterceptor } from 'gs-web-hooks';

// 添加拦截器
addXhrInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  before: (url, method, body) => {
    // 返回 true 以拦截响应
    return true;
  },
  after: (text, beforeReturnValue, context) => {
    // 修改响应
    const data = JSON.parse(text);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// 移除拦截器
removeXhrInterceptor('test-interceptor');
```

#### 对于 fetch

```typescript
import { addFetchInterceptor, removeFetchInterceptor } from 'gs-web-hooks';

// 添加拦截器
addFetchInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  before: (url, method, body) => {
    // 返回 true 以拦截响应
    return true;
  },
  after: (text, beforeReturnValue, context) => {
    // 修改响应
    const data = JSON.parse(text);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// 移除拦截器
removeFetchInterceptor('test-interceptor');
```

### 拦截器选项

- `id` (必填): 拦截器的唯一标识符
- `modifyResponse` (可选): 是否修改响应。默认为 `true`
- `weights` (可选): 拦截器的权重。权重较高的拦截器先执行。默认为 `0`
- `before` (必填): 在处理响应之前调用的函数。返回除 `undefined` 以外的值以拦截响应。参数：`(url, method, body)`
- `after` (必填): 在收到响应后调用的函数。返回值以修改响应。参数：`(text, beforeReturnValue, context)`
- `onInterceptorError` (可选): 当拦截器中发生错误时调用的函数
- `onStatusError` (可选): 当发生状态错误时调用的函数（例如 404, 500）

## API

```typescript
// 为 XMLHttpRequest 添加拦截器
function addXhrInterceptor(interceptor: IInterceptor<XMLHttpRequest>): IRequiredInterceptor<XMLHttpRequest>[] {}

// 通过 ID 移除 XMLHttpRequest 的拦截器
function removeXhrInterceptor(id: string): void {}

// 为 fetch API 添加拦截器
function addFetchInterceptor(interceptor: IInterceptor<Response>): IRequiredInterceptor<Response>[] {}

// 通过 ID 移除 fetch API 的拦截器
function removeFetchInterceptor(id: string): void {}
```
