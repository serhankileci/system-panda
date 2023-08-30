import { useState } from "react";

export const useMobileSideBar = (initialState = true) => {
	const [showMenu, setShowMenu] = useState<boolean>(initialState);

	const setMenuState = (value: boolean) => {
		setShowMenu(value);
	};

	return [showMenu, setMenuState] as const;
};
