import { App } from '../../component/container/app';
import { ipcRenderer, webFrame /*, WebviewTag*/ } from 'electron';
import { Persister } from '../../store/json';
import * as MobX from 'mobx';
import { Page } from '../../store/page/page';
import * as PathUtils from 'path';
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

			{
				const project = store.getCurrentProject();
				const pagesPath = store.getPagesPath();

				const pages =
					typeof project === 'undefined'
						? []
						: project
								.getPages()
								.map(pageRef => {
									const persistedPath = pageRef.getLastPersistedPath();

									if (!persistedPath) {
										return;
									}

									const pagePath: string = PathUtils.join(pagesPath, persistedPath);
									// tslint:disable-next-line:no-any
									const data: any = Persister.loadYamlOrJson(pagePath);
									const pageData = Page.fromJsonObject(data, pageRef.id).toJsonObject();
									pageData.id = pageRef.id;

									return pageData;
								})
								.filter(Boolean);

				const page = store.getCurrentPage();
				const selectedElement = store.getSelectedElement();

				ipcRenderer.send('message', {
					type: 'project-start',
					payload: {
						projectId: project ? project.getId() : undefined,
						pageId: page ? page.getId() : undefined,
						pages,
						selectedElementId: selectedElement ? selectedElement.getId() : undefined
					}
				});
			}

			MobX.autorun(() => {
				const page: Page | undefined = store.getCurrentPage();
				ipcRenderer.send('message', {
					type: 'page-change',
					payload: page ? page.getId() : undefined
				});
			});

			MobX.autorun(() => {
				const selectedElement = store.getSelectedElement();
				ipcRenderer.send('message', {
					type: 'element-change',
					payload: selectedElement ? selectedElement.getId() : undefined
				});
			});

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
