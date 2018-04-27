import { EventEmitter } from 'events';
import * as express from 'express';
import * as Http from 'http';
import * as Path from 'path';
import { previewDocument } from './preview-document';
import * as QueryString from 'query-string';
import { safePattern } from './safe-pattern';
import { Store } from '../store/store';
import { Styleguide } from '../store/styleguide/styleguide';
import * as uuid from 'uuid';
import * as webpack from 'webpack';
import { OPEN, Server as WebsocketServer } from 'ws';

// memory-fs typings on @types are faulty
const MemoryFs = require('memory-fs');

export interface ServerOptions {
	port: number;
}

interface StyleguidePattern {
	[key: string]: string;
}

interface State {
	id: string;
	payload: {
		elementId?: string;
		// tslint:disable-next-line:no-any
		page?: any;
	};
	type: 'state';
}

// tslint:disable-next-line:no-any
type Queue = any[];

const PREVIEW_PATH = require.resolve('./preview');
const LOADER_PATH = require.resolve('./loader');

export async function createServer(opts: ServerOptions): Promise<EventEmitter> {
	const store = Store.getInstance();
	store.openFromPreferences();

	const emitter = new EventEmitter();
	const app = express();

	const server = Http.createServer(app);
	const wss = new WebsocketServer({ server });

	const state: State = {
		id: uuid.v4(),
		type: 'state',
		payload: {}
	};

	// tslint:disable-next-line:no-any
	const compilation: any = {
		path: '',
		queue: []
	};

	// Prevent client errors (frequently caused by Chrome disconnecting on reload)
	// from bubbling up and making the server fail, ref: https://github.com/websockets/ws/issues/1256
	wss.on('connection', ws => {
		ws.on('error', err => {
			console.error(err);
		});

		ws.on('message', message => emitter.emit('client-message', message));
		ws.send(JSON.stringify(state));
	});

	app.get('/preview.html', (req, res) => {
		res.type('html');
		res.send(previewDocument);
	});

	app.use('/scripts', (req, res, next) => {
		const [current] = compilation.queue;

		if (!current) {
			next();
			return;
		}

		// tslint:disable-next-line:no-any
		const onReady = (fs: any): void => {
			try {
				res.type('js');
				res.send(fs.readFileSync(req.url));
			} catch (err) {
				if (err.code === 'ENOENT') {
					res.sendStatus(404);
					return;
				}
				res.sendStatus(500);
			}
		};

		if (current.type === 'start') {
			compilation.compiler.hooks.done.tap('alva', stats => {
				if (stats.hasErrors()) {
					res.status(500).send(stats.toJson('errors-only'));
					return;
				}
				onReady(compilation.compiler.outputFileSystem);
				return;
			});
			return;
		}

		onReady(compilation.compiler.outputFileSystem);
		return;
	});

	const send = (message: string): void => {
		wss.clients.forEach(client => {
			if (client.readyState === OPEN) {
				client.send(message);
			}
		});
	};

	// tslint:disable-next-line:no-any
	emitter.on('message', async (message: any) => {
		switch (message.type) {
			case 'styleguide-change': {
				const { payload } = message;
				if (compilation.path !== payload.styleguidePath) {
					if (compilation.compiler) {
						compilation.compiler.close();
					}

					send(
						JSON.stringify({
							type: 'reload',
							id: uuid.v4(),
							payload: {}
						})
					);

					state.id = uuid.v4();
					state.payload = {};
					const next = await setup({
						analyzerName: payload.analyzerName,
						styleguidePath: payload.styleguidePath,
						patternsPath: payload.patternsPath
					});
					compilation.path = payload.styleguidePath;
					compilation.compiler = next.compiler;
					compilation.queue = next.queue;

					next.compiler.hooks.watchRun.tap('alva', () => {
						send(
							JSON.stringify({
								type: 'reload',
								id: uuid.v4(),
								payload: {}
							})
						);
					});
				}
				break;
			}
			case 'page-change': {
				state.payload.page = message.payload;
				send(JSON.stringify(state));
				break;
			}
			case 'element-change': {
				state.payload.elementId = message.payload;
				send(JSON.stringify(message));
				break;
			}
			case 'bundle-change':
				send(
					JSON.stringify({
						type: 'reload',
						id: uuid.v4(),
						payload: {}
					})
				);
				break;
			case 'app-loaded':
				break;
			case 'sketch-request':
			case 'content-request':
				send(JSON.stringify(message));
				break;
			default: {
				console.warn(`Unknown message type: ${message.type}`);
			}
		}
	});

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

// tslint:disable-next-line:no-any
async function setup(update: any): Promise<any> {
	const queue: Queue = [];
	const init: StyleguidePattern = {};

	const styleguide = new Styleguide(
		update.styleguidePath,
		update.patternsPath,
		update.analyzerName
	);

	const context = styleguide.getPath();

	const components = styleguide.getPatterns().reduce((acc, pattern) => {
		const patternPath = pattern.getImplementationPath();

		if (!patternPath) {
			return acc;
		}

		acc[safePattern(pattern.getId())] = `./${Path.relative(context, patternPath)
			.split(Path.sep)
			.join('/')}`;
		return acc;
	}, init);

	const compiler = webpack({
		mode: 'development',
		context,
		entry: {
			preview: PREVIEW_PATH,
			components: `${LOADER_PATH}?${QueryString.stringify({
				cwd: context,
				components: JSON.stringify(components)
			})}!`
		},
		output: {
			filename: '[name].js',
			library: '[name]',
			libraryTarget: 'global',
			path: '/'
		},
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						chunks: 'initial',
						name: 'vendor',
						test: /node_modules/,
						priority: 10,
						enforce: true
					}
				}
			}
		}
		// tslint:disable-next-line:no-any
	} as any);

	compiler.outputFileSystem = new MemoryFs();

	compiler.hooks.compile.tap('alva', () => {
		queue.unshift({ type: 'start' });
	});

	compiler.hooks.done.tap('alva', stats => {
		if (stats.hasErrors()) {
			queue.unshift({ type: 'error', payload: stats.toJson('errors-only') });
		}
		queue.unshift({ type: 'done' });
	});

	// tslint:disable-next-line:no-empty
	compiler.watch({}, (err, stats) => {});

	return {
		compiler,
		queue
	};
}
