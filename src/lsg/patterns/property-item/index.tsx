import { colors } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface PropertyType {
	id: string;
	name: string;
}

export interface PropertyItemProps {
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLSelectElement>;
	propertyName: string;
	propertyTypes: PropertyType[];
	selectedPropertyType: string;
}

const StyledPropertyItem = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	margin-bottom: ${getSpace(Size.XS)}px;
	color: ${colors.grey36.toString()};
	flex-wrap: wrap;
`;

const StyledSelect = styled.select`
	appearance: none;
	border: none;
	border-radius: 0;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
	border-bottom: 1px solid transparent;
	transition: all 0.2s;

	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}

	&:focus {
		outline: none;
		border-color: ${colors.blue40.toString()};
		color: ${colors.black.toString()};
	}
`;

const StyledLabel = styled.span`
	display: block;
`;

export const PropertyItem: React.StatelessComponent<PropertyItemProps> = props => {
	const { className, propertyName, propertyTypes, selectedPropertyType, handleChange } = props;

	return (
		<StyledPropertyItem className={className}>
			<StyledLabel>{propertyName}</StyledLabel>
			<StyledSelect
				className={className}
				onChange={handleChange}
				value={selectedPropertyType ? selectedPropertyType : ''}
			>
				{propertyTypes.map(propertyType => (
					<option key={propertyType.id} value={propertyType.id}>
						{propertyType.name}
					</option>
				))};
			</StyledSelect>
		</StyledPropertyItem>
	);
};

export default PropertyItem;
