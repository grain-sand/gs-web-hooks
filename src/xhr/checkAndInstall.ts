import type {IRequiredResponseInterceptor} from "./IInterceptors.js";
import {InterceptorError, StatusError} from "./Errors.js";
import {isString} from "gs-base";

const InterceptorsKey = '__interceptors';
const FakeResponseTextKey = '__responseText';
const RealResponseTextKey = 'responseText';
const RawResponseTextNewKey = '__rawResponseText';
const RequestUrlKey = '__requestUrl';
const RequestMethodKey = '__requestMethod';

type OpenFn = (method: string, url: string | URL) => void
type SendFn = (body?: Document | XMLHttpRequestBodyInit | null) => void

interface IResponseInterceptorInfo {
	beforeReturnValue: any
	interceptor: IRequiredResponseInterceptor
}

export function getInterceptors() {
	return (XMLHttpRequest as any)[InterceptorsKey] as IRequiredResponseInterceptor[];
}

export function checkAndInstall(): IRequiredResponseInterceptor[] {
	if (InterceptorsKey in XMLHttpRequest) {
		return (XMLHttpRequest as any)[InterceptorsKey] as IRequiredResponseInterceptor[];
	}
	const interceptors: IRequiredResponseInterceptor[] = [];
	defineProps(interceptors)
	replaceOpenMethod();
	replaceSendMethod(interceptors)
	return interceptors;
}

function defineProps(interceptors: IRequiredResponseInterceptor[]): void {
	const responseTextProperty: PropertyDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, RealResponseTextKey)!;
	Object.defineProperty(XMLHttpRequest, InterceptorsKey, {
		value: interceptors,
		writable: false,
		enumerable: true,
		configurable: false
	})
	Object.defineProperty(XMLHttpRequest.prototype, RawResponseTextNewKey, {
		get: responseTextProperty.get,
		set: responseTextProperty.set,
	})
	Object.defineProperty(XMLHttpRequest.prototype, FakeResponseTextKey, {
		writable: true,
		configurable: true
	})
	Object.defineProperty(XMLHttpRequest.prototype, RealResponseTextKey, {
		get: function () {
			return this[FakeResponseTextKey] || this[RawResponseTextNewKey];
		}
	})
}

function replaceOpenMethod(): void {
	const open: OpenFn = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (method, url): void {
		Object.defineProperty(this, RequestMethodKey, {
			value: method,
			writable: false,
			enumerable: false,
			configurable: false
		})
		Object.defineProperty(this, RequestUrlKey, {
			value: url,
			writable: false,
			enumerable: false,
			configurable: false
		})
		open.call(this, method, url);
	};
}

function replaceSendMethod(interceptors: IRequiredResponseInterceptor[]): void {
	const send: SendFn = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function (body?: any): void {
		if (!interceptors.length) {
			return send.call(this, body);
		}
		const matchedInfos: IResponseInterceptorInfo[] = matchInterceptors(this[RequestMethodKey], this[RequestUrlKey], body, interceptors);
		if (!matchedInfos.length) {
			return send.call(this, body);
		}
		replaceOnreadystatechange(this, matchedInfos, body);
		return send.call(this, body);
	}
}

function replaceOnreadystatechange(xhr: XMLHttpRequest, matchedInfos: IResponseInterceptorInfo[], body?: any) {
	const onreadystatechange: Function = xhr.onreadystatechange;
	xhr.onreadystatechange = function () {
		if (this.readyState !== 4) {
			return onreadystatechange.call(this);
		}
		try {
			if (xhr.status !== 200) {
				const err = new StatusError({
					message: `${xhr.status} ${xhr.statusText}`,
					method: xhr[RequestMethodKey],
					requestUrl: xhr[RequestUrlKey],
					status: xhr.status,
					requestBody: body,
					responseText: xhr.responseText as any,
				})
				for (const {interceptor} of matchedInfos) {
					try {
						interceptor.onStatusError && interceptor.onStatusError(err);
					} catch (e: any) {
					}
				}
				return;
			}
			for (const {beforeReturnValue, interceptor} of matchedInfos) {
				try {
					const rv = interceptor.afterResponse(beforeReturnValue, xhr.responseText);
					if (rv) {
						if (isString(rv)) {
							xhr[FakeResponseTextKey] = rv;
						} else {
							xhr[FakeResponseTextKey] = JSON.stringify(rv);
						}
					}
				} catch (e: any) {
					throwError(`${interceptor.id} afterResponse error`, interceptor, this[RequestMethodKey], this[RequestUrlKey], beforeReturnValue, e);
				}
			}
		} finally {
			onreadystatechange.call(this);
		}
	}
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
			})
		} catch (e: any) {
			throwError(`${interceptor.id} beforeResponse error`, interceptor, method, url, body, e);
		}
	}
	return infos
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
	} catch (e2: any) {
	}
}
