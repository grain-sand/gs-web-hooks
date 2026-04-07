import {InterceptorError, StatusError, IRequiredResponseInterceptor, IResponseInterceptorInfo} from "../type";
import {isString} from "gs-base";

const InterceptorsKey = '__interceptors';
const FakeResponseTextKey = '__responseText';
const RealResponseTextKey = 'responseText';
const RawResponseTextNewKey = '__rawResponseText';
const RequestUrlKey = '__requestUrl';
const RequestMethodKey = '__requestMethod';

type OpenFn = (method: string, url: string | URL) => void
type SendFn = (body?: Document | XMLHttpRequestBodyInit | null) => void

export function getInterceptors() {
	return (XMLHttpRequest as any)[InterceptorsKey] as IRequiredResponseInterceptor[];
}

export function checkAndInstall(): IRequiredResponseInterceptor[] {
	if (InterceptorsKey in XMLHttpRequest) {
		return (XMLHttpRequest as any)[InterceptorsKey] as IRequiredResponseInterceptor[];
	}
	const interceptors: IRequiredResponseInterceptor[] = [];
	// 存储拦截器数组
	Object.defineProperty(XMLHttpRequest, InterceptorsKey, {
		value: interceptors,
		writable: false,
		enumerable: true,
		configurable: false
	});
	replaceOpenMethod();
	replaceSendMethod();
	return interceptors;
}

function defineProps(): void {
	const responseTextProperty: PropertyDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, RealResponseTextKey)!;
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

function replaceSendMethod(): void {
	const send: SendFn = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function (body?: any): void {
		const currentInterceptors = getInterceptors();
		if (!currentInterceptors || !currentInterceptors.length) {
			return send.call(this, body);
		}
		const matchedInfos: IResponseInterceptorInfo[] = matchInterceptors(this[RequestMethodKey], this[RequestUrlKey], body, currentInterceptors);
		if (!matchedInfos.length) {
			return send.call(this, body);
		}
		const needsModifyResponse = matchedInfos.some(({interceptor}) => interceptor.modifyResponse !== false);
		if (needsModifyResponse) {
			// 确保定义了必要的属性
			if (!(RawResponseTextNewKey in XMLHttpRequest.prototype)) {
				defineProps();
			}
			replaceOnreadystatechange(this, matchedInfos, body);
		} else {
			addSuccessListener(this, matchedInfos, body);
		}
		return send.call(this, body);
	}
}

function addSuccessListener(xhr: XMLHttpRequest, matchedInfos: IResponseInterceptorInfo[], body?: any) {
	const onreadystatechange: Function = xhr.onreadystatechange;
	xhr.onreadystatechange = function () {
		if (this.readyState !== 4) {
			return onreadystatechange.call(this);
		}
		try {
			if (this.status !== 200) {
				const err = new StatusError({
					message: `${this.status} ${this.statusText}`,
					method: this[RequestMethodKey],
					requestUrl: this[RequestUrlKey],
					status: this.status,
					requestBody: body,
					responseText: this.responseText as any,
				})
				for (const {interceptor} of matchedInfos) {
					try {
						interceptor.onStatusError && interceptor.onStatusError(err);
					} catch {
					}
				}
				return;
			}
			for (const {beforeReturnValue, interceptor} of matchedInfos) {
				try {
					const rv = interceptor.afterResponse(beforeReturnValue, this.responseText);
					if (rv !== undefined && rv !== null) {
						// 当modifyResponse为false时，如果afterResponse返回了数据，回调onInterceptorError
						throwError(`${interceptor.id} afterResponse should not return data when modifyResponse is false`, interceptor, this[RequestMethodKey], this[RequestUrlKey], beforeReturnValue, new Error('afterResponse should not return data when modifyResponse is false'));
					}
				} catch (e) {
					throwError(`${interceptor.id} afterResponse error`, interceptor, this[RequestMethodKey], this[RequestUrlKey], beforeReturnValue, e);
				}
			}
		} finally {
			onreadystatechange.call(this);
		}
	}
}

function replaceOnreadystatechange(xhr: XMLHttpRequest, matchedInfos: IResponseInterceptorInfo[], body?: any) {
	const onreadystatechange: Function = xhr.onreadystatechange;
	xhr.onreadystatechange = function () {
		if (this.readyState !== 4) {
			return onreadystatechange.call(this);
		}
		try {
			if (this.status !== 200) {
				const err = new StatusError({
					message: `${this.status} ${this.statusText}`,
					method: this[RequestMethodKey],
					requestUrl: this[RequestUrlKey],
					status: this.status,
					requestBody: body,
					responseText: this.responseText as any,
				})
				for (const {interceptor} of matchedInfos) {
					try {
						interceptor.onStatusError && interceptor.onStatusError(err);
					} catch {
					}
				}
				return;
			}
			for (const {beforeReturnValue, interceptor} of matchedInfos) {
				try {
					const rv = interceptor.afterResponse(beforeReturnValue, this.responseText);
					if (rv) {
						if (isString(rv)) {
							this[FakeResponseTextKey] = rv;
						} else {
							this[FakeResponseTextKey] = JSON.stringify(rv);
						}
					}
				} catch (e) {
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
		} catch (e) {
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
	} catch (e) {
		console.error(e);
	}
}
