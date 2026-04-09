import {IRequiredInterceptor, IResponseInterceptorInfo} from "./IInterceptors";
import {InterceptorError} from "./Errors";

/**
 * 匹配拦截器
 * @param method 请求方法
 * @param url 请求URL
 * @param body 请求体
 * @param interceptors 拦截器数组
 * @returns 匹配的拦截器信息数组
 */
export function matchInterceptors<T extends XMLHttpRequest | Response>(method: string, url: string, body: any, interceptors: IRequiredInterceptor<T>[]): IResponseInterceptorInfo<T>[] {
	const infos: IResponseInterceptorInfo<T>[] = [];
	for (const interceptor of interceptors) {
		try {
			const beforeReturnValue = interceptor.before(url, method, body);
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

/**
 * 抛出错误
 * @param message 错误信息
 * @param interceptor 拦截器
 * @param method 请求方法
 * @param requestUrl 请求URL
 * @param requestBody 请求体
 * @param cause 错误原因
 */
export function throwError<T extends XMLHttpRequest | Response>(message: string, interceptor: IRequiredInterceptor<T>, method: string, requestUrl: string, requestBody: any, cause?: any) {
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
