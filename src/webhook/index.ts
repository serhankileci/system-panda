import EventEmitter from "events";
import { crudMapping, EventTriggerPayload, Webhook, WebhookOperations } from "../util/index.js";
const emitter = new EventEmitter();
const defaultHeaders = {
	"content-type": "application/json",
};

function webhook(webhook: Webhook): WebhookOperations {
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
}

export { webhook };
