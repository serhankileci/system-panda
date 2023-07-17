import { useState } from "react";

export const useMobileSideBar = (initialState = true) => {
	const [showMenu, setShowMenu] = useState<boolean>(initialState);

	return { showMenu, setShowMenu };
};
