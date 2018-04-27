import { camelCase, upperFirst } from 'lodash';
import { safePattern } from './safe-pattern';

export interface PassedComponentProps {
	// tslint:disable-next-line:no-any
	[propName: string]: any;
}

export interface InputComponentProps extends PassedComponentProps {
	name: string;
	pattern: string;
}

export interface SyntheticComponents<T> {
	// tslint:disable-next-line:no-any
	asset: T;
	// tslint:disable-next-line:no-any
	text: T;
}

export type ComponentGetter<T> = (
	props: InputComponentProps,
	synthetics: SyntheticComponents<T>
) => T | null;

export function getComponent<T>(
	props: InputComponentProps,
	synthetics: SyntheticComponents<T>
): T | null {
	const fragments = props.pattern ? props.pattern.split(':') : [];

	if (fragments[0] === 'synthetic') {
		const syntheticType = fragments[1];
		console.log(syntheticType);
		return synthetics[syntheticType];
	}

	// tslint:disable-next-line:no-any
	const component = props.pattern ? (window as any).components[safePattern(props.pattern)] : null;

	if (!component) {
		return null;
	}

	const Component = typeof component.default === 'function' ? component.default : component;
	Component.displayName = upperFirst(camelCase(props.name));

	return Component;
}
