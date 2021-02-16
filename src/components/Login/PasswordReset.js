import React, { Component } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';
import { connect } from 'react-redux';
import { existingUserAction, otpAction, passwordResetAction } from '../../store/session';
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
		checkUserExists: (email, cb) => dispatch(existingUserAction(email, cb)),
		generateOTP: (email, cb) => dispatch(otpAction(email, cb)),
		passwordReset: (email, otp, password, cb) => dispatch(passwordResetAction(email, otp, password, cb)),
		navigate: (to) => dispatch(navigate(to))
	}
}

class PasswordReset extends Component {

	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);

		this.generateOTP = this.generateOTP.bind(this);
		this.generateOTPResponse = this.generateOTPResponse.bind(this);

		this.initPasswordReset = this.initPasswordReset.bind(this);
		this.passwordResetResponse = this.passwordResetResponse.bind(this);

		this.notify = this.notify.bind(this);

		this.state = {
			emailInputDisabled: false
		}
	}

	onChange(property, val) {
		const el = document.getElementById(`${property}_err_msg`);
		if(el)
			el.style.display = "none";

		this.setState({
			[property]: val
		});
	}
	
	generateOTP(response) {
		console.log("At generateOTP response: " , response);
		if(response){
			// send otp request
			if(response.success){
				this.props.generateOTP(this.state.email, this.generateOTPResponse);
			}else{
				// email not found
				this.setState({
					emailInputDisabled: false
				});
				document.getElementById('email_err_msg').style.display = "block";
			}
			return;
		}
		// check email validation
		this.setState({
			emailInputDisabled: true
		});
		this.props.checkUserExists(this.state.email, this.generateOTP);
	}

	generateOTPResponse(response) {
		console.log("At generateOTPResponse response: " , response);
		// act based on response
		if(!response.success){
			this.notify(response);
			return;
		}
		else{
			document.getElementById('email_info_msg').style.display = "block";
			this.notify({success: true, message: "OTP generation success"});
			return;
		}
	}

	initPasswordReset() {
		// extract user input values
		const { email, otp, password, password_re } = this.state;

		if(password !== password_re){
			document.getElementById('password_re_err_msg').style.display = "block";
			return;
		}
		if(!otp){
			document.getElementById('otp_err_msg').style.display = "block";
			return;
		}

		this.props.passwordReset(email, otp, password, this.passwordResetResponse);
	}

	passwordResetResponse(response) {
		if(response.success){
			this.props.navigate(nav.modules.login);
		}
		this.notify(response);
	}

	notify(response) {
		console.log("At notify response: " , response);
		if (response.success) {
			if(response.message){
				this.props.notify(notificationType.success, response.message);
			}else{
				this.props.notify(notificationType.success, "Password Reset Successful");
			}
		} else {
			if(response.message){
				this.props.notify(notificationType.error, response.message);
			}
			if(response.err){
				this.props.notify(notificationType.error, response.err);
			}
		}
	}

	render() {
		return (
			<>
				<div style={{ height: "100vh" }}>
					<div className="bg-dark col-12 container h-100">
						<div className="row align-items-center h-100">
							<div className="col-sm-10 col-md-8 col-lg-6 col-xl-4 grey-text mx-auto">
								<MDBContainer>
									<MDBRow>
										<MDBCol>
											<p className="h3 text-white text-center mb-4">Reset Password</p>
										</MDBCol>
									</MDBRow>
									<MDBRow>
										<MDBCol md="12">
											<MDBInput
												label="Email"
												icon="envelope"
												group type="email"
												validate error="wrong email address format"
												value={this.state.email}
												disabled={this.state.emailInputDisabled}
												onChange={(e) => this.onChange('email', e.target.value)}
											/>
											<div id="email_err_msg" className="invalid-feedback">Email not found</div>
											<div id="email_info_msg" className="valid-feedback">OTP has been sent to your email, it is valid for next 10 minutes</div>
										</MDBCol>
									</MDBRow>
									<MDBRow>
										<MDBCol>
											<div className="text-center">
												<MDBBtn onClick={() => this.generateOTP()}>Send OTP Email</MDBBtn>
											</div>
										</MDBCol>
									</MDBRow>

									<MDBRow>
										<MDBCol>
											<MDBInput
												label="Enter OTP (received by email)"
												icon="lock"
												group
												onChange={(e) => this.onChange('otp', e.target.value)}
											/>
											<div id="otp_err_msg" className="invalid-feedback">Required</div>
										</MDBCol>
									</MDBRow>

									<MDBRow>
										<MDBCol>
											<MDBInput
												label="Type new password"
												icon="lock"
												group type="password"
												onChange={(e) => this.onChange('password', e.target.value)}
											/>
										</MDBCol>
									</MDBRow>
									<MDBRow>
										<MDBCol>
											<MDBInput
												label="Re-type new password"
												icon="lock"
												group type="password"
												onChange={(e) => this.onChange('password_re', e.target.value)}
											/>
											<div id="password_re_err_msg" className="invalid-feedback">Passwords do not match</div>
										</MDBCol>
									</MDBRow>

									<MDBRow>
										<MDBCol>
											<div className="text-center">
												<MDBBtn onClick={this.initPasswordReset}>Reset Password</MDBBtn>
											</div>
										</MDBCol>
									</MDBRow>
								</MDBContainer>
							</div>
						</div>
					</div>
				</div>
				<MDBBtn outline color="success" style={{ position: "absolute", top: "0%", right: "0%" }} onClick={() => this.props.navigate(nav.modules.login)}>Login</MDBBtn>
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordReset);