import type {IRequest, IRequestArgs, IRequestOptions} from "./IRequest.js";
import type {IRequestHeaders} from "./http-types.js";
import {HttpHeaderNames, MimeTypes} from "./http-types.js";
import {toURLSearchParams} from "./toURLSearchParams.js";

export async function conversionToRequestOptions(args: IRequestArgs, request: IRequest): Promise<IRequestOptions> {
	const headers: IRequestHeaders = {};
	if (request.additionalHeaders) {
		if (typeof request.additionalHeaders === "function") {
			Object.assign(headers, await request.additionalHeaders(args));
		} else {
			Object.assign(headers, request.additionalHeaders);
		}
	}
	if (args.headers) {
		Object.assign(headers, args.headers);
	}
	if (args.body && !(HttpHeaderNames.ContentType in headers)) {
		headers[HttpHeaderNames.ContentType] = request.defaultContentType;
	}
	if (typeof args.body === 'object') {
		if(headers[HttpHeaderNames.ContentType]===MimeTypes.FormUrlEncoded) {
			args.body = toURLSearchParams(args.body)
		} else if(headers[HttpHeaderNames.ContentType]?.toLowerCase().includes('json')) {
			args.body = JSON.stringify(args.body)
		}
	}
	args.responseType || (args.responseType = request.defaultResponseType);
	if (typeof args.params === 'object') {
		args.params = toURLSearchParams(args.params);
	}
	args.headers = headers;
	return args as IRequestOptions;
}
