import { useState } from "react";

export const useMobileSideBar = (initialState = true) => {
	const [show, setShow] = useState<boolean>(initialState);

	return {
		show,
		setShow,
	};
};
