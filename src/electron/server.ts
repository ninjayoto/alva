import { EventEmitter } from 'events';
import * as express from 'express';
import * as Http from 'http';
import * as Path from 'path';
import { Store } from '../store/store';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import { OPEN, Server as WebsocketServer } from 'ws';

export interface ServerOptions {
	port: number;
}

const STATIC_PATH = Path.resolve(__dirname, 'static');
const PREVIEW_PATH = Path.join(__dirname, 'preview.js');

export async function createServer(opts: ServerOptions): Promise<EventEmitter> {
	const store = Store.getInstance();
	store.openFromPreferences();

	const emitter = new EventEmitter();
	const app = express();

	// tslint:disable-next-line:no-any
	const server = Http.createServer(app as any);
	const wss = new WebsocketServer({ server });

	let startMessage;

	// Prevent client errors (frequently caused by Chrome disconnecting on reload)
	// from bubbling up and making the server fail, ref: https://github.com/websockets/ws/issues/1256
	wss.on('connection', ws => {
		ws.on('error', err => {
			console.error(err);
		});

		if (startMessage) {
			ws.send(JSON.stringify(startMessage));
		}
	});

	// tslint:disable-next-line:no-any
	emitter.on('message', (message: any) => {
		if (message.type === 'project-start') {
			startMessage = message;
		}

		wss.clients.forEach(client => {
			if (client.readyState === OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	});

	const compiler = webpack({
		mode: 'development',
		entry: {
			preview: PREVIEW_PATH
		},
		output: {
			filename: '[name].js',
			path: '/'
		}
	});

	app.use('/', express.static(STATIC_PATH)).use(webpackDevMiddleware(compiler));

	await startServer({
		server,
		port: opts.port
	});

	return emitter;
}

interface ServerStartOptions {
	port: number;
	server: Http.Server;
}

// tslint:disable-next-line:promise-function-async
function startServer(options: ServerStartOptions): Promise<void> {
	return new Promise((resolve, reject) => {
		options.server.once('error', reject);
		options.server.listen(options.port, resolve);
	});
}
