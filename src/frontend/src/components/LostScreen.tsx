import { block } from "million/react";

import { router } from "../routing/router";
import { ErrorCodeBanner } from "./ErrorCodeBanner";

export const LostScreen = block(() => {
	return (
		<div className="flex justify-center items-center h-screen p-4">
			<article className="text-center leading-normal">
				<ErrorCodeBanner />
				<button
					className="border border-1 px-12 py-3 bg-[#224714] rounded-lg text-white font-bold hover:shadow-lg "
					onClick={() =>
						router.navigate({
							to: "/",
						})
					}
				>
					Go back to app
				</button>
			</article>
		</div>
	);
});
