import type {RequestMethods, ResponseStatus} from "./http-types.js";
import {RequiredSome} from "gs-base";

export interface IRequestError {

	readonly message: string
	readonly requestUrl: string
	readonly method: RequestMethods | string
	readonly status?: ResponseStatus | number
	readonly requestBody?: string
	readonly responseText?: string
	readonly cause?: Error | unknown

}

export interface IStatusError extends RequiredSome<IRequestError, 'status'> {

}

export class StatusError extends Error implements IStatusError {

	readonly status: ResponseStatus | number
	readonly requestUrl: string
	readonly method: RequestMethods | string
	readonly requestBody?: string
	readonly responseText?: string

	constructor(args: IStatusError) {
		super(args.message);
		this.status = args.status;
		this.requestUrl = args.requestUrl;
		this.method = args.method;
		this.requestBody = args.requestBody;
		this.responseText = args.responseText;
	}

}

export class RequestError extends Error implements IRequestError {

	readonly requestUrl: string
	readonly method: RequestMethods | string
	readonly status?: ResponseStatus | number
	readonly requestBody?: string
	readonly responseText?: string

	constructor(args: IRequestError) {
		if (args.cause) {
			// @ts-ignore
			super(args.message, {cause: args?.cause as unknown});
		} else {
			super(args.message);
		}
		this.requestUrl = args.requestUrl;
		this.method = args.method;
		this.status = args.status;
		this.requestBody = args.requestBody;
		this.responseText = args.responseText;
	}
}

export class InterceptorError extends RequestError {

}
