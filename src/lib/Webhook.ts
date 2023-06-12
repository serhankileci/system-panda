import EventEmitter from "events";
import { crudMapping, Webhook, WebhookOperations, WebhookPayload } from "../util/index.js";
const emitter = new EventEmitter();
const defaultHeaders = {
	"content-type": "application/json",
};

function webhook(webhook: Webhook): WebhookOperations {
	const { api, name, method, headers, onOperation } = webhook;

	return {
		init: () => {
			const mergedHeaders = Object.assign(headers || {}, defaultHeaders);

			const cb = async (data: WebhookPayload) => {
				let url = api;

				const opt: RequestInit = {
					method,
					headers: mergedHeaders,
				};

				if (method === "GET" && Object.keys(data).length > 0) {
					const queryStr = Object.keys(data)
						.map(key => key + "=" + data[key])
						.join("&");

					url += `/${queryStr}`;
				} else if (method === "POST") {
					opt.body = JSON.stringify(data);
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
