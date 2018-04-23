import { IconName, IconRegistry } from '../icons';
import Switch from './index';
import * as React from 'react';

const DemoSwitch: React.StatelessComponent<{}> = (): JSX.Element => (
	<div>
		<Switch
			onLeftClick={() => null}
			onRightClick={() => null}
			leftVisible={true}
			rightVisible={true}
			title="Page Name"
		/>
		<IconRegistry names={IconName} />
	</div>
);

export default DemoSwitch;
