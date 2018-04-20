import * as MobX from 'mobx';
import * as MobXReact from 'mobx-react';
import * as Path from 'path';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const store = MobX.observable.map({});
	store.set('components', []);
	store.set('tasks', []);

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

		switch (type) {
			case 'project-start':
				store.set('projectId', payload.projectId);
				store.set('pages', payload.pages);
				store.set('pageId', payload.pageId);
				store.set('elementId', payload.elementId);
				scheduleScript(store);
				break;
			case 'styleguide-change':
				store.set('pages', payload);
				scheduleScript(store);
				break;
			case 'page-change':
				store.set('pageId', payload);
				break;
			case 'element-change':
				store.set('elementId', payload);
		}
	});

	ReactDom.render(
		<MobXReact.Provider store={store}>
			<PreviewApplication />
		</MobXReact.Provider>,
		document.getElementById('app')
	);
}

// tslint:disable-next-line:no-any
function parse(data: string): any {
	try {
		return JSON.parse(data);
	} catch (err) {
		return;
	}
}

interface InjectedPreviewApplicationProps {
	// tslint:disable-next-line:no-any
	store: any;
}

@MobXReact.inject('store')
@MobXReact.observer
class PreviewApplication extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewApplicationProps;
		const pages = props.store.get('pages') || [];
		const pageId = props.store.get('pageId');
		const page = pages.find(p => p.id === pageId);
		const tasks = props.store.get('tasks');

		if (!page || tasks.length > 0) {
			return null;
		}

		const component = page.root;

		return (
			<PreviewComponent
				children={component.children}
				pattern={component.pattern}
				properties={component.properties}
				name={component.name}
				uuid={component.uuid}
			/>
		);
	}
}

interface PreviewApplicationProps {
	children: PreviewApplicationProps[];
	pattern: string;
	// tslint:disable-next-line:no-any
	properties: { [key: string]: any };
	name: string;
	uuid: string;
}

class PreviewComponent extends React.Component<PreviewApplicationProps> {
	public render(): JSX.Element | null {
		const component = this.props.pattern ? window[safePattern(this.props.pattern)] : null;

		if (!component) {
			return (
				<React.Fragment>
					{this.props.children.map(child => <PreviewComponent key={child.uuid} {...child} />)}
				</React.Fragment>
			);
		}

		const Component = typeof component.default === 'function' ? component.default : component;

		return (
			<Component {...this.props.properties} data-sketch-name={this.props.name}>
				{this.props.children.map(child => <PreviewComponent key={child.uuid} {...child} />)}
			</Component>
		);
	}
}

interface TreeNode {
	children: TreeNode[];
	pattern: string;
}

function safePattern(id: string): string {
	return encodeURIComponent(id.split(Path.sep).join('-'));
}

function deriveComponents(tree: TreeNode, init: Set<string> = new Set()): Set<string> {
	if (typeof tree.pattern === 'string' && !tree.pattern.startsWith('synthetic:')) {
		init.add(tree.pattern);
	}

	return tree.children.reduce((acc, node) => {
		deriveComponents(node, acc);
		return acc;
	}, init);
}

// tslint:disable-next-line:no-any
function scheduleScript(store: any): void {
	const pages = store.get('pages') || [];
	const pageId = store.get('pageId');

	// tslint:disable-next-line:no-any
	const page = (pages as any[]).find(p => p.id === pageId);

	if (page) {
		const componentRequests = [...deriveComponents(page.root)];

		// tslint:disable-next-line:no-any
		const components = store.get('components') as any[];
		// tslint:disable-next-line:no-any
		const tasks = store.get('tasks') as any[];

		componentRequests
			.filter(component => !components.includes(component) && !tasks.includes(component))
			.forEach(component => {
				const el = document.createElement('script');
				el.src = `/scripts/${safePattern(component)}.js`;

				el.onload = () => {
					tasks.splice(tasks.indexOf(component), 1);
					components.push(component);
				};

				tasks.push(component);
				document.body.appendChild(el);
			});
	}
}

main();
