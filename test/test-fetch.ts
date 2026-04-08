// noinspection TypeScriptUnresolvedReference

import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {addFetchInterceptor, removeFetchInterceptor} from "../src";

describe('fetch', () => {
	beforeEach(() => {
		// 清理所有拦截器
		removeFetchInterceptor('test-fetch-interceptor-1');
		removeFetchInterceptor('test-fetch-interceptor-2');
		removeFetchInterceptor('test-fetch-interceptor-3');
	});

	afterEach(() => {
		// 清理所有拦截器
		removeFetchInterceptor('test-fetch-interceptor-1');
		removeFetchInterceptor('test-fetch-interceptor-2');
		removeFetchInterceptor('test-fetch-interceptor-3');
	});

	it('should add interceptor and modify response when modifyResponse is true', async () => {
		// 添加一个修改响应的拦截器
		addFetchInterceptor({
			id: 'test-fetch-interceptor-1',
			modifyResponse: true,
			beforeResponse: () => true,
			afterResponse: (_, responseText) => {
				return JSON.stringify({modified: true, data: JSON.parse(responseText)});
			}
		});

		// 发起请求
		const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
		const data = await response.json();

		// 检查响应是否被修改
		expect(data.modified).toBe(true);
		expect(data.data.id).toBe(1);
	});

	it('should add interceptor and not modify response when modifyResponse is false', async () => {
		// 添加一个不修改响应的拦截器
		addFetchInterceptor({
			id: 'test-fetch-interceptor-2',
			modifyResponse: false,
			beforeResponse: () => true,
			afterResponse: (_, responseText) => {
				// 尝试修改响应，但不应该生效
				return JSON.stringify({modified: true, data: JSON.parse(responseText)});
			}
		});

		// 发起请求
		const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
		const data = await response.json();

		// 检查响应是否未被修改
		expect(data.modified).toBeUndefined();
		expect(data.id).toBe(1);
	});

	it('should call onInterceptorError when modifyResponse is false and afterResponse returns data', async () => {
		// 模拟onInterceptorError回调
		const onInterceptorError = vi.fn();

		// 添加一个不修改响应的拦截器，但afterResponse返回数据
		addFetchInterceptor({
			id: 'test-fetch-interceptor-3',
			modifyResponse: false,
			beforeResponse: () => true,
			afterResponse: (_, responseText) => {
				// 尝试修改响应，但不应该生效
				return JSON.stringify({modified: true, data: JSON.parse(responseText)});
			},
			onInterceptorError: onInterceptorError
		});

		// 发起请求
		const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
		await response.json();

		// 检查onInterceptorError是否被调用
		expect(onInterceptorError).toHaveBeenCalled();
	});
});
