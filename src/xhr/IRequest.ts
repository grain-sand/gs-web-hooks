import type {IRequestHeaders, ResponseMimeType} from "./http-types.js";
import {MimeTypes, RequestMethods} from "./http-types.js";

export type AdditionalRequestHeadersType = (args: IRequestArgs) => Promise<IRequestHeaders>;

export interface IRequest {

	additionalHeaders?: IRequestHeaders | AdditionalRequestHeadersType;

	defaultResponseType?: ResponseMimeType;

	defaultContentType?: MimeTypes

	/**
	 *
	 * @param args
	 * @throws RequestError
	 */
	request(args: IRequestArgs): Promise<any>;

	get(url: string, args?: IGetArgs): Promise<any>;

	post(url: string, args?: IPostArgs): Promise<any>;

	put(url: string, args?: IPostArgs): Promise<any>;

	delete(url: string, args?: IPostArgs): Promise<any>;

}

export interface IGetArgs {
	params?: object | string;
	headers?: IRequestHeaders;
	responseType?: ResponseMimeType;
}

export interface IPostArgs extends IGetArgs {
	body?: any;
}

export interface IRequestArgs extends IPostArgs {
	url: string;
	method: RequestMethods
}

export interface IRequestOptions extends IRequestArgs{
	headers: IRequestHeaders;
}
