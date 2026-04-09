import type {IRequiredInterceptor, IInterceptor} from "./index.js";
import {removeFromArray} from "gs-base";

/**
 * 响应拦截器管理器
 * 用于管理拦截器的添加和移除
 */
export class InterceptorManager<T extends XMLHttpRequest | Response> {
	/**
	 * 检查并安装拦截器
	 */
	#checkAndInstall: () => IRequiredInterceptor<T>[];

	/**
	 * 获取拦截器列表
	 */
	#getInterceptors: () => IRequiredInterceptor<T>[];

	/**
	 * 构造函数
	 * @param checkAndInstall 检查并安装拦截器的函数
	 * @param getInterceptors 获取拦截器列表的函数
	 */
	constructor(checkAndInstall: () => IRequiredInterceptor<T>[], getInterceptors: () => IRequiredInterceptor<T>[]) {
		this.#checkAndInstall = checkAndInstall;
		this.#getInterceptors = getInterceptors;
	}

	/**
	 * 添加响应拦截器
	 * @param interceptor 拦截器对象
	 * @returns 更新后的拦截器列表
	 */
	addInterceptor(interceptor: IInterceptor<T>): IRequiredInterceptor<T>[] {
		interceptor.weights || (interceptor.weights = 0);
		const interceptors: IRequiredInterceptor<T>[] = this.#checkAndInstall();
		const index = interceptors.findIndex(i => i.id === interceptor.id);
		if (index > -1) {
			interceptors.splice(index, 1, interceptor as IRequiredInterceptor<T>);
		} else {
			interceptors.push(interceptor as IRequiredInterceptor<T>);
		}
		interceptors.sort(this.#sortFn);
		return interceptors;
	}

	/**
	 * 移除响应拦截器
	 * @param id 拦截器ID
	 */
	removeInterceptor(id: string): void {
		const interceptors = this.#getInterceptors();
		if (!interceptors || !interceptors.length) {
			return;
		}
		removeFromArray(interceptors, i => i.id === id);
	}

	/**
	 * 排序函数
	 * @param a 第一个拦截器
	 * @param b 第二个拦截器
	 * @returns 排序结果
	 */
	#sortFn(a: IRequiredInterceptor<T>, b: IRequiredInterceptor<T>): number {
		return b.weights - a.weights;
	}
}
