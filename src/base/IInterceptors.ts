import type {RequestMethods} from "./http-types.js";
import {InterceptorError, StatusError} from "./Errors.js";

export interface IInterceptor<T extends XMLHttpRequest | Response> {

	readonly id: string

	weights?: number

	modifyResponse?: boolean

	before(url: string, method: RequestMethods | string, requestBody: string): any | Promise<any>

	after(text: string, beforeReturnValue: any, context: T): void | any | Promise<void | any>

	onInterceptorError?(error: InterceptorError): void

	onStatusError?(error: StatusError): void

}

export interface IRequiredInterceptor<T extends XMLHttpRequest | Response> extends IInterceptor<T> {
	weights: number
}

export interface IResponseInterceptorInfo<T extends XMLHttpRequest | Response> {
	beforeReturnValue: any
	interceptor: IRequiredInterceptor<T>
}
