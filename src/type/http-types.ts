export const enum HttpHeaderNames {
	Accept = "Accept",
	Referer = "Referer",
	ContentType = "Content-Type",
	Authorization = "Authorization",
	XCsrfToken = "X-Csrf-Token",
	XTwitterActiveUser = "X-Twitter-Active-User",
	XClientUuid = "X-Client-Uuid",
	XTwitterClientLanguage = "X-Twitter-Client-Language",
	XTwitterAuthType = "X-Twitter-Auth-Type",
	XTwitterPolling = "X-Twitter-Polling",
}

export const EntityHeaderNames = [
	HttpHeaderNames.ContentType,
] as const;

export const RequestHeaderNames = [
	...EntityHeaderNames,
	HttpHeaderNames.Accept,
	HttpHeaderNames.Referer,
	HttpHeaderNames.Authorization,
	HttpHeaderNames.XCsrfToken,
	HttpHeaderNames.XTwitterActiveUser,
	HttpHeaderNames.XClientUuid,
	HttpHeaderNames.XTwitterClientLanguage,
	HttpHeaderNames.XTwitterAuthType,
	HttpHeaderNames.XTwitterPolling,
] as const;
export const ResponseHeaderNames = [
	...EntityHeaderNames,
] as const;

export type RequestHeaderName = typeof RequestHeaderNames[number];

export type ResponseHeaderName = typeof ResponseHeaderNames[number];

export const enum RequestMethods {
	Get = "GET",
	Post = "POST",
	Put = "PUT",
	Delete = "DELETE",
	Patch = "PATCH",
	Head = "HEAD",
	Options = "OPTIONS",
	Connect = "CONNECT",
	Trace = "TRACE",
}

export const enum MimeTypes {
	Text = "text/plain",
	Html = 'text/html',
	Json = "application/json",
	FormUrlEncoded = "application/x-www-form-urlencoded",
	MultipartFormData = "multipart/form-data",
}

export const ResponseTypes = [
	MimeTypes.Text,
	MimeTypes.Json,
	'raw'
] as const

export type ResponseMimeType = typeof ResponseTypes[number]

export interface IRequestHeaders {

	[HttpHeaderNames.ContentType]?: MimeTypes | string;

	[key: RequestHeaderName | string]: string;

}

export const enum ResponseStatus {
	Ok = 200,
	Created = 201,
	Accepted = 202,
	NoContent = 204,
	MovedPermanently = 301,
	Found = 302,
	NotModified = 304,
	TemporaryRedirect = 307,
	PermanentRedirect = 308,
	BadRequest = 400,
	Unauthorized = 401,
	Forbidden = 403,
	NotFound = 404,
	Conflict = 409,
	UnprocessableEntity = 422,
	TooManyRequests = 429,
	InternalError = 500,
	NotImplemented = 501,
	ServiceUnavailable = 503,
	GatewayTimeout = 504,
	NetworkAuthenticationRequired = 511,
}
