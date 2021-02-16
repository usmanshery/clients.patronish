import { MDBBtn, MDBCol, MDBContainer, MDBInput, MDBRow, MDBTable, MDBTableBody, MDBTableHead } from 'mdbreact';
import React, { Component } from 'react';
import DropdownMenu from '../Dropdown/DropdownMenu';
import { connect } from 'react-redux';
import {
	fetchCampaignAction,
	updateCampaignAction,
	removeCampaignAction,
	addCampaignAction,
	existingCampaignAction,
	campaignFilter,
	uploadMailListAction
} from '../../store/session';
import * as filter from '../../store/globals/filter';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import { KeyboardDatePicker } from "@material-ui/pickers";
import { Button } from '@material-ui/core';
// import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon, WhatsappShareButton, WhatsappIcon } from 'react-share';
import { LinkedinShareButton, LinkedinIcon, RedditShareButton, RedditIcon } from 'react-share';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import './Campaign.css';
import Modal from 'react-bootstrap/Modal'

const mapStateToProps = state => {
	return {
		email: state.userData.email,
		campaignData: state.campaignList,
		campaignFilter: state.campaignFilter
	}
}

const mapDispatchToProps = dispatch => {
	return {
		fetchCampaigns: (userEmail) => dispatch(fetchCampaignAction(userEmail)),
		updateCampaign: (campaignURL, updatedCampaign) => dispatch(updateCampaignAction(campaignURL, updatedCampaign)),
		removeCampaign: (campaignURL, cb) => dispatch(removeCampaignAction(campaignURL, cb)),
		checkCampaignURLExists: (url, cb) => dispatch(existingCampaignAction(url, cb)),
		addCampaign: (newCampaign, cb) => dispatch(addCampaignAction(newCampaign, cb)),
		filterCampaigns: (filter) => dispatch(campaignFilter(filter)),
		uploadMailList: (campaignURL, file) => dispatch(uploadMailListAction(campaignURL, file))
	}
}

/*
	requirements:
		name
		url
		start date
		end date
		video duration
		intro text
		[questions]
	campaign object
*/

class Campaign extends Component {

	constructor(props) {
		super(props);

		this.columns = [
			{
				label: '#',
				field: 'id'
			},
			{
				label: 'Campaign',
				field: 'name'
			},
			{
				label: 'Campaign Balance',
				field: 'balance'
			},
			{
				label: 'Video Duration',
				field: 'duration'
			},
			{
				label: 'Intro Text',
				field: 'intro'
			},
			{
				label: 'URL',
				field: 'url'
			},
			{
				label: 'Share',
				field: 'share'
			},
			{
				label: 'Manage',
				field: 'manage'
			}
		];

		this.campaignManagementActions = {
			addCampaign: 'addCampaign',
			removeCampaign: 'removeCampaign',
			updateCampaign: 'updateCampaign',
			mailingList: 'mailingList'
		}

		this.popups = {
			editCampaignFiller: 'editeCampaignFiller',
			mailList: 'mailList'
		}

		this.state = {
			rows: [],
			intro_len: 300,
			startdate: new Date(),
			enddate: new Date(),
			modalShow: false,
			mailList: {
				popup: false,
				campaign: null,
				file: undefined
			}
		}

		this.manageCampaign = this.manageCampaign.bind(this);
		this.onChange = this.onChange.bind(this);
		this.resetForm = this.resetForm.bind(this);
		this.checkCampaignURLExistsResponse = this.checkCampaignURLExistsResponse.bind(this);
		this.addCampaignResponse = this.addCampaignResponse.bind(this);
		this.togglePopups = this.togglePopups.bind(this);
		this.setMailingList = this.setMailingList.bind(this);
		this.sendMailingList = this.sendMailingList.bind(this);
	}

	componentDidMount() {
		if (!this.props.campaignData)
			this.props.fetchCampaigns(this.props.email);
	}

	onChange(property, val, index = -1, subIndex = -1) {

		// console.log(property, val, index);

		if (property === 'intro') {
			if (val.length > 300)
				val = val.substring(0, 300);
			this.setState({
				intro_len: 300 - val.length
			});
		}

		// to add new question
		if (property === 'question') {
			// if question array does not exist, make a new one
			let questions = this.state.questions ? this.state.questions : [];

			// update question statement
			if (index >= 0) {
				// use sub index to switch between and / or
				if (subIndex === 0)
					questions[index].type = questions[index].type === "or" ? "and" : "or";
				else
					questions[index].statement = val;
			}
			// add new question
			else {
				questions[questions.length] = { statement: val, type: "or", options: ["yes", "no"] };
			}

			this.setState({
				questions
			});
		}

		// remove a question
		if (property === 'question-r') {
			let questions = this.state.questions;

			if (index >= 0) {
				questions[index] = null;
			}

			this.setState({
				questions
			});
			return;
		}

		// add option to existing question
		if (property === 'question-option') {
			let questions = this.state.questions;
			if (!questions) {
				alert("Error: Add option to invalid question");
				return;
			}

			if (subIndex >= 0) {
				questions[index].options[subIndex] = val;
			} else {
				if (questions[index].options)
					questions[index].options.push(val);
				else
					questions[index].options = [val];
			}

			this.setState({
				questions
			});
			return;
		}

		if (property === 'question-option-r') {
			let questions = this.state.questions;
			if (!questions) {
				alert("Error: Remove option to invalid question");
				return;
			}

			if (subIndex >= 0) {
				if (questions[index].options && questions[index].options.length > 0)
					questions[index].options = questions[index].options.filter((_, index) => index !== subIndex);
			}

			this.setState({
				questions
			});
			return;
		}

		if (property === 'name') {
			document.getElementById('campaignNameExists_err_msg').style.display = "none";
		}

		if (property === 'url') {
			document.getElementById('campaignURLExists_err_msg').style.display = "none";
			// in future add special characters as well
			if (val.includes(' ')) {
				document.getElementById('validURL_err_msg').style.display = "block";
			} else {
				document.getElementById('validURL_err_msg').style.display = "none";
			}
		}

		const errElement = document.getElementById(`${property.includes('date') ? 'date' : property}_err_msg`);
		if (errElement)
			errElement.style.display = "none";

		if (property === 'startdate') {
			this.setState({
				[property]: val,
				enddate: val
			});
			return;
		}

		if (property === 'duration') {
			if (val < 0) {
				val = 0;
			} else if (val > 120) {
				val = 120;
			}
		}

		this.setState({
			[property]: val
		});
	}

	setMailingList(event){
		let file = event.target.files[0];
		this.setState({
			...this.state,
			mailList: {
				...this.state.mailList,
				file
			}
		})
	}

	sendMailingList(){
		this.togglePopups(this.popups.mailList);
		this.props.uploadMailList(this.state.mailList.campaign.campaignURL, this.state.mailList.file);
		// console.log(this.state.mailList.campaign.campaignURL, this.state.mailList.file);
	}

	// campaign management
	checkCampaignURLExistsResponse(response) {
		console.log("response: ", response);
		if (response.success) {
			document.getElementById('campaignURLExists_err_msg').style.display = "block";
			return;
		}

		const questions = this.state.questions ? this.state.questions.filter((question) => question === null ? false : question.length === 0 ? false : true) : [];

		const campaign = {
			email: this.props.email,
			campaignURL: this.state.url,
			name: this.state.name,
			balance: parseInt("10"),
			duration: parseInt(this.state.duration),
			intro: this.state.intro,
			startdate: this.state.startdate.getTime(),
			enddate: this.state.enddate.getTime(),
			questions
		}
		console.log('new campaign: ', campaign);
		this.setState({
			mailList: {
				...this.state.mailList,
				campaign
			}
		})
		this.props.addCampaign(campaign, this.addCampaignResponse);
	}

	addCampaignResponse(response) {
		// wait for further action
		console.log("response: ", response);
		if (response.success) {
			this.props.filterCampaigns(filter.campaignFilters.All);
			this.props.fetchCampaigns(this.props.email);
			this.resetForm();
			this.togglePopups(this.popups.mailList);
		}
	}

	manageCampaign(action, url) {

		let targetCampaign;
		switch (action) {
			case this.campaignManagementActions.mailingList:
				this.togglePopups(this.popups.mailList, true, this.props.campaignData.filter(campaign => campaign.campaignURL === url)[0]);
				return;
			
			case this.campaignManagementActions.updateCampaign:
				this.setState({
					modalShow: !this.state.modalShow
				});
				return;

			case this.campaignManagementActions.removeCampaign:
				targetCampaign = { ...this.props.campaignData.find((campaign) => campaign.campaignURL === url) };
				this.props.removeCampaign(targetCampaign.campaignURL, () => this.props.fetchCampaigns(this.props.email));
				return;

			case this.campaignManagementActions.addCampaign:
				if (!this.state.name) {
					document.getElementById('name_err_msg').style.display = "block";
					return;
				}
				if (!this.state.duration) {
					document.getElementById('duration_err_msg').style.display = "block";
					return;
				}
				if (!this.state.url || this.state.url.includes(' ')) {
					document.getElementById('validURL_err_msg').style.display = "block";
					return;
				}
				// parse and check dates
				if (!this.state.startdate || !this.state.enddate) {
					document.getElementById('date_err_msg').style.display = "block";
					return;
				}
				if (this.state.startdate.getTime() >= this.state.enddate.getTime()) {
					document.getElementById('date_err_msg').style.display = "block";
					return;
				}
				// validate questions


				this.props.checkCampaignURLExists(this.state.url, this.checkCampaignURLExistsResponse);
				return;

			default:
				console.log("will act as default");
				return;
		}
	}

	resetForm() {
		this.setState({
			name: "",
			url: "",
			duration: "",
			intro: "",
			startdate: new Date(),
			enddate: new Date(),
			questions: null
		});
	}

	// models
	togglePopups(popupId, state, option) {
		switch (popupId) {
			case this.popups.mailList:
				this.setState({
					mailList: {
						campaign: option === undefined ? this.state.mailList.campaign : option,
						popup: state === undefined ? !this.state.mailList.popup : state
					}
				});
				break;
			default:break;
		}
	}

	render() {
		const mailListPopup = !this.state.mailList.campaign ? undefined :
			<Modal show={this.state.mailList.popup} onHide={() => this.togglePopups(this.popups.mailList)}>
				<Modal.Header closeButton>
					<Modal.Title>Mailing List for <span style={{color: "#ff0000"}}>{this.state.mailList.campaign.name}</span></Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>Upload a Mailing List (SMS/ Email) to send invite for review (optional)</p>
					<input style={{ height: "45px", marginBottom: "12px"}} type="file" class="form-control" multiple={false} onChange={this.setMailingList}></input>
					<div>
						<button style={{ float: "right", padding: "10px 20px 10px 20px"}} onClick={this.sendMailingList}>Send</button>
					</div>
				</Modal.Body>
				{/* <Modal.Footer></Modal.Footer> */}
			</Modal>;


		if (this.props.campaignFilter === filter.campaignFilters.All ||
			this.props.campaignFilter === filter.campaignFilters.Active ||
			this.props.campaignFilter === filter.campaignFilters.Past) {
			let rows;
			console.log("Campaign data: ", this.props.campaignData);
			if (this.props.campaignData) {
				if (this.props.campaignData.length > 0) {

					// function generateMaterialCheckbox(id, checked){
					// 	return <MDBBtn size="sm" rounded color={checked ? "success":"danger"}>{checked ? "Active" : "Inactive"}</MDBBtn>;
					// }
					let idCounter = 1;
					rows = this.props.campaignData.map((campaign) => {
						// if(this.props.campaignFilter === filter.campaignFilters.Active && !user.active)
						// 	return {};
						// if(this.props.userFilter === filter.userFilters.Inactive && user.active)
						// 	return {};
						let campaignUrl = "https://story.patronish.com/?campaign=" + campaign.campaignURL;
						let intro = campaign.intro ? campaign.intro : "-";
						return {
							'id': idCounter++,
							'name': campaign.name,
							'balance': campaign.balance,
							'duration': campaign.duration,
							'intro': intro,
							'url': <Link href={campaignUrl} style={{ "color": "darkturquoise", "fontWeight": "bold", "fontSize": "x-large" }}>{campaign.campaignURL}</Link>,
							'share': [
								<FacebookShareButton style={{ "margin": "10px" }} url={campaignUrl} quote={campaign.campaignURL} /* hashtag="#hashtag" */>
									<FacebookIcon size={36} />
								</FacebookShareButton>,

								<TwitterShareButton style={{ "margin": "10px" }} url={campaignUrl} title={campaign.campaignURL}>
									<TwitterIcon size={36} />
								</TwitterShareButton>,

								<RedditShareButton style={{ "margin": "10px" }} url={campaignUrl} title={campaign.campaignURL}>
									<RedditIcon size={36} />
								</RedditShareButton>,

								<WhatsappShareButton style={{ "margin": "10px" }} url={campaignUrl} title={campaign.campaignURL}>
									<WhatsappIcon size={36} />
								</WhatsappShareButton>,

								<LinkedinShareButton style={{ "margin": "10px" }} url={campaignUrl} title={campaign.campaignURL} source={"http://clients.patronish.com"}>
									<LinkedinIcon size={36} />
								</LinkedinShareButton>,
							],
							'action': <DropdownMenu
								trigger={
									({ isOpen, triggerRef, toggle }) =>
										<button type="button" className="btn btn-outline-primary" data-ripple-color="dark"
											ref={triggerRef}
											onClick={toggle}>
											Manage Campaign
													</button>}
								id={campaign.campaignURL}
								options={[
									{
										name: () => "Mailing List",
										action: this.campaignManagementActions.mailingList
									},
									{
										name: () => "Edit Campaign",
										action: this.campaignManagementActions.updateCampaign
									},
									{
										name: () => "Delete Campaign",
										action: this.campaignManagementActions.removeCampaign
									}
								]}
								callback={this.manageCampaign}
							/>
						}
					});
				}
			}

			return (
				<>
					{mailListPopup}
					<MDBTable btn>
						<MDBTableHead columns={this.columns} />
						<MDBTableBody rows={rows} />
						{/* <MDBTableBody rows={rows_outline_btn} /> */}
					</MDBTable>

					<Modal show={this.state.modalShow} onHide={() => this.manageCampaign(this.campaignManagementActions.updateCampaign)}>
						<Modal.Header closeButton>
							<Modal.Title>Edit Campaign</Modal.Title>
						</Modal.Header>
						<Modal.Body>This campaign has been expired, it can't be edited.</Modal.Body>
						{/* <Modal.Footer></Modal.Footer> */}
					</Modal>
				</>
			);
		}
		/*
			requirements:
				name
				url
				start date
				end date
				video duration
				intro text
				[questions]
			campaign object
		*/
		if (this.props.campaignFilter === filter.campaignFilters.New) {
			// question fields
			const questionField =
				this.state.questions ? <>
					{this.state.questions.map(
						(question, index) => {
							if (question === null)
								return <></>;
							let options = undefined;
							if (question.options && question.options.length > 0) {
								options = question.options.map(
									(option, optionIndex) => {
										return <>
											<MDBCol md="5" className="option" style={{ "max-width": "45.8%", "flex": "0 0 45.8%" }}>
												<MDBInput
													type="text"
													group
													value={option}
													onChange={(e) => this.onChange('question-option', e.target.value, index, optionIndex)}
												/>
											</MDBCol>
											<MDBCol md="1" style={{ "padding-left": "0px", "padding-right": "0px", "max-width": "4%" }}>
												<IconButton size="small" className="mt-1 ml-2"
													onClick={(e) => this.onChange('question-option-r', null, index, optionIndex)}
												>
													<ClearIcon />
												</IconButton>
											</MDBCol>
										</>;
									}
								)
							}

							return <MDBRow key={index} className="question">
								<MDBCol md="8" style={{ "max-width": "78%", "flex": "0 0 78%" }}>
									<MDBInput
										type="text"
										group
										value={question.statement}
										onChange={(e) => this.onChange('question', e.target.value, index)}
									/>
								</MDBCol>
								<MDBCol md="2" style={{ "padding-left": "0px", "padding-right": "0px", "flex": "0 0 13.6%", "max-width": "13.6%" }}>
									<Button
										className="mt-4"
										style={{ "font-size": "small" }}
										variant="contained"
										color={question.type === "or" ? "primary" : "secondary"}
										startIcon={question.type === "or" ? <RadioButtonUncheckedIcon /> : <CheckBoxIcon />}
										onClick={(e) => this.onChange('question', null, index, 0)}
									>
										{question.type === "or" ? "Single Choice" : "Multi Select"}
									</Button>
								</MDBCol>
								<MDBCol md="1" style={{ "padding-left": "0px", "padding-right": "0px", "max-width": "4%" }}>
									<IconButton size="small" className="mt-4 ml-2"
										onClick={(e) => this.onChange('question-option', "option?", index)}
									>
										<AddIcon />
									</IconButton>
								</MDBCol>
								<MDBCol md="1" style={{ "padding-left": "0px", "padding-right": "0px", "max-width": "4%" }}>
									<IconButton size="small" className="mt-4 ml-2"
										onClick={(e) => this.onChange('question-r', null, index)}
									>
										<ClearIcon />
									</IconButton>
								</MDBCol>

								{options}
							</MDBRow>;
						}
					)}
				</> : <></>;

			return (
				<>
					<form className="needs-validation" onSubmit={(e) => { e.preventDefault(); this.manageCampaign(this.campaignManagementActions.addCampaign); }}>
						<MDBContainer>
							<MDBRow>
								<MDBCol md="6">
									<MDBInput
										label="Campaign Name"
										group
										value={this.state.name}
										onChange={(e) => this.onChange('name', e.target.value)}
									/>
									<div id="name_err_msg" className="invalid-feedback">Required</div>
									<div id="campaignNameExists_err_msg" className="invalid-feedback">This campaign name is taken</div>
								</MDBCol>
								<MDBCol md="6">
									<MDBInput
										label="Video Duration (sec)"
										group type="number"
										value={this.state.duration}
										onChange={(e) => this.onChange('duration', e.target.value)}
									/>
									<div id="duration_err_msg" className="invalid-feedback">Required</div>
								</MDBCol>
							</MDBRow>
							<MDBRow>
								<MDBCol md="12">
									<MDBInput
										label="Campaign URL (no spaces) https://story.patronish.com/"
										group
										value={this.state.url}
										onChange={(e) => this.onChange('url', e.target.value)}
									/>
									<div id="validURL_err_msg" className="invalid-feedback">Valid URL Required (no spaces)</div>
									<div id="campaignURLExists_err_msg" className="invalid-feedback">This campaign URL is taken</div>
								</MDBCol>
							</MDBRow>
							<MDBRow>
								<MDBCol md="12">
									<MDBInput
										label={`Campaign Introduction Text (optional - ${this.state.intro_len})`}
										group type="textarea"
										value={this.state.intro}
										onChange={(e) => this.onChange('intro', e.target.value)}
									/>
								</MDBCol>
							</MDBRow>
							<MDBRow className="mb-4">
								<MDBCol md="6">
									<KeyboardDatePicker
										label="Start Date"
										autoOk
										variant="inline"
										minDate={new Date()}
										inputVariant="outlined"
										format="dd/MM/yyyy"
										InputAdornmentProps={{ position: "start" }}
										value={this.state.startdate}
										onChange={(date) => this.onChange('startdate', date)}
									/>
								</MDBCol>
								<MDBCol>
									<KeyboardDatePicker
										label="End Date"
										autoOk
										variant="inline"
										minDate={this.state.startdate}
										inputVariant="outlined"
										format="dd/MM/yyyy"
										InputAdornmentProps={{ position: "start" }}
										value={this.state.enddate}
										onChange={(date) => this.onChange('enddate', date)}
									/>
								</MDBCol>
							</MDBRow>
							<MDBRow>
								<MDBCol>
									<div id="date_err_msg" className="invalid-feedback">Please select valid date(s) with at-least 1 day duration</div>
								</MDBCol>
							</MDBRow>
							{questionField}
							<MDBRow>
								<MDBCol>
									<Button
										variant="outlined"
										startIcon={<AddIcon />}
										onClick={() => this.onChange('question')}
									>Add Question</Button>
								</MDBCol>
							</MDBRow>
							<MDBRow >
								<MDBCol>
									<div className="text-center">
										<MDBBtn outline color="success" type="submit">Add New Campaign</MDBBtn>
										<MDBBtn outline color="warning" onClick={this.resetForm}>Clear</MDBBtn>
									</div>
								</MDBCol>
							</MDBRow>
						</MDBContainer>
					</form>
					{mailListPopup}
				</>
			);


		}

	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Campaign);