import { HighlightArea } from './highlight-area';
import { omit } from 'lodash';
import * as MobX from 'mobx';
import * as MobXReact from 'mobx-react';
import { PreviewStore } from './preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
MobX.extras.shareGlobalState();

export interface RenderInit {
	highlight: HighlightArea;
	store: PreviewStore;
	// tslint:disable-next-line:no-any
	getComponent(props: any): any;
}

export interface InjectedPreviewHighlightProps {
	highlight: HighlightArea;
}

export interface InjectedPreviewApplicationProps {
	highlight: HighlightArea;
	store: PreviewStore;
}

interface InjectedPreviewComponentProps extends PreviewComponentProps {
	highlight: HighlightArea;
	store: PreviewStore;
}

export interface PreviewComponentProps {
	contents: {
		[slot: string]: PreviewComponentProps[];
	};
	name: string;
	pattern: string;
	// tslint:disable-next-line:no-any
	properties: { [key: string]: any };
	uuid: string;
}

export function render(init: RenderInit): void {
	@MobXReact.inject('store', 'highlight')
	@MobXReact.observer
	class PreviewApplication extends React.Component {
		public render(): JSX.Element | null {
			const props = this.props as InjectedPreviewApplicationProps;
			const page = props.store.page;

			if (!page) {
				return null;
			}

			const component = page.root;

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

	@MobXReact.inject('store', 'highlight')
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

			const Component = init.getComponent(props);

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

	@MobXReact.inject('store', 'highlight')
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

	ReactDom.render(
		<MobXReact.Provider store={init.store} highlight={init.highlight}>
			<PreviewApplication />
		</MobXReact.Provider>,
		document.getElementById('preview')
	);
}
