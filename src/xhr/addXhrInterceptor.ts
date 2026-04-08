import type {IRequiredInterceptor, IInterceptor} from "../base";
import {InterceptorManager} from "../base";
import {checkAndInstallXhr, getXhrInterceptors} from "./checkAndInstallXhr.js";

// 创建拦截器管理器实例
const interceptorManager = new InterceptorManager(checkAndInstallXhr, getXhrInterceptors);

/**
 * 添加 xhr 响应拦截器
 * @param interceptor 拦截器对象
 * @returns 更新后的拦截器列表
 */
export function addXhrInterceptor(interceptor: IInterceptor): IRequiredInterceptor[] {
	return interceptorManager.addInterceptor(interceptor);
}

/**
 * 移除 xhr 响应拦截器
 * @param id 拦截器ID
 */
export function removeXhrInterceptor(id: string): void {
	interceptorManager.removeInterceptor(id);
}
