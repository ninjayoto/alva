import { App } from '../component/container/app';
import { ipcRenderer, webFrame } from 'electron';
import * as MobX from 'mobx';
// import { Page } from '../store/page/page';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store/store';

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

			store.setPort(message.payload);

			MobX.autorun(() => {
				const styleguide = store.getStyleguide();

				if (styleguide) {
					ipcRenderer.send('message', {
						type: 'styleguide-change',
						payload: {
							analyzerName: store.getAnalyzerName(),
							styleguidePath: styleguide.getPath(),
							patternsPath: styleguide.getPatternsPath()
						}
					});
				}
			});

			MobX.autorun(() => {
				const page = store.getCurrentPage();

				if (page) {
					ipcRenderer.send('message', {
						type: 'page-change',
						payload: page.toJsonObject({ forRendering: true })
					});
				}
			});

			MobX.autorun(() => {
				const selectedElement = store.getSelectedElement();
				ipcRenderer.send('message', {
					type: 'element-change',
					payload: selectedElement ? selectedElement.getId() : undefined
				});
			});

			try {
				ReactDom.render(
					React.createElement(App, { port: message.payload }),
					document.getElementById('app')
				);
			} catch (err) {
				console.error(err);
			}
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
