import * as MobX from 'mobx';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';

main();

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const store = MobX.observable.map({});
	store.set('project', {});

	const connection = new WebSocket(`ws://${window.location.host}`);
	const close = () => connection.close();

	connection.addEventListener('open', (...args) => {
		window.addEventListener('beforeunload', close);
	});

	connection.addEventListener('close', (...args) => {
		window.removeEventListener('beforeunload', close);
	});

	connection.addEventListener('message', (e: MessageEvent) => {
		const message = parse(e.data);
		const { type, payload } = message;

		console.log(message);

		switch (type) {
			case 'project-start':
				store.set('project', payload);
				store.set('page', payload);
				store.set('element', payload);
				break;
			case 'styleguide-change':
				store.set('project', payload);
				break;
			case 'page-change':
				store.set('page', payload);
				break;
			case 'element-change':
				store.set('element', payload);
		}
	});
}

// tslint:disable-next-line:no-any
function parse(data: string): any {
	try {
		return JSON.parse(data);
	} catch (err) {
		return;
	}
}
