import EventEmitter from "events";
import { crudMapping, EventTriggerPayload, Webhook, WebhookOperations } from "../util/index.js";
const emitter = new EventEmitter();
const defaultHeaders = {
	"content-type": "application/json",
};

function webhook(webhook: Webhook): WebhookOperations {
	const { api, name, method, headers, onOperation } = webhook;

	return {
		init: () => {
			const cb = async (obj: EventTriggerPayload) => {
				const mergedHeaders = Object.assign(headers || {}, defaultHeaders);
				let url = api;

				const opt: RequestInit = {
					method,
					headers: mergedHeaders,
				};

				if (method === "GET") {
					url += "?";

					Object.entries(obj).forEach(([key, value], i) => {
						if (i > 0) url += "&";

						if (value?.constructor === Object) {
							url += `${Object.keys(key)
								.map(k => k + "=" + value)
								.join("&")}`;
						} else {
							url += `${key}=${value}`;
						}
					});
				} else if (method === "POST") {
					opt.body = JSON.stringify(obj);
				}

				await fetch(url, opt);
			};

			emitter.on(name, cb);
		},
		trigger: data => {
			if (onOperation.some(x => crudMapping[x])) emitter.emit(name, data);
		},
	};
}

export { webhook };
