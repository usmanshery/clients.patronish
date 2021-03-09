import React, { Component } from "react";
import { connect } from "react-redux";
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBIcon, MDBNavbarToggler, MDBCollapse, MDBContainer } from "mdbreact";
import { logoutAction, navigate } from "../../store/session";
import * as nav from "../../store/globals/nav";
import "./Styles.css";
import Button from "@material-ui/core/Button";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import Typography from "@material-ui/core/Typography";
// import IconButton from "@material-ui/core/IconButton";
// import MenuIcon from "@material-ui/icons/Menu";

const mapStateToProps = (state) => {
	return {
		username: state.userData.name,
		admin: state.userData.admin,
		activeModule: state.activeModule,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		logout: () => dispatch(logoutAction()),
		navigate: (to) => dispatch(navigate(to)),
	};
};

class NavbarPage extends Component {
	state = {
		collapseID: "",
		newbar: true,
	};

	toggleCollapse = (collapseID) => () => this.setState((prevState) => ({ collapseID: prevState.collapseID !== collapseID ? collapseID : "" }));

	render() {
		return (
			<MDBContainer>
				<MDBNavbar color="blue" dark expand="md" scrolling fixed="top">
					<MDBNavbarBrand>
						<strong className="white-text">Patronish</strong>
					</MDBNavbarBrand>
					<MDBNavbarToggler onClick={this.toggleCollapse("navbarCollapse")} />
					<MDBCollapse id="navbarCollapse" isOpen={this.state.collapseID} navbar>
						<MDBNavbarNav left>
							<MDBNavItem active={this.props.activeModule === nav.modules.user} style={{ display: this.props.admin ? "" : "none" }}>
								<Button className="navbarModuleButtons softBorder" onClick={() => this.props.navigate(nav.modules.user)}>
									<p>Users</p>
								</Button>
							</MDBNavItem>
							<MDBNavItem active={this.props.activeModule === nav.modules.video}>
								<Button className="navbarModuleButtons softBorder" onClick={() => this.props.navigate(nav.modules.video)}>
									<p>Videos</p>
								</Button>
							</MDBNavItem>
							<MDBNavItem active={this.props.activeModule === nav.modules.campaign} style={{ display: this.props.admin ? "none" : "" }}>
								<Button className="navbarModuleButtons softBorder" onClick={() => this.props.navigate(nav.modules.campaign)}>
									<p>Campaign</p>
								</Button>
							</MDBNavItem>
						</MDBNavbarNav>
						<MDBNavbarNav right>
							<MDBNavItem>
								<Button className="navbarModuleButtons" onClick={this.props.logout}>
									<p>Logout</p>
								</Button>
							</MDBNavItem>
							<MDBNavItem>
								<Button className="navbarModuleButtons" onClick={() => this.props.navigate(nav.modules.campaign)}>
									<MDBIcon style={{ color: "white", paddingRight: "7px" }} far icon="user" />
									<p>{this.props.username}</p>
								</Button>
							</MDBNavItem>
						</MDBNavbarNav>
					</MDBCollapse>
				</MDBNavbar>
			</MDBContainer>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarPage);
