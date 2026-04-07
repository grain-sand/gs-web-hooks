import type {IRequiredResponseInterceptor, IResponseInterceptor} from "./IInterceptors.js";
import {checkAndInstall, getInterceptors} from "./checkAndInstall.js";
import {removeFromArray} from "gs-base";

export function addXhrResponseInterceptor(interceptor: IResponseInterceptor): IRequiredResponseInterceptor[] {
	interceptor.weights || (interceptor.weights = 0);
	const interceptors: IRequiredResponseInterceptor[] = checkAndInstall();
	const index = interceptors.findIndex(i => i.id === interceptor.id);
	if (index > -1) {
		interceptors.splice(index, 1, interceptor as IRequiredResponseInterceptor);
	} else {
		interceptors.push(interceptor as IRequiredResponseInterceptor);
	}
	interceptors.sort(sortFn);
	return interceptors;
}

export function removeXhrResponseInterceptor(id:string):void {
	const interceptors = getInterceptors();
	if(!interceptors || !interceptors.length) {
		return;
	}
	removeFromArray(interceptors, i => i.id === id);
}

function sortFn(a: IRequiredResponseInterceptor, b: IRequiredResponseInterceptor): number {
	return b.weights - a.weights
}

