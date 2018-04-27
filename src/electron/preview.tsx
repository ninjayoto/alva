import * as HtmlSketchApp from '@brainly/html-sketchapp';
import { HighlightArea } from './highlight-area';
import { camelCase, omit, upperFirst } from 'lodash';
import * as MobX from 'mobx';
import * as MobXReact from 'mobx-react';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { safePattern } from './safe-pattern';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';

interface PageElement {
	contents: {
		[propName: string]: PageElement[];
	};
	name: string;
	pattern: string;
	properties: {
		// tslint:disable-next-line:no-any
		[propName: string]: any;
	};
	uuid: string;
}

interface Page {
	id: string;
	root: PageElement;
}

class PreviewStore {
	@MobX.observable public elementId: string = '';
	@MobX.observable public page: Page | null = null;
}

function main(): void {
	SmoothscrollPolyfill.polyfill();

	const store = new PreviewStore();
	const highlight = new HighlightArea();

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
		const { type, id, payload } = message;

		// TODO: Do type refinements on message here
		switch (type) {
			case 'reload':
				window.location.reload();
				break;
			case 'state':
				store.page = payload.page;
				break;
			case 'element-change': {
				store.elementId = payload;
				break;
			}
			case 'content-request': {
				const rec = document.documentElement.getBoundingClientRect();

				connection.send(
					JSON.stringify({
						type: 'content-response',
						id,
						payload: {
							document: new XMLSerializer().serializeToString(document),
							location: window.location.href,
							height: rec.height,
							width: rec.width
						}
					})
				);

				break;
			}
			case 'sketch-request': {
				const sketchPage = HtmlSketchApp.nodeTreeToSketchPage(document.documentElement, {
					pageName: payload.pageName,
					addArtboard: true,
					artboardName: payload.artboardName,
					getGroupName: node =>
						node.getAttribute('data-sketch-name') || `(${node.nodeName.toLowerCase()})`,
					getRectangleName: () => 'background',
					skipSystemFonts: true
				});

				const page = sketchPage.toJSON();

				connection.send(
					JSON.stringify({
						type: 'sketch-response',
						id,
						payload: { page }
					})
				);
			}
		}
	});

	ReactDom.render(
		<MobXReact.Provider store={store} highlight={highlight}>
			<PreviewApplication />
		</MobXReact.Provider>,
		document.getElementById('preview')
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
	highlight: HighlightArea;
	store: PreviewStore;
}

@MobXReact.inject('store', 'highlight')
@MobXReact.observer
class PreviewApplication extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewApplicationProps;

		if (!props.store.page) {
			return null;
		}

		const component = props.store.page.root;

		return (
			<React.Fragment>
				<PreviewComponent
					contents={component.contents}
					pattern={component.pattern}
					properties={component.properties}
					name={component.name}
					uuid={component.uuid}
				/>
				<PreviewHighlight />
			</React.Fragment>
		);
	}
}

interface PreviewComponentProps {
	contents: {
		[slot: string]: PreviewComponentProps[];
	};
	name: string;
	pattern: string;
	// tslint:disable-next-line:no-any
	properties: { [key: string]: any };
	uuid: string;
}

interface InjectedPreviewComponentProps extends PreviewComponentProps {
	highlight: HighlightArea;
	store: PreviewStore;
}

@MobXReact.inject('highlight', 'store')
@MobXReact.observer
class PreviewComponent extends React.Component<PreviewComponentProps> {
	public componentWillUpdate(): void {
		const props = this.props as InjectedPreviewComponentProps;

		if (props.uuid === props.store.elementId) {
			const node = ReactDom.findDOMNode(this);
			if (node) {
				props.highlight.show(node as Element, props.uuid);
				setTimeout(() => {
					props.store.elementId = '';
				}, 500);
			}
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewComponentProps;
		const contents = props.contents || {};
		const children = typeof contents.default === 'undefined' ? [] : contents.default;
		const slots = omit(contents, ['default']);

		// Access elementId in render method to trigger MobX subscription
		// tslint:disable-next-line:no-unused-expression
		props.store.elementId;

		const Component = getComponent(props);

		if (!Component) {
			return null;
		}

		return (
			<Component {...slots} {...props.properties} data-sketch-name={props.name}>
				{children.map(child => <PreviewComponent key={child.uuid} {...child} />)}
			</Component>
		);
	}
}

interface InjectedPreviewHighlightProps {
	highlight: HighlightArea;
}

@MobXReact.inject('highlight')
@MobXReact.observer
class PreviewHighlight extends React.Component {
	public render(): JSX.Element {
		const props = this.props as InjectedPreviewHighlightProps;
		const { highlight } = props;
		const p = highlight.getProps();

		return (
			<div
				style={{
					position: 'absolute',
					boxSizing: 'border-box',
					border: '1px dashed rgba(55, 55, 55, .5)',
					background: `
					repeating-linear-gradient(
						135deg,
						transparent,
						transparent 2.5px,rgba(51, 141, 222, .5) 2.5px,
						rgba(51,141,222, .5) 5px),
						rgba(102,169,230, .5)`,
					transition: 'all .25s ease-in-out',
					bottom: p.bottom,
					height: p.height,
					left: p.left,
					opacity: p.opacity,
					right: p.right,
					top: p.top,
					width: p.width
				}}
			/>
		);
	}
}

interface PassedComponentProps {
	// tslint:disable-next-line:no-any
	[propName: string]: any;
}

interface InputComponentProps extends PassedComponentProps {
	name: string;
	pattern: string;
}

function getComponent(props: InputComponentProps): string | React.SFC<PassedComponentProps> | null {
	// tslint:disable-next-line:no-any
	const component = props.pattern ? (window as any).components[safePattern(props.pattern)] : null;

	if (!component) {
		return null;
	}

	const Component = typeof component.default === 'function' ? component.default : component;
	Component.displayName = upperFirst(camelCase(props.name));

	return Component;
}

main();
