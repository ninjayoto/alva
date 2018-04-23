import { IconName, IconRegistry } from '../icons';
import Chrome from './index';
import * as React from 'react';

const DemoChrome: React.StatelessComponent<void> = () => (
	<div>
		<Chrome />
		<IconRegistry names={IconName} />
	</div>
);

export default DemoChrome;
