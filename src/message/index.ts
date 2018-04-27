export enum MessageType {
	ContentResponse = 'content-response',
	SketchResponse = 'sketch-response',
	StartApp = 'start-app'
}

export interface Envelope<V, T> {
	id: string;
	payload: T;
	type: V;
}

export type Message = StartAppMessage | ContentResponse | SketchResponse;

export type StartAppMessage = Envelope<MessageType.StartApp, number>;
export type ContentResponse = Envelope<MessageType.ContentResponse, string>;
export type SketchResponse = Envelope<MessageType.SketchResponse, string>;
