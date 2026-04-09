# gs-web-hooks

A lightweight library that provides response interceptors for both `XMLHttpRequest` and `fetch` API in web applications. It allows you to intercept and modify HTTP responses before they are processed by your application.

[简体中文](README.zh-CN.md)

### Installation

```bash
yarn add gs-web-hooks
```

#### For XMLHttpRequest

```typescript
import { addXhrInterceptor, removeXhrInterceptor } from 'gs-web-hooks';

// Add an interceptor
addXhrInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  before: (url, method, body) => {
    // Return true to intercept the response
    return true;
  },
  after: (text, beforeReturnValue, context) => {
    // Modify the response
    const data = JSON.parse(text);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// Remove an interceptor
removeXhrInterceptor('test-interceptor');
```

#### For fetch

```typescript
import { addFetchInterceptor, removeFetchInterceptor } from 'gs-web-hooks';

// Add an interceptor
addFetchInterceptor({
  id: 'test-interceptor',
  modifyResponse: true,
  before: (url, method, body) => {
    // Return true to intercept the response
    return true;
  },
  after: (text, beforeReturnValue, context) => {
    // Modify the response
    const data = JSON.parse(text);
    data.modified = true;
    return JSON.stringify(data);
  }
});

// Remove an interceptor
removeFetchInterceptor('test-interceptor');
```

### Interceptor Options

- `id` (required): A unique identifier for the interceptor
- `modifyResponse` (optional): Whether to modify the response. Defaults to `true`
- `weights` (optional): The weight of the interceptor. Interceptors with higher weights are executed first. Defaults to `0`
- `before` (required): A function that is called before the response is processed. Return a value other than `undefined` to intercept the response. Parameters: `(url, method, body)`
- `after` (required): A function that is called after the response is received. Return a value to modify the response. Parameters: `(text, beforeReturnValue, context)`
- `onInterceptorError` (optional): A function that is called when an error occurs in the interceptor
- `onStatusError` (optional): A function that is called when a status error occurs (e.g., 404, 500)

## API

```typescript
// Adds an interceptor for XMLHttpRequest
function addXhrInterceptor(interceptor: IInterceptor<XMLHttpRequest>): IRequiredInterceptor<XMLHttpRequest>[] {}

// Removes an interceptor for XMLHttpRequest by its ID
function removeXhrInterceptor(id: string): void {}

// Adds an interceptor for fetch API
function addFetchInterceptor(interceptor: IInterceptor<Response>): IRequiredInterceptor<Response>[] {}

// Removes an interceptor for fetch API by its ID
function removeFetchInterceptor(id: string): void {}
```
