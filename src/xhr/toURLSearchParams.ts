export function toURLSearchParams(obj:object) {
	const tmp: Record<string, string> = {};
	for (const key in obj) {
		tmp[key] = typeof obj[key] === 'object' ? JSON.stringify(obj[key]) : String(obj[key]);
	}
	return new URLSearchParams(tmp).toString();
}