import React, { Component } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';
import {Link} from '../FunctionalComponents/Link';
import { connect } from 'react-redux';
import { loginAction } from '../../store/session';
import { notificationType } from '../../store/globals/codes';
import { navigate } from '../../store/session';
import * as nav from '../../store/globals/nav';

const mapStateToProps = state => {
	return {
		loading: state.loading
	}
}

const mapDispatchToProps = dispatch => {
	return {
		login: (email, password, cb) => dispatch(loginAction(email, password, cb)),
		navigate: (to) => dispatch(navigate(to))
	}
}

class Login extends Component {

	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.initLogin = this.initLogin.bind(this);
		this.notify = this.notify.bind(this);

		this.state = {
			// email: 'usman.shery@gmail.com',
			// password: 'cellcycle'
		}
	}

	onChange(property, val) {
		this.setState({
			[property]: val
		});
	}

	initLogin() {
		this.props.login(this.state.email, this.state.password, this.notify);
	}

	notify(response) {
		if(response.success){
			this.props.notify(notificationType.success, "Login successful");
		}else{
			this.props.notify(notificationType.error, response.message);
		}
	}

	render() {
		return (
			<div style={{ height: "100vh" }}>
				<div className="bg-dark col-12 container h-100">
					<div className="row align-items-center h-100">
						<div className="col-sm-10 col-md-8 col-lg-6 col-xl-4  mx-auto">
							<MDBContainer>
								<MDBRow>
									<MDBCol md="12">
										<p className="h3 text-white text-center mb-4">Sign in</p>
										<div className="grey-text">
											<MDBInput
												label="Email"
												icon="envelope"
												group type="email"
												validate error="wrong email address format"
												success="right"
												onChange={(e) => this.onChange('email', e.target.value)}
											/>
											<MDBInput
												label="Type your password"
												icon="lock"
												group type="password" validate
												onChange={(e) => this.onChange('password', e.target.value)}
											/>
										</div>
										<div className="text-right">
											<Link 
												classes="text-white"
												text="Reset Password"
												callback={() => this.props.navigate(nav.modules.passwordReset)}
											/>
										</div>
										<div className="text-center">
											<MDBBtn onClick={this.initLogin}>Login</MDBBtn>
										</div>
										<div className="text-center mt-3">
											<Link 
												classes="text-white"
												prepend="Don't have an account? "
												text="Register"
												callback={() => this.props.navigate(nav.modules.register)}
											/>
										</div>
									</MDBCol>
								</MDBRow>
							</MDBContainer>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);