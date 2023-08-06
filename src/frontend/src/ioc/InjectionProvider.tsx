import { Container } from "inversify";
import { createContext, ReactNode } from "react";

type InversifyContextValue = {
	container: Container | null;
};

export const InversifyContext = createContext<InversifyContextValue>({
	container: null,
});

type InjectionProviderProps = {
	container: Container;
	children: ReactNode;
};

export const InjectionProvider: React.FC<InjectionProviderProps> = ({ container, children }) => {
	return <InversifyContext.Provider value={{ container }}>{children}</InversifyContext.Provider>;
};
