import { Container } from "inversify";

import { AuthPresenter } from "../auth/auth.presenter";
import { AuthenticationRepository } from "../auth/authentication.repository";
import { MetaDataPresenter } from "../metadata/metadata.presenter";
import { MetaDataRepository } from "../metadata/metadata.repository";
import { FakeHttpGateway } from "../shared/gateways/fakehttp.gateway";
import { HttpGateway } from "../shared/gateways/http.gateway";
import { Types } from "../shared/types/ioc-types";
import { CollectionRepository } from "../modules/collection/collection.repository";

export class InversifyConfig {
	container: InstanceType<typeof Container>;
	mode: "test" | "default" | string = "default";

	constructor(mode = "default") {
		this.container = new Container({
			autoBindInjectable: true,
			defaultScope: "Transient",
		});

		this.mode = mode;
	}

	setupBindings() {
		if (this.mode === "test") {
			this.container.bind(Types.IHttpGateway).to(FakeHttpGateway).inTransientScope();
		} else {
			this.container.bind(Types.IHttpGateway).to(HttpGateway).inTransientScope();
		}

		this.container
			.bind<AuthenticationRepository>(AuthenticationRepository)
			.toSelf()
			.inSingletonScope();
		this.container.bind<AuthPresenter>(AuthPresenter).toSelf().inTransientScope();

		this.container.bind<MetaDataRepository>(MetaDataRepository).toSelf().inSingletonScope();
		this.container.bind<MetaDataPresenter>(MetaDataPresenter).toSelf().inTransientScope();

		this.container.bind<CollectionRepository>(CollectionRepository).toSelf().inSingletonScope();
	}
}
