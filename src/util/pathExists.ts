import { access, constants } from "fs/promises";

const pathExists = (path: string) =>
	access(path, constants.F_OK)
		.then(data => true)
		.catch(err => false);

export { pathExists };
