import React, { Component } from "react";
import { connect } from 'react-redux';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavItem, MDBLink, MDBIcon, MDBNavbarToggler, MDBCollapse, MDBContainer } from "mdbreact";
import { BrowserRouter as Router } from 'react-router-dom';
import { logoutAction, navigate } from '../../store/session';
import * as nav from '../../store/globals/nav';

const mapStateToProps = state => {
	return {
		username: state.userData.name,
		admin: state.userData.admin,
		activeModule: state.activeModule
	}
}

const mapDispatchToProps = dispatch => {
	return {
		logout: () => dispatch(logoutAction()),
		navigate: (to) => dispatch(navigate(to))
	}
}

class NavbarPage extends Component {
	state = {
		collapseID: ""
	}


	toggleCollapse = collapseID => () => this.setState(prevState => ({ collapseID: prevState.collapseID !== collapseID ? collapseID : "" }));

	render() {
		return (
			<Router>

			<MDBContainer>
				<MDBNavbar color="blue" dark expand="md" scrolling fixed="top">
					<MDBNavbarBrand>
						<strong className="white-text">Patronish</strong>
					</MDBNavbarBrand>
					<MDBNavbarToggler onClick={this.toggleCollapse("navbarCollapse")} />
					<MDBCollapse id="navbarCollapse" isOpen={this.state.collapseID} navbar>
						<MDBNavbarNav left>
							<MDBNavItem active={ this.props.activeModule === nav.modules.user } style={{display: this.props.admin ? "":"none"}}>
								<MDBLink to='' onClick={() => this.props.navigate(nav.modules.user)} link>
									Users
								</MDBLink>
							</MDBNavItem>
							<MDBNavItem active={ this.props.activeModule === nav.modules.video }>
								<MDBLink to='' onClick={() => this.props.navigate(nav.modules.video)} link>
									Videos
								</MDBLink>
							</MDBNavItem>
							<MDBNavItem active={ this.props.activeModule === nav.modules.campaign } style={{display: this.props.admin ? "none":""}}>
								<MDBLink to='' onClick={() => this.props.navigate(nav.modules.campaign)} link>
									Campaign
								</MDBLink>
							</MDBNavItem>
						</MDBNavbarNav>
						<MDBNavbarNav right>
							<MDBNavItem>
								<MDBLink to='' onClick={ this.props.logout } link>
									Logout
								</MDBLink>
							</MDBNavItem>
							<MDBNavItem>

								<MDBLink to='' active={false} onClick={() => {console.log('nav link click event')}} link>
									<MDBIcon far icon="user" />
									{ this.props.username }
								</MDBLink>
								
							</MDBNavItem>
						</MDBNavbarNav>
					</MDBCollapse>
				</MDBNavbar>
			</MDBContainer>

			</Router>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(NavbarPage);