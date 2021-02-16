import { MDBBtn, MDBCol, MDBContainer, MDBInput, MDBRow, MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import React, { Component } from 'react';
import DropdownMenu from '../Dropdown/DropdownMenu';
import { connect } from 'react-redux';
import { fetchUsersAction, updateUserAction, removeUserAction, addUserAction, existingUserAction, userFilter } from '../../store/session';
import * as filter from '../../store/globals/filter';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import countries from '../../store/globals/countries';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import '../Login/Style.css';

const mapStateToProps = state => {
	return {
		userData: state.userPoolData,
		userFilter: state.userFilter
	}
}

const mapDispatchToProps = dispatch => {
	return {
		fetchUsers: () => dispatch(fetchUsersAction()),
		updateUser: (email, user) => dispatch(updateUserAction(email, user)),
		removeUser: (user) => dispatch(removeUserAction(user)),
		checkUserExists: (email, cb) => dispatch(existingUserAction(email, cb)),
		addUser: (user, cb) => dispatch(addUserAction(user, cb)),
		filterUsers: (filter) => dispatch(userFilter(filter))
	}
}

class User extends Component {

	constructor(props) {
		super(props);

		this.columns = [
			{
				label: '#',
				field: 'id'
			},
			{
				label: 'Company',
				field: 'companyName'
			},
			{
				label: 'User Name',
				field: 'contactPersonName'
			},
			{
				label: 'Email',
				field: 'contactPersonEmail'
			},
			{
				label: 'Active',
				field: 'active'
			},
			{
				label: 'Manage',
				field: 'manage'
			}
		];

		this.userManagementActions = {
			toggleActive: 'toggleActive',
			removeUser: 'removeUser',
			addUser: 'addUser'
		}

		this.state = {
			rows: [],
			active: false
			// ,
			// companyName: "test company",
			// location: "test location",
			// postCode: "112233",
			// country: "test country",
			// contactPersonName: "test contact name",
			// contactPersonEmail: "contact@person.email",
			// contactPersonRole: "test contact role",
			// contactPersonNumber: "0900123456789",
			// password: "cellcycle",
			// password_re: "cellcycle"
		}

		this.manageUser = this.manageUser.bind(this);
		this.onChange = this.onChange.bind(this);
		this.resetForm = this.resetForm.bind(this);
		this.resetForm = this.resetForm.bind(this);
		this.checkUserExistsResponse = this.checkUserExistsResponse.bind(this);
		this.addUserResponse = this.addUserResponse.bind(this);
	}

	componentDidMount() {
		if (!this.props.userData)
			this.props.fetchUsers();
	}

	onChange(property, val) {
		this.setState({
			[property]: val
		});

		const element = document.getElementById(`${property}_err_msg`);
		if (element){
			element.style.display = "none";
			if(property === 'contactPersonEmail')
			document.getElementById('contactPersonEmailExists_err_msg').style.display = "none";
		}
	}

	checkUserExistsResponse(response) {
		console.log("response: ", response);
		if(response.success){
			document.getElementById('contactPersonEmailExists_err_msg').style.display = "block";
			return;
		}

		const { companyName, location, postCode, country, employeeSize,
			contactPersonName, contactPersonEmail, contactPersonRole, contactPersonNumber, password, active } = this.state;

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
			},
			active
		}
		
		console.log('new user: ', user);
		this.props.addUser(user, this.addUserResponse);
	}

	addUserResponse(response) {
		// wait for further action
		console.log("response: ", response);
		if(response.success){
			if(this.state.active){
				this.props.filterUsers(filter.userFilters.Active);
			}
			if(!this.state.active){
				this.props.filterUsers(filter.userFilters.Inactive);
			}
			this.props.fetchUsers();
		}
	}

	// user management: [activate/de-activate user]
	manageUser(action, email) {
		let targetUser;
		switch (action) {
			case this.userManagementActions.toggleActive:
				targetUser = { ...this.props.userData.find((user) => user.email === email) };
				targetUser.active = !targetUser.active;
				this.props.updateUser(email, targetUser);
				return;

			case this.userManagementActions.removeUser:
				targetUser = { ...this.props.userData.find((user) => user.email === email) };
				this.props.removeUser(targetUser);
				return;

			case this.userManagementActions.addUser:
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
				if (this.props.existingUserCheck) {
					// appropriate message
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
				return;

			default:
				console.log("will act as default");
				return;
		}
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
			password_re: "",

			active: false
		});
	}

	/*
		Company (Name, Location, Post Code, Country, Employees size) - upload logo
		Contact Person (Name, Role, email, password, phone nr)
	*/

	render() {
		if (this.props.userFilter === filter.userFilters.All || this.props.userFilter === filter.userFilters.Active || this.props.userFilter === filter.userFilters.Inactive) {
			let rows;
			if (this.props.userData) {
				if (this.props.userData.length > 0) {
					function generateMaterialCheckbox(checked) {
						return <MDBBtn size="sm" rounded color={checked ? "success" : "danger"}>{checked ? "Active" : "Inactive"}</MDBBtn>;
					}
					let idCounter = 1;
					rows = this.props.userData.map((user) => {
						if (this.props.userFilter === filter.userFilters.Active && !user.active)
							return {};
						if (this.props.userFilter === filter.userFilters.Inactive && user.active)
							return {};

						return {
							'id': idCounter++,
							'companyName': user.company.name,
							'contactPersonName': user.name,
							'contactPersonEmail': user.email,
							'active': generateMaterialCheckbox(user.active),
							'action': <DropdownMenu
								trigger={
									({ isOpen, triggerRef, toggle }) =>
										<button type="button" className="btn btn-outline-primary" data-ripple-color="dark"
											ref={triggerRef}
											onClick={toggle}>
											Manage User
													</button>}
								id={user.email}
								options={[
									{
										name: () => user.active ? "Deactivate User" : "Activate User",
										action: this.userManagementActions.toggleActive,
									},
									{
										name: () => "Remove User",
										action: this.userManagementActions.removeUser,
									},
								]}
								callback={this.manageUser}
							/>
						}
					});
				}
			}

			return (
				<MDBTable btn>
					<MDBTableHead columns={this.columns} />
					<MDBTableBody rows={rows} />
					{/* <MDBTableBody rows={rows_outline_btn} /> */}
				</MDBTable>
			);
		}

		if (this.props.userFilter === filter.userFilters.New) {
			const countryDD = countries.map(
				(countryData) => {
					return <MenuItem value={countryData.Code}>{countryData.Name}</MenuItem>;
				}
			);
			
			return (
				<form className="needs-validation" onSubmit={(e) => { e.preventDefault(); this.manageUser(this.userManagementActions.addUser); }}>
					<MDBContainer>
						<MDBRow>
							<MDBCol md="12">
								<p id="x" className="h5 text-center mb-4">Company</p>
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
								<p id="x" className="h5 text-center mb-4 mt-3">Contact Person (Account Holder)</p>
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
							<MDBCol md="5">
								<MDBInput
									label="Enter Password"
									group type="password"
									value={this.state.password}
									onChange={(e) => this.onChange('password', e.target.value)}
								/>
								<div id="password_err_msg" className="invalid-feedback">Required</div>
							</MDBCol>
							<MDBCol md="5">
								<MDBInput
									label="Retype password"
									group type="password"
									value={this.state.password_re}
									onChange={(e) => this.onChange('password_re', e.target.value)}
								/>
								<div id="password_re_err_msg" className="invalid-feedback">Passwords do not match</div>
							</MDBCol>
							<MDBCol md="2">
								<FormControlLabel
									control={<Checkbox checked={this.state.active} onChange={(e) => this.onChange('active', e.target.checked)} name="active" />}
									label="Active"
								/>
							</MDBCol>
						</MDBRow>

						<MDBRow>
							<MDBCol>
								<div className="text-center">
									<MDBBtn outline color="success" type="submit">Register New User</MDBBtn>
									<MDBBtn outline color="warning" onClick={this.resetForm}>Clear</MDBBtn>
								</div>
							</MDBCol>
						</MDBRow>
					</MDBContainer>
				</form>
			);
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(User);