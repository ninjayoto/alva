import { ipcRenderer } from 'electron';
import { Exporter, ExportResult } from './exporter';
import { Page } from '../store/page/page';
import { Store } from '../store/store';
import * as uuid from 'uuid';

export class SketchExporter extends Exporter {
	public async createExport(): Promise<ExportResult> {
		return new Promise<ExportResult>((resolve, reject) => {
			const id = uuid.v4();
			const page = Store.getInstance().getCurrentPage() as Page;
			const artboardName = page.getName();
			const pageName = page.getName();

			// (1) request asketch.json from preview
			const start = () => {
				ipcRenderer.send('message', {
					type: 'sketch-request',
					id,
					payload: {
						artboardName,
						pageName
					}
				});
			};

			// tslint:disable-next-line:no-any
			const receive = (_, message: any) => {
				if (message.type !== 'sketch-response' || message.id !== id) {
					return;
				}

				this.contents = Buffer.from(JSON.stringify(message.payload.page, null, '\t'));
				resolve({ result: this.contents });
				return;
			};

			ipcRenderer.on('message', receive);
			start();
		});
	}
}
