import StringItem from './index';
import PropertyItem from '../../property-item';
import * as React from 'react';
import styled from 'styled-components';

const NOOP = () => {}; // tslint:disable-line no-empty

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

const StringItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<StyledDemo>
			<PropertyItem propertyName="Text" propertyTypes={[]} selectedPropertyType="">
				<StringItem handleChange={NOOP} />
			</PropertyItem>
		</StyledDemo>
		<StyledDemo>
			<PropertyItem propertyName="Text" propertyTypes={[]} selectedPropertyType="">
				<StringItem
					handleChange={NOOP}
					value="this is a very long example text to test text overflow and stuff"
				/>
			</PropertyItem>
		</StyledDemo>
	</div>
);

export default StringItemDemo;
