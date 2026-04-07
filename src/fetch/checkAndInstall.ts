import {InterceptorError, IRequiredResponseInterceptor, IResponseInterceptorInfo, StatusError} from "../type";
import {isString} from "gs-base";

const InterceptorsKey = '__fetchInterceptors';

// 获取全局对象，兼容 Web Workers 环境
const globalObj = typeof window !== 'undefined' ? window : self;

export function getInterceptors() {
	return (globalObj as any)[InterceptorsKey] as IRequiredResponseInterceptor[];
}

export function checkAndInstall(): IRequiredResponseInterceptor[] {
	if (InterceptorsKey in globalObj) {
		return (globalObj as any)[InterceptorsKey] as IRequiredResponseInterceptor[];
	}
	const interceptors: IRequiredResponseInterceptor[] = [];
	// 存储拦截器数组
	Object.defineProperty(globalObj, InterceptorsKey, {
		value: interceptors,
		writable: false,
		enumerable: true,
		configurable: false
	});
	replaceFetchMethod();
	return interceptors;
}

function replaceFetchMethod(): void {
	const originalFetch = globalObj.fetch;
	globalObj.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		const currentInterceptors = getInterceptors();
		if (!currentInterceptors || !currentInterceptors.length) {
			return originalFetch(input, init);
		}

		// 处理请求参数
		const url = input instanceof URL ? input.toString() : input as string;
		const method = init?.method || 'GET';
		const body = init?.body as string;

		// 匹配拦截器
		const matchedInfos: IResponseInterceptorInfo[] = matchInterceptors(method, url, body, currentInterceptors);
		if (!matchedInfos.length) {
			return originalFetch(input, init);
		}

		// 执行请求
		const response = await originalFetch(input, init);

		// 检查是否需要修改响应
		const needsModifyResponse = matchedInfos.some(({interceptor}) => interceptor.modifyResponse !== false);

		// 处理响应
		if (needsModifyResponse) {
			return handleResponseWithModification(response, matchedInfos, method, url, body);
		} else {
			return handleResponseWithoutModification(response, matchedInfos, method, url, body);
		}
	};
}

async function handleResponseWithModification(response: Response, matchedInfos: IResponseInterceptorInfo[], method: string, url: string, body?: string): Promise<Response> {
	// 读取响应文本
	const responseText = await response.text();

	// 检查响应状态
	if (!response.ok) {
		const err = new StatusError({
			message: `${response.status} ${response.statusText}`,
			method,
			requestUrl: url,
			status: response.status,
			requestBody: body,
			responseText
		});
		for (const {interceptor} of matchedInfos) {
			try {
				interceptor.onStatusError && interceptor.onStatusError(err);
			} catch {
			}
		}
		// 返回原始响应
		return new Response(responseText, response);
	}

	// 执行拦截器的afterResponse方法
	let modifiedResponseText = responseText;
	for (const {beforeReturnValue, interceptor} of matchedInfos) {
		try {
			const rv = interceptor.afterResponse(beforeReturnValue, modifiedResponseText);
			if (rv) {
				if (isString(rv)) {
					modifiedResponseText = rv;
				} else {
					modifiedResponseText = JSON.stringify(rv);
				}
			}
		} catch (e) {
			throwError(`${interceptor.id} afterResponse error`, interceptor, method, url, beforeReturnValue, e);
		}
	}

	// 创建修改后的响应
	return new Response(modifiedResponseText, response);
}

async function handleResponseWithoutModification(response: Response, matchedInfos: IResponseInterceptorInfo[], method: string, url: string, body?: string): Promise<Response> {
	// 读取响应文本
	const responseText = await response.text();

	// 检查响应状态
	if (!response.ok) {
		const err = new StatusError({
			message: `${response.status} ${response.statusText}`,
			method,
			requestUrl: url,
			status: response.status,
			requestBody: body,
			responseText
		});
		for (const {interceptor} of matchedInfos) {
			try {
				interceptor.onStatusError && interceptor.onStatusError(err);
			} catch {
			}
		}
		// 返回原始响应
		return new Response(responseText, response);
	}

	// 执行拦截器的afterResponse方法
	for (const {beforeReturnValue, interceptor} of matchedInfos) {
		try {
			const rv = interceptor.afterResponse(beforeReturnValue, responseText);
			if (rv !== undefined && rv !== null) {
				// 当modifyResponse为false时，如果afterResponse返回了数据，回调onInterceptorError
				throwError(`${interceptor.id} afterResponse should not return data when modifyResponse is false`, interceptor, method, url, beforeReturnValue, new Error('afterResponse should not return data when modifyResponse is false'));
			}
		} catch (e) {
			throwError(`${interceptor.id} afterResponse error`, interceptor, method, url, beforeReturnValue, e);
		}
	}

	// 返回原始响应
	return new Response(responseText, response);
}

function matchInterceptors(method: string, url: string, body: any, interceptors: IRequiredResponseInterceptor[]): IResponseInterceptorInfo[] {
	const infos: IResponseInterceptorInfo[] = [];
	for (const interceptor of interceptors) {
		try {
			const beforeReturnValue = interceptor.beforeResponse(method, url, body);
			if (beforeReturnValue === undefined) {
				continue;
			}
			infos.push({
				beforeReturnValue,
				interceptor
			});
		} catch (e) {
			throwError(`${interceptor.id} beforeResponse error`, interceptor, method, url, body, e);
		}
	}
	return infos;
}

function throwError(message: string, interceptor: IRequiredResponseInterceptor, method: string, requestUrl: string, requestBody: any, cause?: any) {
	try {
		interceptor.onInterceptorError && interceptor.onInterceptorError(new InterceptorError({
			message,
			method,
			requestUrl,
			requestBody,
			cause
		}));
	} catch (e) {
		console.error(e);
	}
}
