import PropertyItem, { PropertyType } from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	padding-top: 32px;
	margin-bottom: 20px;
`;

export interface PropertyItemDemoState {
	propertyTypes: PropertyType[];
	selectedPropertyType: string;
}

export class BooleanItemDemo extends React.Component<{}, PropertyItemDemoState> {
	public constructor(props: {}) {
		super(props);

		const propertyTypes = [
			{ id: 'string', name: 'String' },
			{ id: 'boolean', name: 'Boolean' },
			{ id: 'object', name: 'Object' }
		];

		this.state = {
			propertyTypes,
			selectedPropertyType: propertyTypes[0].name
		};
	}

	public render(): JSX.Element {
		return (
			<div>
				<StyledDemo>
					<PropertyItem
						propertyName="Image Src"
						propertyTypes={this.state.propertyTypes}
						selectedPropertyType={this.state.selectedPropertyType}
					/>
				</StyledDemo>
			</div>
		);
	}
}

export default BooleanItemDemo;
