import EventEmitter from "node:events";
import { crudMapping, EventTriggerPayload, HookFunc, WebhookFunc } from "./util/index.js";

const emitter = new EventEmitter();
const defaultHeaders: Record<string, string> | undefined = {
	"content-type": "application/json",
};

const hook: HookFunc = ({ hook, onTrigger }) => {
	return {
		init: () => {
			const cb = async () => {
				onTrigger();
			};

			emitter.on(hook, cb);
		},
		trigger: () => {
			emitter.emit(hook);
		},
	};
};

const webhook: WebhookFunc = webhook => {
	const { api, name, headers, onOperation } = webhook;

	return {
		init: () => {
			const cb = async (obj: EventTriggerPayload) => {
				const mergedHeaders = Object.assign(headers || {}, defaultHeaders);
				const opt: RequestInit = {
					method: "POST",
					headers: mergedHeaders,
					body: JSON.stringify(obj),
				};

				await fetch(api, opt);
			};

			emitter.on(name, cb);
		},
		trigger: data => {
			if (onOperation.some(x => crudMapping[x])) emitter.emit(name, data);
		},
	};
};

export { hook, webhook };
