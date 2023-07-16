import { Plugins } from "../../metadata/metadata.types";

export interface CallBackFunction {
	(arg: Plugins): void;
}
