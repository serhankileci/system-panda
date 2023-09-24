import { interfaces } from "inversify";
import { useContext } from "react";

import { InversifyContext } from "./InjectionProvider";

export const useInjection = <T>(identifier: interfaces.ServiceIdentifier<T>) => {
	const { container } = useContext(InversifyContext);

	if (!container) {
		throw new Error(
			"Inversify container is not available. Make sure to wrap your component tree with the InjectionProvider."
		);
	}

	return container.get<T>(identifier);
};
