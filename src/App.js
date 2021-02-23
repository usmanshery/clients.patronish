import React, { Component } from 'react';
import Admin from './components/Admin/Admin';
import Login from './components/Login/Login';
import Register from './components/Login/Register';
import PasswordReset from './components/Login/PasswordReset';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { pageLoadAction } from './store/session';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { notificationType } from './store/globals/codes';
import * as nav from '../src/store/globals/nav';
import './Styles.css';

const mapStateToProps = state => {
	return {
		loading: state.loading,
		loggedIn: state.loggedIn,
		activeModule: state.activeModule
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onPageLoad: () => dispatch(pageLoadAction())
	}
}

class App extends Component {

	constructor(props) {
		super(props);
		this.asEmbededPage = this.asEmbededPage.bind(this);
		this.state = {
			embededUrl: undefined
		};
	}

	componentDidMount() {
		let embededUrl = this.asEmbededPage();
		if (embededUrl) {
			this.setState({
				embededUrl
			});
			return;
		}

		if (!this.props.loggedIn)
			this.props.onPageLoad();
	}

	notify(type, content) {
		switch (type) {
			case notificationType.success:
				toast.success(content, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
					progress: undefined,
				});
				break;
			case notificationType.error:
				toast.error(content, {
					position: "top-right",
					autoClose: 3000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
					progress: undefined,
				});
				break;
			default:
				toast.warn("Invalid notification issue", {
					position: "top-right",
					autoClose: 5000,
					hideProgressBar: true,
					closeOnClick: true,
					pauseOnHover: false,
					draggable: true,
					progress: undefined,
				});
				break;
		}
	}

	asEmbededPage() {
		// start url validation
		const params = queryString.parse(window.location.search);
		if (!params.video) {
			return undefined;
		} else {
			return params.video;
		}
	}

	render() {
		let overlayStyle = 'none';
		if (this.props.loading) {
			overlayStyle = 'block';
		}

		if (this.state.embededUrl) {
			return <iframe 
			style={
				{
					"background-image": "url(https://temprecordpatronishreviewstorage.s3.us-east-2.amazonaws.com/test/1613590606143.jpg)",
					"background-size": "cover",
					"background-repeat": "no-repeat" 
					}}>
			</iframe>;
		}

		if (this.props.loggedIn) {
			return <>
				<ToastContainer
					position="top-right"
					autoClose={1000}
					hideProgressBar
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss={false}
					draggable
					pauseOnHover={false}
				/>
				<div id="loader" className="loader" style={{ display: overlayStyle }}></div>
				<div id="overlay" className="overlay" style={{ display: overlayStyle }}></div>
				<Admin />
			</>;
		} else {
			return <>
				<ToastContainer
					position="top-right"
					autoClose={1000}
					hideProgressBar
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss={false}
					draggable
					pauseOnHover={false}
				/>
				{this.props.activeModule === nav.modules.login ? <Login notify={this.notify} /> : <></>}
				{this.props.activeModule === nav.modules.register ? <Register notify={this.notify} /> : <></>}
				{this.props.activeModule === nav.modules.passwordReset ? <PasswordReset notify={this.notify} /> : <></>}
			</>;
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
