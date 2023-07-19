import { getDataStore } from "./stores.js";
import { Collection, Context, HookOperationArgs, InputData } from "./types.js";

const handleHooksPlugins = async (
	ctx: Context,
	hooks: Collection["hooks"],
	inputData: InputData,
	operationArgs: HookOperationArgs
) => {
	return async () => {
		for (const obj of getDataStore().pluginStore.active) {
			obj.sourceCode(ctx);
		}

		for (const op of (hooks || {})[ctx.util.currentHook] || []) {
			const frozenOperationArgs = {
				...Object.freeze(Object.assign({}, operationArgs)),
				inputData: inputData.data,
				ctx: { ...ctx, customVars: ctx.customVars },
			};

			const hookReturn = await op(frozenOperationArgs);

			/*
				ACCESS CONTROL
			*/
			const beforeOpAndDenied =
				ctx.util.currentHook === "beforeOperation" && hookReturn === false;

			if (beforeOpAndDenied) {
				throw "Access denied.";
			}
		}
	};
};

export { handleHooksPlugins };
