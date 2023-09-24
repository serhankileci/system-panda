import { block } from "million/react";

import { ErrorCodeBanner } from "./ErrorCodeBanner";

export const ErrorScreen = block(() => {
	return (
		<div className="flex justify-center items-center h-screen p-4">
			<article className="text-center leading-normal">
				<ErrorCodeBanner
					code={500}
					description={"Something went wrong in the application. Please try again later."}
				/>
				<button
					className="border border-1 px-12 py-3 bg-[#224714] rounded-lg text-white font-bold hover:shadow-lg "
					onClick={() => location.reload()}
				>
					Refresh the page
				</button>
			</article>
		</div>
	);
});
