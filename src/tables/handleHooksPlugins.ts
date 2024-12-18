import { Table, Context, HookOperationArgs, InputData, store } from "../util/index.js";

const handleHooksPlugins = async (
	ctx: Context,
	hooks: Table["hooks"],
	inputData: InputData,
	operationArgs: HookOperationArgs
) => {
	return async () => {
		for (const obj of store.plugins.get().active) {
			obj.sourceCode(ctx);
		}

		for (const op of (hooks || {})[ctx.util.currentHook] || []) {
			const frozenOperationArgs = {
				...Object.freeze(Object.assign({}, operationArgs)),
				inputData: inputData.data,
				ctx: { ...ctx, custom: ctx.custom },
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
