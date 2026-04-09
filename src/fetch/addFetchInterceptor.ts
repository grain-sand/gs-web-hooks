import type {IRequiredInterceptor, IInterceptor} from "../base";
import {InterceptorManager} from "../base";
import {checkAndInstallFetch, getFetchInterceptors} from "./checkAndInstallFetch.js";

// 创建拦截器管理器实例
const interceptorManager = new InterceptorManager<Response>(checkAndInstallFetch, getFetchInterceptors);

/**
 * 添加 fetch 响应拦截器
 * @param interceptor 拦截器对象
 * @returns 更新后的拦截器列表
 */
export function addFetchInterceptor(interceptor: IInterceptor<Response>): IRequiredInterceptor<Response>[] {
	return interceptorManager.addInterceptor(interceptor);
}

/**
 * 移除 fetch 响应拦截器
 * @param id 拦截器ID
 */
export function removeFetchInterceptor(id: string): void {
	interceptorManager.removeInterceptor(id);
}
