import type {RequestMethods} from "./http-types.js";
import {InterceptorError, StatusError} from "./Errors.js";

export interface IInterceptor {

	readonly id: string

	weights?: number

	modifyResponse?: boolean

	beforeResponse(method: RequestMethods | string, requestUrl: string, requestBody: string): any | Promise<any>

	afterResponse(beforeReturnValue: any, responseText: string): void | any | Promise<void | any>

	onInterceptorError?(error: InterceptorError): void

	onStatusError?(error: StatusError): void

}

export interface IRequiredInterceptor extends IInterceptor {
	weights: number
}

export interface IResponseInterceptorInfo {
	beforeReturnValue: any
	interceptor: IRequiredInterceptor
}
