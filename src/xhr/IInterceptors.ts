import type {RequestMethods} from "./http-types.js";
import {InterceptorError, StatusError} from "./Errors.js";

export interface IResponseInterceptor {

	readonly id: string

	weights?: number

	beforeResponse(method: RequestMethods | string, requestUrl: string, requestBody: string): any | Promise<any>

	afterResponse(beforeReturnValue: any, responseText: string): void | any | Promise<void | any>

	onInterceptorError?(error: InterceptorError): void

	onStatusError?(error: StatusError): void

}

export interface IRequiredResponseInterceptor extends IResponseInterceptor {
	weights: number
}
