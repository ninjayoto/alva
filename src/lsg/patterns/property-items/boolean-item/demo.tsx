import BooleanItem from './index';
import PropertyItem from '../../property-item';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

export interface BooleanItemDemoState {
	checked?: boolean;
}

export class BooleanItemDemo extends React.Component<{}, BooleanItemDemoState> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			checked: false
		};

		this.handleChange = this.handleChange.bind(this);
	}

	private handleChange(e: React.SyntheticEvent<HTMLElement>): void {
		this.setState({
			checked: !this.state.checked
		});
	}

	public render(): JSX.Element {
		return (
			<div>
				<StyledDemo>
					<PropertyItem propertyName="Visibility" propertyTypes={[]} selectedPropertyType="">
						<BooleanItem checked={this.state.checked} handleChange={this.handleChange} />
					</PropertyItem>
				</StyledDemo>
				<StyledDemo>
					<PropertyItem propertyName="Spacing" propertyTypes={[]} selectedPropertyType="">
						<BooleanItem checked={!this.state.checked} handleChange={this.handleChange} />
					</PropertyItem>
				</StyledDemo>
			</div>
		);
	}
}

export default BooleanItemDemo;
