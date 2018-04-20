import { App } from '../../component/container/app';
import { ipcRenderer, webFrame /*, WebviewTag*/ } from 'electron';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../../store/store';

// prevent app zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

ipcRenderer.send('message', { type: 'app-loaded' });

// tslint:disable-next-line:no-any
ipcRenderer.on('message', (e: Electron.Event, message: any) => {
	if (!message) {
		return;
	}
	switch (message.type) {
		case 'start-app': {
			const store = Store.getInstance();
			store.openFromPreferences();

			ReactDom.render(
				React.createElement(App, { port: message.payload }),
				document.getElementById('app')
			);
		}
	}
});

// Disable drag and drop from outside the application
document.addEventListener(
	'dragover',
	event => {
		event.preventDefault();
	},
	false
);
document.addEventListener(
	'drop',
	event => {
		event.preventDefault();
	},
	false
);
