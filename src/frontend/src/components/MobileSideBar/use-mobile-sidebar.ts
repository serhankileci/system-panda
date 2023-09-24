import { useState } from "react";

export const useMobileSideBar = (initialState = true) => {
	const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(initialState);

	const setSideBarState = (value: boolean) => {
		setIsSideBarOpen(value);
	};

	return [isSideBarOpen, setSideBarState] as const;
};
