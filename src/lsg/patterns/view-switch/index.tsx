import { colors } from '../colors';
import { Size } from '../copy';
import { Icon, IconName, IconProps, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface ViewSwitchProps {
	fontSize?: Size;
	justify?: 'start' | 'center' | 'end' | 'stretch';
	leftVisible: boolean;
	onLeftClick: React.MouseEventHandler<SVGElement>;
	onRightClick: React.MouseEventHandler<SVGElement>;
	rightVisible: boolean;
	title: string;
}

interface StyledIconProps extends IconProps {
	visible: boolean;
}

interface StyledViewSwitchProps {
	fontSize?: Size;
	justify?: 'start' | 'center' | 'end' | 'stretch';
}

const StyledViewSwitch = styled.div`
	display: inline-flex;
	align-self: center;
	justify-self: ${(props: StyledViewSwitchProps) => props.justify || 'start'};
	font-size: ${(props: StyledViewSwitchProps) =>
		props.fontSize ? `${props.fontSize}px` : `${Size.S}px`};
`;

const StyledTitle = styled.strong`
	position: relative;
	align-self: center;
	display: inline-block;
	width: 130px;
	margin: 0 ${getSpace(SpaceSize.XS)}px;
	overflow: hidden;
	color: ${colors.grey36.toString()};
	font-size: inherit;
	font-weight: normal;
	text-align: center;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const StyledIcons = styled(Icon)`
	padding: ${getSpace(SpaceSize.XS)}px;
	border-radius: ${getSpace(SpaceSize.XXS)}px;
	visibility: ${(props: StyledIconProps) => (props.visible ? 'visible' : 'hidden')};
	cursor: pointer;
	pointer-events: auto;

	&:hover {
		background: ${colors.grey90.toString()};
	}
`;

export const ViewSwitch: React.StatelessComponent<ViewSwitchProps> = (props): JSX.Element => (
	<StyledViewSwitch justify={props.justify} fontSize={props.fontSize}>
		<StyledIcons
			color={colors.grey60}
			handleClick={props.onLeftClick}
			size={IconSize.XS}
			name={IconName.ArrowFillLeft}
			visible={props.leftVisible}
		/>
		<StyledTitle>{props.title}</StyledTitle>
		<StyledIcons
			color={colors.grey60}
			handleClick={props.onRightClick}
			size={IconSize.XS}
			name={IconName.ArrowFill}
			visible={props.rightVisible}
		/>
	</StyledViewSwitch>
);
