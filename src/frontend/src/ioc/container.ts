import { Container } from "inversify";
import { Types } from "../shared/types/ioc-types";
import { HttpGateway } from "../shared/http.gateway";
import { AuthenticationRepository } from "../auth/authentication.repository";
import { AuthPresenter } from "../auth/auth.presenter";
import { MetaDataRepository } from "../metadata/metadata.repository";
import { MetaDataPresenter } from "../metadata/metadata.presenter";

export const container = new Container({
	autoBindInjectable: true,
	defaultScope: "Transient",
});

container.bind(Types.IHttpGateway).to(HttpGateway).inTransientScope();

container.bind<AuthenticationRepository>(AuthenticationRepository).toSelf().inSingletonScope();
container.bind<AuthPresenter>(AuthPresenter).toSelf().inTransientScope();

container.bind<MetaDataRepository>(MetaDataRepository).toSelf().inSingletonScope();
container.bind<MetaDataPresenter>(MetaDataPresenter).toSelf().inTransientScope();
