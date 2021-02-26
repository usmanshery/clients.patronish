import React, { Component } from "react";
import Admin from "./components/Admin/Admin";
import Login from "./components/Login/Login";
import Register from "./components/Login/Register";
import PasswordReset from "./components/Login/PasswordReset";
import { connect } from "react-redux";
import { pageLoadAction } from "./store/session";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { notificationType } from "./store/globals/codes";
import * as nav from "../src/store/globals/nav";
import Spinner from "react-bootstrap/Spinner";
import "./Styles.css";

// import { Helmet } from "react-helmet";

import queryString from "query-string";
import VJSPlayer from "./components/Videos/VideoPlayer/VideoPlayer";

const mapStateToProps = (state) => {
	return {
		loading: state.loading,
		loggedIn: state.loggedIn,
		activeModule: state.activeModule,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onPageLoad: () => dispatch(pageLoadAction()),
	};
};

class App extends Component {
	constructor(props) {
		super(props);
		this.asEmbededPage = this.asEmbededPage.bind(this);
		this.validateEmbededUrl = this.validateEmbededUrl.bind(this);
		this.state = {
			embededUrl: undefined,
		};
	}

	componentDidMount() {
		let embededUrl = this.asEmbededPage();
		if (embededUrl) {
			this.setState({
				embededUrl,
				validating: true,
				valid: false,
				msg: "Video Not Found. URL is invalid or video has been deleted.",
			});

			let baseUrl;
			if (window.env === "dev") {
				baseUrl = window.devURL;
				console.log("developmental server");
			} else {
				baseUrl = window.prodURL;
			}
			baseUrl = baseUrl + "/video/";

			const url = baseUrl + embededUrl.replace("/", "$");
			console.log("Video verification url: ", url);
			fetch(url, { method: "GET" })
				.then((response) => response.json())
				.then(this.validateEmbededUrl);
		}

		if (!this.props.loggedIn) this.props.onPageLoad();
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
			// further verification goes here
			return params.video;
		}
	}

	validateEmbededUrl(json) {
		if (!json.success) {
			this.setState({
				validating: false,
				valid: false,
			});
		} else {
			this.setState({
				validating: false,
				valid: true,
			});
		}
	}

	render() {
		let overlayStyle = "none";
		if (this.props.loading) {
			overlayStyle = "block";
		}

		if (this.state.embededUrl) {
			if (this.state.validating) {
				return (
					<div className="loading">
						<Spinner
							animation="border"
							role="status"
							style={{
								width: "100px",
								height: "100px",
								border: "0.4em solid currentColor",
								borderRightColor: "transparent",
							}}
						/>
					</div>
				);
			}
			// if url was found to be invalid, show error screen
			if (!this.state.valid) {
				return (
					<div className="loading-failed">
						<h1>{this.state.msg}</h1>
					</div>
				);
			}

			return (
				<div id="player" className="videoPlayerCard" style={{ display: showVideo }}>
					{this.state.videoUrl ? <VJSPlayer src={this.state.videoUrl} /> : <></>}
				</div>
			);
		}

		if (this.props.loggedIn) {
			return (
				<>
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
				</>
			);
		} else {
			return (
				<>
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
					{this.props.activeModule === nav.modules.login ? (
						<Login notify={this.notify} />
					) : (
						<></>
					)}
					{this.props.activeModule === nav.modules.register ? (
						<Register notify={this.notify} />
					) : (
						<></>
					)}
					{this.props.activeModule === nav.modules.passwordReset ? (
						<PasswordReset notify={this.notify} />
					) : (
						<></>
					)}
				</>
			);
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
