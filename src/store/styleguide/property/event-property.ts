import { Property } from './property';

/**
 * An event property is a property that takes a handler function for a UI event.
 * The first parameter of these functions must be the DOM event (e.g. click, change).
 * @see Property
 */
export class EventProperty extends Property {
	/**
	 * Creates a new boolean property.
	 * @param id The technical ID of this property (e.g. the property name
	 * in the TypeScript props interface).
	 */
	public constructor(id: string) {
		super(id);
	}

	/**
	 * @inheritdoc
	 */
	// tslint:disable-next-line:no-any
	public coerceValue(value: any): any {
		if (typeof value === 'function') {
			return value;
		} else {
			return undefined;
		}
	}

	/**
	 * @inheritdoc
	 */
	public getType(): string {
		return 'event';
	}

	/**
	 * @inheritdoc
	 */
	public toString(): string {
		return `EventProperty(${super.toString()})`;
	}
}
