export const getAuthorizedStub = () => {
	return Promise.resolve({
		ok: "OK",
	});
};

export const getUnauthorizedStub = () => {
	return Promise.resolve({
		ok: "Unauthorized",
	});
};
