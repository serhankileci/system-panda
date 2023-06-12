function selectOnQuery(obj: object, keys: "*" | string[]) {
	return Object.fromEntries(
		Object.keys(obj).map(key =>
			keys === "*" || keys.includes(key) ? [key, true] : [key, false]
		)
	);
}

export { selectOnQuery };
