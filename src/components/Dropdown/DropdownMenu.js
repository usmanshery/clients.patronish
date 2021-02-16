import React from 'react';
import { ToggleLayer } from "react-laag";
import { AnimatePresence } from "framer-motion";
import Menu, { MenuItem } from "../Dropdown/Menu";

export default function DropdownMenu(props){
	
	let renderLayer = _props => {
		const menuItems = props.options.map((item) => {
			return <MenuItem onClick={() => { props.callback(item.action,props.id); _props.close();}} key={item.action}>{item.name()}</MenuItem>
		});
		return (
			<AnimatePresence>
				{_props.isOpen ? (
					<Menu
						ref={_props.layerProps.ref}
						style={_props.layerProps.style}
						arrowStyle={_props.arrowStyle}
						layerSide={_props.layerSide}
					>
						{menuItems}
					</Menu>
				) : null}
			</AnimatePresence>
		);
	}

	return (<ToggleLayer
		closeOnOutsideClick
		renderLayer={renderLayer}
		placement={{
			anchor: "LEFT_TOP",
			autoAdjust: true,
			snapToAnchor: false,
			triggerOffset: 12,
			scrollOffset: 16,
			preferX: "RIGHT"
		 }}>
			{props.trigger}
	</ToggleLayer>);
}