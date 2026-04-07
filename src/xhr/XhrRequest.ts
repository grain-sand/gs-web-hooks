import type {
	AdditionalRequestHeadersType,
	IGetArgs,
	IPostArgs,
	IRequest,
	IRequestArgs,
	IRequestOptions
} from "./IRequest.js";
import type {IRequestHeaders, ResponseMimeType} from "./http-types.js";
import {HttpHeaderNames, MimeTypes, RequestMethods} from "./http-types.js";
import {conversionToRequestOptions} from "./conversionToRequestOptions.js";
import {RequestError} from "./Errors.js";

export class XhrRequest implements IRequest {

	additionalHeaders?: IRequestHeaders | AdditionalRequestHeadersType;

	defaultResponseType?: ResponseMimeType;

	defaultContentType: MimeTypes = MimeTypes.FormUrlEncoded

	delete(url: string, args: IPostArgs = {}): Promise<any> {
		return this.request({
			...args,
			url,
			method: RequestMethods.Delete
		});
	}

	get(url: string, args: IGetArgs = {}): Promise<any> {
		return this.request({
			...args,
			url,
			method: RequestMethods.Get
		});
	}

	post(url: string, args: IPostArgs = {}): Promise<any> {
		return this.request({
			...args,
			url,
			method: RequestMethods.Post
		});
	}

	put(url: string, args: IPostArgs = {}): Promise<any> {
		return this.request({
			...args,
			url,
			method: RequestMethods.Put
		});
	}

	request(args: IRequestArgs): Promise<any> {
		return new Promise(async (resolve, reject) => {

			const options: IRequestOptions = await conversionToRequestOptions(args, this);

			let url = options.url;
			if (options.params) {
				url += `?${options.params}`;
			}

			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = () => onreadystatechange(options, url, xhr, resolve, reject);

			try {
				xhr.open(options.method, url);
				if (options.headers) {
					for (const [key, value] of Object.entries(options.headers)) {
						xhr.setRequestHeader(key, value);
					}
				}
				xhr.send(options.body!)
			} catch (e: any) {
				reject(new RequestError({
					message: 'network error',
					requestUrl: url,
					method: options.method,
					status: xhr.status,
					requestBody: options.body,
					responseText: xhr.responseText,
					cause: e
				}));
			}

		})
	}

}

async function onreadystatechange(options: IRequestOptions, url: string, xhr: XMLHttpRequest, resolve, reject): Promise<void> {
	if (xhr.readyState < 4) {
		return;
	}
	if (xhr.status !== 200) {
		reject(new RequestError({
			message: 'request error',
			requestUrl: url,
			method: options.method,
			status: xhr.status,
			requestBody: options.body,
			responseText: xhr.responseText,
		}));
		return;
	}
	const responseType: string = options.responseType || xhr.getResponseHeader(HttpHeaderNames.ContentType) || '';
	if (responseType.toLowerCase().includes('json')) {
		try {
			resolve(JSON.parse(xhr.responseText));
		} catch (e: any) {
			reject(new RequestError({
				message: 'json parse error',
				requestUrl: url,
				method: options.method,
				status: xhr.status,
				requestBody: options.body,
				responseText: xhr.responseText,
				cause: e
			}));
		}
		return
	}
	if (responseType.toLowerCase().includes('text')) {
		resolve(xhr.responseText);
		return
	}
	resolve(xhr);
}

export const Request: IRequest = new XhrRequest();
