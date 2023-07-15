type CallBackFunction = (value: unknown) => void;

export class Observable {
	_value: unknown | null = null;
	observers: CallBackFunction[] = [];

	constructor(initialValue: unknown) {
		this._value = initialValue;
	}

	set value(newValue) {
		this._value = newValue;
		this.notify();
	}

	get value() {
		return this._value;
	}

	subscribe = (callbackFunction: CallBackFunction) => {
		this.observers.push(callbackFunction);
	};

	notify = () => {
		this.observers.forEach(observer => {
			observer(this.value);
		});
	};

	unsubscribe = (callbackFunction: CallBackFunction) => {
		const observers = this.observers.slice();

		this.observers = observers.filter(observer => {
			return observer !== callbackFunction;
		});
	};
}
