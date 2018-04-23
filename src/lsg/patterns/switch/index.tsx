import { colors } from '../colors';
// import { fonts } from '../fonts';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface SwitchProps {
	leftVisible: boolean;
	onLeftClick: React.MouseEventHandler<HTMLElement>;
	onRightClick: React.MouseEventHandler<HTMLElement>;
	rightVisible: boolean;
	title: string;
}

interface StyledIconProps {
	onClick: React.MouseEventHandler<HTMLElement>;
	visible: boolean;
}

const StyledSwitch = styled.div`
	display: flex;
`;

const StyledTitle = styled.strong`
	position: relative;
	align-self: center;
	display: inline-block;
	width: 130px;
	margin: 0 ${getSpace(SpaceSize.XS)}px;
	overflow: hidden;
	color: ${colors.grey36.toString()};
	font-size: 15px;
	font-weight: normal;
	text-align: center;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const StyledIcons = styled(Icon)`
	padding: ${getSpace(SpaceSize.XS)}px;
	border-radius: ${getSpace(SpaceSize.XXS)}px;
	visibility: ${(props: StyledIconProps) => (props.visible ? 'visible' : 'hidden')};

	&:hover {
		background: ${colors.grey90.toString()};
	}
`;

const Switch: React.StatelessComponent<SwitchProps> = (props): JSX.Element => (
	<StyledSwitch>
		<StyledIcons
			color={colors.grey60}
			onClick={props.onLeftClick}
			size={IconSize.XS}
			name={IconName.ArrowFillLeft}
			visible={props.leftVisible !== false}
		/>
		<StyledTitle>{props.title}</StyledTitle>
		<StyledIcons
			color={colors.grey60}
			onClick={props.onRightClick}
			size={IconSize.XS}
			name={IconName.ArrowFill}
			visible={props.rightVisible !== false}
		/>
	</StyledSwitch>
);

export default Switch;
