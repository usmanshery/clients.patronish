import React, { Component } from "react";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from 'mdbreact';
import { connect } from 'react-redux';
import { registerAction, existingUserAction, navigate } from '../../store/session';
import { notificationType } from '../../store/globals/codes';
import * as nav from '../../store/globals/nav';
import * as filter from '../../store/globals/filter';
import countries from '../../store/globals/countries';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import './Style.css';

const mapStateToProps = state => {
	return {
		loading: state.loading
	}
}

const mapDispatchToProps = dispatch => {
	return {
		checkUserExists: (email, cb) => dispatch(existingUserAction(email, cb)),
		addUser: (user, cb) => dispatch(registerAction(user, cb)),
		navigate: (to) => dispatch(navigate(to))
	}
}

class Register extends Component {

	constructor(props) {
		super(props);

		this.onChange = this.onChange.bind(this);
		this.initRegister = this.initRegister.bind(this);
		this.checkUserExistsResponse = this.checkUserExistsResponse.bind(this);
		this.resetForm = this.resetForm.bind(this);
		this.notify = this.notify.bind(this);

		this.state = {
			companyName: undefined
		}
	}

	onChange(property, val) {
		this.setState({
			[property]: val
		});

		const element = document.getElementById(`${property}_err_msg`);
		if (element) {
			element.style.display = "none";
			if (property === 'contactPersonEmail')
				document.getElementById('contactPersonEmailExists_err_msg').style.display = "none";
		}
	}

	initRegister() {
		if (!this.state.companyName) {
			document.getElementById('companyName_err_msg').style.display = "block";
			return;
		}
		if (!this.state.location) {
			document.getElementById('location_err_msg').style.display = "block";
			return;
		}
		if (!this.state.postCode) {
			document.getElementById('postCode_err_msg').style.display = "block";
			return;
		}
		if (!this.state.country) {
			document.getElementById('country_err_msg').style.display = "block";
			return;
		}
		if (!this.state.contactPersonName) {
			document.getElementById('contactPersonName_err_msg').style.display = "block";
			return;
		}
		if (!this.state.contactPersonEmail) {
			document.getElementById('contactPersonEmail_err_msg').style.display = "block";
			return;
		}
		if (!filter.validateEmail(this.state.contactPersonEmail)) {
			document.getElementById('contactPersonEmail_err_msg').style.display = "block";
			return;
		}
		if (!this.state.contactPersonRole) {
			document.getElementById('contactPersonRole_err_msg').style.display = "block";
			return;
		}
		if (!this.state.contactPersonNumber) {
			document.getElementById('contactPersonNumber_err_msg').style.display = "block";
			return;
		}
		if (!this.state.password) {
			document.getElementById('password_err_msg').style.display = "block";
			return;
		}
		if (this.state.password !== this.state.password_re) {
			document.getElementById('password_re_err_msg').style.display = "block";
			return;
		}

		this.props.checkUserExists(this.state.contactPersonEmail, this.checkUserExistsResponse);
	}

	checkUserExistsResponse(response) {
		console.log("exists response: ", response);
		if (response.success) {
			console.log("in?");
			document.getElementById('contactPersonEmailExists_err_msg').style.display = "block";
			return;
		}
		console.log("right after");

		const { companyName, location, postCode, country, employeeSize,
			contactPersonName, contactPersonEmail, contactPersonRole, contactPersonNumber, password } = this.state;

		const user = {
			name: contactPersonName,
			email: contactPersonEmail,
			password,
			role: contactPersonRole,
			contact: contactPersonNumber,

			company: {
				name: companyName,
				location,
				postCode,
				country,
				employeeSize: employeeSize ? employeeSize : -1
			}
		}

		console.log('new user: ', user);
		this.props.addUser(user, this.notify);
	}

	resetForm() {
		this.setState({
			companyName: "",
			location: "",
			postCode: "",
			country: "",
			employeeSize: "",

			contactPersonName: "",
			contactPersonEmail: "",
			contactPersonRole: "",
			contactPersonNumber: "",

			password: "",
			password_re: ""
		});
	}

	notify(response) {
		if (response.success) {
			this.props.notify(notificationType.success, "Registration successful");
			this.props.navigate(nav.modules.login);
		} else {
			this.props.notify(notificationType.error, response.message);
		}
	}

	render() {

		const countryDD = countries.map(
			(countryData) => {
				return <MenuItem value={countryData.Code}>{countryData.Name}</MenuItem>;
			}
		);



		return (
			<>
				<div style={{ height: "100vh" }}>
					<div className="bg-dark col-12 container h-100">
						<div className="row align-items-center h-100">
							<div className="col-sm-10 col-md-8 col-lg-6 col-xl-4  mx-auto">
								<form className="needs-validation" onSubmit={(e) => { e.preventDefault(); this.initRegister(); }}>
									<MDBContainer>
										<MDBRow>
											<MDBCol md="12">
												<p id="x" className="h3 text-center text-white mb-4">Company</p>
												<MDBInput
													label="Company Name"
													group
													value={this.state.companyName}
													onChange={(e) => this.onChange('companyName', e.target.value)}
												/>
												<div id="companyName_err_msg" className="invalid-feedback">Required</div>
												<MDBInput
													label="Location"
													group
													value={this.state.location}
													onChange={(e) => this.onChange('location', e.target.value)}
												/>
												<div id="location_err_msg" className="invalid-feedback">Required</div>
												{/* log goes here */}
											</MDBCol>
										</MDBRow>

										<MDBRow>
											<MDBCol md="4">
												<MDBInput
													label="Post Code"
													group
													value={this.state.postCode}
													onChange={(e) => this.onChange('postCode', e.target.value)}
												/>
												<div id="postCode_err_msg" className="invalid-feedback">Required</div>

											</MDBCol>
											<MDBCol md="4">
												{/* <MDBInput
													label="Country"
													group
													value={this.state.country}
													onChange={(e) => this.onChange('country', e.target.value)}
												/> */}
												<Select
													className="countryDD"
													style={{"color" : "#757575", "padding-top": "32px", "padding-left": "4px" }}
													label="Country"
													value={this.state.country}
													onChange={(e) => this.onChange('country', e.target.value)}
												>
													{countryDD}
												</Select>
												<div id="country_err_msg" className="invalid-feedback">Required</div>

											</MDBCol>
											<MDBCol md="4">
												<MDBInput
													label="Employee Size"
													group
													value={this.state.employeeSize}
													onChange={(e) => this.onChange('employeeSize', e.target.value)}
												/>
											</MDBCol>
										</MDBRow>

										<MDBRow>
											<MDBCol>
												<p id="x" className="h3 text-center text-white mb-4 mt-3">Contact Person (Account Holder)</p>
												<MDBInput
													label="Name"
													group
													value={this.state.contactPersonName}
													onChange={(e) => this.onChange('contactPersonName', e.target.value)}
												/>
												<div id="contactPersonName_err_msg" className="invalid-feedback">Required</div>
											</MDBCol>
										</MDBRow>

										<MDBRow>
											<MDBCol md="4">
												<MDBInput
													label="Email (used as login credential)"
													group type="email"
													value={this.state.contactPersonEmail}
													onChange={(e) => this.onChange('contactPersonEmail', e.target.value)}
												/>
												<div id="contactPersonEmail_err_msg" className="invalid-feedback">Required</div>
												<div id="contactPersonEmailExists_err_msg" className="invalid-feedback">Email address already in use</div>
											</MDBCol>
											<MDBCol md="4">
												<MDBInput
													label="Role"
													group
													value={this.state.contactPersonRole}
													onChange={(e) => this.onChange('contactPersonRole', e.target.value)}
												/>
												<div id="contactPersonRole_err_msg" className="invalid-feedback">Required</div>
											</MDBCol>
											<MDBCol md="4">
												<MDBInput
													label="Contact Number"
													group
													value={this.state.contactPersonNumber}
													onChange={(e) => this.onChange('contactPersonNumber', e.target.value)}
												/>
												<div id="contactPersonNumber_err_msg" className="invalid-feedback">Required</div>
											</MDBCol>
										</MDBRow>

										<MDBRow>
											<MDBCol md="6">
												<MDBInput
													label="Enter Password"
													group type="password"
													value={this.state.password}
													onChange={(e) => this.onChange('password', e.target.value)}
												/>
												<div id="password_err_msg" className="invalid-feedback">Required</div>
											</MDBCol>
											<MDBCol md="6">
												<MDBInput
													label="Retype password"
													group type="password"
													value={this.state.password_re}
													onChange={(e) => this.onChange('password_re', e.target.value)}
												/>
												<div id="password_re_err_msg" className="invalid-feedback">Passwords do not match</div>
											</MDBCol>
										</MDBRow>

										<MDBRow>
											<MDBCol>
												<div className="text-center">
													<MDBBtn type="submit">Register New User</MDBBtn>
													<MDBBtn onClick={this.resetForm}>Clear</MDBBtn>
												</div>
											</MDBCol>
										</MDBRow>
									</MDBContainer>
								</form>

							</div>
						</div>
					</div>
				</div>
				<MDBBtn outline color="success" style={{ position: "absolute", top: "0%", right: "0%" }} onClick={() => this.props.navigate(nav.modules.login)}>Login</MDBBtn>
			</>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Register);