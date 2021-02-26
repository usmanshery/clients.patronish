import React, { Component } from "react";
import { connect } from "react-redux";
import VJSPlayer from "./VideoPlayer/VideoPlayer";
import {
	clearVideoAction,
	onWaitAction,
	removeVideoAction,
} from "../../store/session";
import {
	FacebookShareButton,
	FacebookIcon,
	TwitterShareButton,
	TwitterIcon,
	WhatsappShareButton,
	WhatsappIcon,
} from "react-share";
import {
	LinkedinShareButton,
	LinkedinIcon,
	RedditShareButton,
	RedditIcon,
} from "react-share";
import Modal from "react-bootstrap/Modal";
import "./Style.css";

const mapStateToProps = (state) => {
	return {
		campaignFilter: state.campaignData,
		albumName: state.albumName,
		albumList: state.albumList,
		videoUrl: state.videoUrl,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		deleteVideo: (vidoeKey) => dispatch(removeVideoAction(vidoeKey)),
		closeVideo: () => dispatch(clearVideoAction()),
		overlay: () => dispatch(onWaitAction()),
	};
};

class Video extends Component {
	constructor(props) {
		super(props);
		this.generateTable = this.generateTable.bind(this);
		this.downloadVideo = this.downloadVideo.bind(this);
		this.playVideo = this.playVideo.bind(this);
		this.closeVideo = this.closeVideo.bind(this);

		this.popups = {
			shareVideo: "shareVideo",
		};

		this.state = {
			videoUrl: undefined,
			share: {
				popup: false,
				url: undefined,
			},
		};

		this.mailListPopup = ( // !this.state.mailList.campaign ? undefined :
			<Modal
				show={this.state.share.popup}
				onHide={() => this.togglePopups(this.popups.shareVideo)}
			>
				<Modal.Header closeButton>
					<Modal.Title>Share Review Video</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						{/* <button style={{ float: "right", padding: "10px 20px 10px 20px"}} onClick={this.sendMailingList}>Send</button> */}
						<FacebookShareButton
							style={{ margin: "10px" }}
							url={this.state.share.url}
							quote={this.props.albumName} /* hashtag="#hashtag" */
						>
							<FacebookIcon size={36} />
						</FacebookShareButton>

						<TwitterShareButton
							style={{ margin: "10px" }}
							url={this.state.share.url}
							title={this.props.albumName}
						>
							<TwitterIcon size={36} />
						</TwitterShareButton>

						<RedditShareButton
							style={{ margin: "10px" }}
							url={this.state.share.url}
							title={this.props.albumName}
						>
							<RedditIcon size={36} />
						</RedditShareButton>

						<WhatsappShareButton
							style={{ margin: "10px" }}
							url={this.state.share.url}
							title={this.props.albumName}
						>
							<WhatsappIcon size={36} />
						</WhatsappShareButton>

						<LinkedinShareButton
							style={{ margin: "10px" }}
							url={this.state.share.url}
							title={this.props.albumName}
							source={"http://clients.patronish.com"}
						>
							<LinkedinIcon size={36} />
						</LinkedinShareButton>
					</div>
				</Modal.Body>
				{/* <Modal.Footer></Modal.Footer> */}
			</Modal>
		);
	}

	componentDidUpdate() {
		//
	}

	generateTable() {
		// album list:
		if (!this.props.albumName) {
			return <h3>No album selected</h3>;
		}
		if (!this.props.albumList) {
			return <h3>No videos in this album</h3>;
		}

		const tableRows = this.props.albumList.map((video, index) => {
			let timestamp = video.key.toString();
			timestamp = timestamp.substr(timestamp.indexOf("/") + 1);
			timestamp = timestamp.substr(0, timestamp.indexOf("."));
			let uploadDate = new Date(parseInt(timestamp)).toDateString();

			return (
				<tr key={video.key}>
					<td>{index + 1}</td>
					<td>{video.key}</td>
					<td>{uploadDate}</td>
					<td>
						<div>
							<button
								type="button"
								className="btn btn-outline-success"
								data-ripple-color="dark"
								onClick={() => {
									this.props.overlay();
									this.playVideo(video.url);
								}}
							>
								Play
							</button>

							<button
								type="button"
								className="btn btn-outline-primary"
								data-ripple-color="dark"
								onClick={() => this.downloadVideo(video.url)}
							>
								Download
							</button>

							<button
								type="button"
								className="btn btn-outline-danger"
								data-ripple-color="dark"
								onClick={() => {
									this.props.overlay();
									this.props.deleteVideo(video.key);
								}}
							>
								Delete
							</button>
						</div>
					</td>
					<td>
						<div>
							<FacebookShareButton
								style={{ margin: "10px" }}
								url={video.url}
								quote={this.props.albumName} /* hashtag="#hashtag" */
							>
								<FacebookIcon size={36} />
							</FacebookShareButton>

							<TwitterShareButton
								style={{ margin: "10px" }}
								url={video.url}
								title={this.props.albumName}
							>
								<TwitterIcon size={36} />
							</TwitterShareButton>

							<RedditShareButton
								style={{ margin: "10px" }}
								url={video.url}
								title={this.props.albumName}
							>
								<RedditIcon size={36} />
							</RedditShareButton>

							<WhatsappShareButton
								style={{ margin: "10px" }}
								url={video.url}
								title={this.props.albumName}
							>
								<WhatsappIcon size={36} />
							</WhatsappShareButton>

							<LinkedinShareButton
								style={{ margin: "10px" }}
								url={video.url}
								title={this.props.albumName}
								source={"http://clients.patronish.com"}
							>
								<LinkedinIcon size={36} />
							</LinkedinShareButton>
						</div>
					</td>
				</tr>
			);
		});

		const videoTable = (
			<table id="playlist">
				<tbody>{tableRows}</tbody>
			</table>
		);

		return videoTable;
	}

	generateTable2() {
		// album list:
		if (!this.props.albumName) {
			return <h3>No album selected</h3>;
		}
		if (!this.props.albumList) {
			return <h3>No videos in this album</h3>;
		}

		let videoList = this.props.albumList
			.filter((item) => item.url.endsWith(".mp4"))
			.map((videoURL) => {
				return { video: videoURL };
			})
			.map((videoObj) => {
				// find image url (key value pair)
				let searchResult = this.props.albumList.filter(
					(obj) =>
						!obj.url.endsWith(".mp4") &&
						obj.url.includes(videoObj.video.key.substring(0, videoObj.video.key.length - 4))
				);
				return {
					...videoObj,
					image: searchResult.length >= 1 ? searchResult[0] : undefined,
				};
			});
		// console.log(process.env.PUBLIC_URL);
		const videoCards = videoList.map((videoDetail, index) => {
			// for video creation/upload date
			let timestamp = videoDetail.video.key.toString();
			timestamp = timestamp.substr(timestamp.indexOf("/") + 1);
			timestamp = timestamp.substr(0, timestamp.indexOf("."));
			let uploadDate = new Date(parseInt(timestamp)).toDateString();
			return (
				<div className="videoCard">
					<div
						className="videoThumbnail"
						style={{
							"background-image": `url(${
								videoDetail.image ? videoDetail.image.url : "video_not_found.png"
							})`,
							"background-size": "cover",
							"background-repeat": "no-repeat",
						}}
						onClick={() => {
							// this.props.overlay();
							this.playVideo(videoDetail.video.url);
						}}
					></div>
					<div className="videoDecription">
						<p className="videoDecriptionText">{videoDetail.video.key}</p>
						<p className="videoDescriptionDate">{uploadDate}</p>
						<button
							type="button"
							className="btn-outline-primary"
							data-ripple-color="dark"
							onClick={() => this.downloadVideo(videoDetail.video.url)}
						>
							Download
						</button>

						<button
							type="button"
							className="btn-outline-danger"
							data-ripple-color="dark"
							onClick={() => {
								this.props.overlay();
								this.props.deleteVideo(videoDetail.video.key);
							}}
						>
							Delete
						</button>
						<button
							type="button"
							className="btn-outline-info"
							data-ripple-color="dark"
							onClick={() => {
								this.togglePopups(
									this.popups.shareVideo,
									true,
									`http://clients.patronish.com/?video=${videoDetail.video.key.substr(
										0,
										videoDetail.video.key.length - 4
									)}`
								);
							}}
						>
							Share&nbsp;
							<i class="fa fa-share"></i>
						</button>
					</div>
				</div>
			);
		});

		return videoCards;
	}

	playVideo(videoUrl) {
		if (this.state.videoUrl) {
			this.setState(
				{
					videoUrl: undefined,
				},
				() => {
					this.setState({
						videoUrl,
					});
				}
			);
		} else {
			this.setState({
				videoUrl,
			});
		}
	}

	closeVideo() {
		if (this.state.videoUrl)
			this.setState({
				videoUrl: undefined,
			});
	}

	downloadVideo(url) {
		window.location.href = url;
	}

	// models
	togglePopups(popupId, state, option) {
		switch (popupId) {
			case this.popups.shareVideo:
				this.setState({
					share: {
						url: option === undefined ? this.state.share.url : option,
						popup: state === undefined ? !this.state.share.popup : state,
					},
				});
				break;
			default:
				break;
		}
	}

	render() {
		const videoTable = this.generateTable2();

		let showVideo = "none";

		if (this.state.videoUrl) {
			if (
				this.props.albumList &&
				this.props.albumList.filter((item) => item.url === this.state.videoUrl)
					.length === 1
			)
				showVideo = "block";
			else this.closeVideo();
		}

		return (
			<div>
				{this.mailListPopup}
				{this.props.albumName ? (
					<h1>
						Campaign <b>{this.props.albumName}</b>
					</h1>
				) : (
					<></>
				)}

				<div id="playlistWrapper" className="flexContainer">
					<div id="player" className="videoPlayerCard" style={{ display: showVideo }}>
						<button className="closeButton" onClick={() => this.closeVideo()}>
							&#10006;
						</button>
						{this.state.videoUrl ? <VJSPlayer src={this.state.videoUrl} /> : <></>}
					</div>

					{videoTable}
				</div>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Video);
