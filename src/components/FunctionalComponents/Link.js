import React from "react";

export function Link(props) {
	const { classes, prepend, text, append, callback } = props;

	return <p className={classes}>
				{prepend}
					<strong style={{ cursor: "pointer" }} onClick={() => callback()}>
						{text}
					</strong>
				{append}
			</p>;
}