import { interfaces } from "inversify";
import { memo, useContext, createElement } from "react";
import { InversifyContext } from "./InjectionProvider";

type DependencyIdentifiers = {
	[key: string]: interfaces.ServiceIdentifier<unknown>;
};

type InjectedProps = Partial<{ [key: string]: unknown }>;

export const withInjection = <OriginalProps extends object>(identifiers: DependencyIdentifiers) => {
	type CombinedProps = OriginalProps & InjectedProps;

	return (Component: React.ComponentType<CombinedProps>) => {
		return memo((props: CombinedProps) => {
			const { container } = useContext(InversifyContext);

			if (!container) {
				throw new Error(
					"Inversify container is not available. Make sure to wrap your component tree with the InjectionProvider."
				);
			}

			const injectedDependencyProps: InjectedProps = {};

			Object.keys(identifiers).forEach((key: string) => {
				const identifier = identifiers[key];
				injectedDependencyProps[key] = container.get(identifier);
			});

			const finalProps: CombinedProps = {
				...props,
				...injectedDependencyProps,
			};

			return createElement(Component, finalProps);
		});
	};
};
