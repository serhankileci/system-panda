/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createRegExp, oneOrMore, wordChar, letter, digit, exactly } from "magic-regexp";

export const emailRegex = createRegExp(
	oneOrMore(wordChar)
		.and("@")
		.and(oneOrMore(letter.or(digit).or("-")))
		.and(
			exactly(".")
				.and(oneOrMore(letter.or(digit)))
				.times.atLeast(1)
		)
);
