import {
	IRequiredInterceptor,
	IResponseInterceptorInfo,
	matchInterceptors,
	StatusError,
	throwError
} from "../base";
import {isString} from "gs-base";

const InterceptorsKey = '__fetchInterceptors';

// 获取全局对象，兼容 Web Workers 环境
const globalObj = typeof window !== 'undefined' ? window : self;

export function getFetchInterceptors() {
	return (globalObj as any)[InterceptorsKey] as IRequiredInterceptor<Response>[];
}

export function checkAndInstallFetch(): IRequiredInterceptor<Response>[] {
	if (InterceptorsKey in globalObj) {
		return (globalObj as any)[InterceptorsKey] as IRequiredInterceptor<Response>[];
	}
	const interceptors: IRequiredInterceptor<Response>[] = [];
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
		const currentInterceptors = getFetchInterceptors();
		if (!currentInterceptors || !currentInterceptors.length) {
			return originalFetch(input, init);
		}

		// 处理请求参数
		const url = input instanceof URL ? input.toString() : input as string;
		const method = init?.method || 'GET';
		const body = init?.body as string;

		// 匹配拦截器
		const matchedInfos: IResponseInterceptorInfo<Response>[] = matchInterceptors(method, url, body, currentInterceptors);
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

async function handleResponseWithModification(response: Response, matchedInfos: IResponseInterceptorInfo<Response>[], method: string, url: string, body?: string): Promise<Response> {
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
			const rv = interceptor.after(modifiedResponseText, beforeReturnValue, response);
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

async function handleResponseWithoutModification(response: Response, matchedInfos: IResponseInterceptorInfo<Response>[], method: string, url: string, body?: string): Promise<Response> {
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
			const rv = interceptor.after(responseText, beforeReturnValue, response);
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
