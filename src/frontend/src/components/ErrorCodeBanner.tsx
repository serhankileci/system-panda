import { block } from "million/react";

type ErrorCodeBannerProps = {
	code?: string | number;
	description?: string;
};

const ErrorCodeBannerComponent = (props: ErrorCodeBannerProps) => {
	const { code = 404, description = "This page does not exist. Return to the home page." } =
		props;

	return (
		<>
			<hgroup className="mb-8">
				<h2>Error code</h2>
				<h1 className="font-bold text-9xl md:text-[15rem] text-red-900 leading-[0.9]">
					{code}
				</h1>
			</hgroup>
			<p className="text-lg font-light md:text-2xl mb-6">{description}</p>
		</>
	);
};

export const ErrorCodeBanner = block(ErrorCodeBannerComponent);
