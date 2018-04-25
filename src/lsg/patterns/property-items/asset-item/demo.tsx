import AssetItem from './index';
import PropertyItem from '../../property-item';
import * as React from 'react';
import styled from 'styled-components';

const NOOP = () => {}; // tslint:disable-line no-empty

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

const AssetItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<StyledDemo>
			<PropertyItem propertyName="Empty" propertyTypes={[]} selectedPropertyType="">
				<AssetItem />
			</PropertyItem>
		</StyledDemo>
		<StyledDemo>
			<PropertyItem propertyName="Internal" propertyTypes={[]} selectedPropertyType="">
				<AssetItem
					handleChooseClick={NOOP}
					handleClearClick={NOOP}
					handleInputChange={NOOP}
					imageSrc="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
				/>
			</PropertyItem>
		</StyledDemo>
		<StyledDemo>
			<PropertyItem propertyName="External" propertyTypes={[]} selectedPropertyType="">
				<AssetItem
					handleChooseClick={NOOP}
					handleClearClick={NOOP}
					handleInputChange={NOOP}
					inputValue="http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/light-bulb-icon.png"
				/>
			</PropertyItem>
		</StyledDemo>
	</div>
);

export default AssetItemDemo;
