import React, { Component } from "react";
import { connect } from "react-redux";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Navbar/Sidebar";
import User from "../User/User";
import Campaign from "../Campaign/Campaign";
import Video from "../Videos/Video";
import * as nav from "../../store/globals/nav";

const mapStateToProps = (state) => {
	return {
		activeModule: state.activeModule,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {};
};

class Admin extends Component {
	render() {
		return (
			<>
				<Navbar />
				<Sidebar />
				<div style={{ marginLeft: "270px", marginTop: "64px", padding: "10px" }}>
					{this.props.activeModule === nav.modules.user ? <User /> : ""}
					{this.props.activeModule === nav.modules.campaign ? <Campaign /> : ""}
					{this.props.activeModule === nav.modules.video ? <Video /> : ""}
				</div>
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
