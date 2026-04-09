// noinspection TypeScriptUnresolvedReference

import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {addXhrInterceptor, removeXhrInterceptor} from "../src";

describe('xhr', () => {
	beforeEach(() => {
		// 清理所有拦截器
		removeXhrInterceptor('test-interceptor-1');
		removeXhrInterceptor('test-interceptor-2');
		removeXhrInterceptor('test-interceptor-3');
	});

	afterEach(() => {
		// 清理所有拦截器
		removeXhrInterceptor('test-interceptor-1');
		removeXhrInterceptor('test-interceptor-2');
		removeXhrInterceptor('test-interceptor-3');
	});

	it('should add interceptor and modify response when modifyResponse is true', async () => {
		// 添加一个修改响应的拦截器
		addXhrInterceptor({
			id: 'test-interceptor-1',
			modifyResponse: true,
			before: () => true,
			after: (responseText, _) => {
				return JSON.stringify({modified: true, data: JSON.parse(responseText)});
			}
		});

		// 创建一个模拟的XMLHttpRequest
		const xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1');

		// 等待请求完成
		await new Promise<void>((resolve) => {
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					resolve();
				}
			};

			// 在设置onreadystatechange之后再send
			xhr.send();
		});

		// 检查响应是否被修改
		const response = JSON.parse(xhr.responseText);
		expect(response.modified).toBe(true);
		expect(response.data.id).toBe(1);
	});

	it('should add interceptor and not modify response when modifyResponse is false', async () => {
		// 添加一个不修改响应的拦截器
		addXhrInterceptor({
			id: 'test-interceptor-2',
			modifyResponse: false,
			before: () => true,
			after: (responseText, _) => {
				// 尝试修改响应，但不应该生效
				return JSON.stringify({modified: true, data: JSON.parse(responseText)});
			}
		});

		// 创建一个模拟的XMLHttpRequest
		const xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1');

		// 等待请求完成
		await new Promise<void>((resolve) => {
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					resolve();
				}
			};

			// 在设置onreadystatechange之后再send
			xhr.send();
		});

		// 检查响应是否未被修改
		const response = JSON.parse(xhr.responseText);
		expect(response.modified).toBeUndefined();
		expect(response.id).toBe(1);
	});

	it('should call onInterceptorError when modifyResponse is false and afterResponse returns data', async () => {
		// 模拟onInterceptorError回调
		const onInterceptorError = vi.fn();

		// 添加一个不修改响应的拦截器，但afterResponse返回数据
		addXhrInterceptor({
			id: 'test-interceptor-3',
			modifyResponse: false,
			before: () => true,
			after: (responseText, _) => {
				// 尝试修改响应，但不应该生效
				return JSON.stringify({modified: true, data: JSON.parse(responseText)});
			},
			onInterceptorError: onInterceptorError
		});

		// 创建一个模拟的XMLHttpRequest
		const xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://jsonplaceholder.typicode.com/todos/1');

		// 等待请求完成
		await new Promise<void>((resolve) => {
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					resolve();
				}
			};

			// 在设置onreadystatechange之后再send
			xhr.send();
		});

		// 检查onInterceptorError是否被调用
		expect(onInterceptorError).toHaveBeenCalled();
		// 检查响应是否未被修改
		const response = JSON.parse(xhr.responseText);
		expect(response.modified).toBeUndefined();
		expect(response.id).toBe(1);
	});
});
