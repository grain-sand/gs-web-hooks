# gs-web-hooks

A lightweight library that provides response interceptors for both `XMLHttpRequest` and `fetch` API in web applications. It allows you to intercept and modify HTTP responses before they are processed by your application.

[简体中文](README.zh-CN.md)

### Installation

```bash
yarn add gs-web-hooks
```

#### For XMLHttpRequest

```typescript
import { addXhrResponseInterceptor, removeXhrResponseInterceptor } from 'gs-web-hooks';

// Add an interceptor
addXhrResponseInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  beforeResponse: (method, url, body) => {
    // Return true to intercept the response
    return true;
  },
  afterResponse: (beforeReturnValue, responseText) => {
    // Modify the response
    const data = JSON.parse(responseText);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// Remove an interceptor
removeXhrResponseInterceptor('test-interceptor');
```

#### For fetch

```typescript
import { addFetchResponseInterceptor, removeFetchResponseInterceptor } from 'gs-web-hooks';

// Add an interceptor
addFetchResponseInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  beforeResponse: (method, url, body) => {
    // Return true to intercept the response
    return true;
  },
  afterResponse: (beforeReturnValue, responseText) => {
    // Modify the response
    const data = JSON.parse(responseText);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// Remove an interceptor
removeFetchResponseInterceptor('test-interceptor');
```

### Interceptor Options

- `id` (required): A unique identifier for the interceptor
- `modifyResponse` (optional): Whether to modify the response. Defaults to `true`
- `weights` (optional): The weight of the interceptor. Interceptors with higher weights are executed first. Defaults to `0`
- `beforeResponse` (required): A function that is called before the response is processed. Return a value other than `undefined` to intercept the response
- `afterResponse` (required): A function that is called after the response is received. Return a value to modify the response
- `onInterceptorError` (optional): A function that is called when an error occurs in the interceptor
- `onStatusError` (optional): A function that is called when a status error occurs (e.g., 404, 500)

## API

```typescript
// Adds an interceptor for XMLHttpRequest
function addXhrResponseInterceptor(interceptor: IResponseInterceptor): IRequiredResponseInterceptor[] {}

// Removes an interceptor for XMLHttpRequest by its ID
function removeXhrResponseInterceptor(id: string): void {}

// Adds an interceptor for fetch API
function addFetchResponseInterceptor(interceptor: IResponseInterceptor): IRequiredResponseInterceptor[] {}

// Removes an interceptor for fetch API by its ID
function removeFetchResponseInterceptor(id: string): void {}
```
