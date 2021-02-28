import React, { Component } from "react";
import { connect } from "react-redux";
import VJSPlayer from "./VideoPlayer/VideoPlayer";
import { clearVideoAction, onWaitAction, removeVideoAction, toggleVideoAccess, toggleVideoAccessLocalAction } from "../../store/session";
import { FacebookShareButton, FacebookIcon, TwitterShareButton, TwitterIcon, WhatsappShareButton, WhatsappIcon } from "react-share";
import { LinkedinShareButton, LinkedinIcon, RedditShareButton, RedditIcon } from "react-share";
import Modal from "react-bootstrap/Modal";
import "./Style.css";
import SettingsIcon from "@material-ui/icons/Settings";
import DropdownMenu from "../Dropdown/DropdownMenu";
import Chip from "@material-ui/core/Chip";

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
		toggleVideoAccess: (videoKey, currentAccessLevel, cb) => dispatch(toggleVideoAccess(videoKey, currentAccessLevel, cb)),
		toggleVideoAccessLocal: (videoKey, newAccessLevel) => dispatch(toggleVideoAccessLocalAction(videoKey, newAccessLevel)),
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
		this.actions = this.actions.bind(this);
		this.generateSharePopup = this.generateSharePopup.bind(this);
		this.toggleVideoAccessLevel = this.toggleVideoAccessLevel.bind(this);

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

		this.videoActions = {
			share: "share",
			download: "download",
			delete: "delete",
			toggleAccessibility: "togglaPublicPrivate",
		};
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

							<button type="button" className="btn btn-outline-primary" data-ripple-color="dark" onClick={() => this.downloadVideo(video.url)}>
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
							<FacebookShareButton style={{ margin: "10px" }} url={video.url} quote={this.props.albumName} /* hashtag="#hashtag" */>
								<FacebookIcon size={36} />
							</FacebookShareButton>

							<TwitterShareButton style={{ margin: "10px" }} url={video.url} title={this.props.albumName}>
								<TwitterIcon size={36} />
							</TwitterShareButton>

							<RedditShareButton style={{ margin: "10px" }} url={video.url} title={this.props.albumName}>
								<RedditIcon size={36} />
							</RedditShareButton>

							<WhatsappShareButton style={{ margin: "10px" }} url={video.url} title={this.props.albumName}>
								<WhatsappIcon size={36} />
							</WhatsappShareButton>

							<LinkedinShareButton style={{ margin: "10px" }} url={video.url} title={this.props.albumName} source={"http://clients.patronish.com"}>
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
			// first filter only video keys
			.filter((object) => object.key.endsWith(".mp4"))
			.map((object) => {
				return { video: object };
			})
			.map((videoObj) => {
				// find image url (key value pair)
				let searchResult = this.props.albumList.filter((obj) => !obj.url.endsWith(".mp4") && obj.url.includes(videoObj.video.key.substring(0, videoObj.video.key.length - 4)));
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
							"background-image": `url(${videoDetail.image ? videoDetail.image.url : "video_not_found.png"})`,
							"background-size": "cover",
							"background-repeat": "no-repeat",
						}}
						onClick={() => {
							// this.props.overlay();
							this.playVideo(videoDetail.video.url);
						}}
					></div>
					<div className="videoDecription">
						<div className="videoDecriptionTextContainer">
							<p className="videoDecriptionText">{videoDetail.video.key}</p>
							<p className="videoDescriptionDate">{uploadDate}</p>
						</div>
						<div className="videoDecriptionComponentsContainer">
							<DropdownMenu
								trigger={({ isOpen, triggerRef, toggle }) => (
									<button style={{ border: "none", padding: "1px", height: "26px" }} ref={triggerRef} onClick={toggle}>
										<SettingsIcon style={{ color: "slategray" }} />
									</button>
								)}
								id={videoDetail.video}
								options={[
									{
										name: () => "Share Video",
										action: this.videoActions.share,
									},
									{
										name: () => "Download Video",
										action: this.videoActions.download,
									},
									{
										name: () => (videoDetail.video.access === "public" ? "Set Private" : "Set Public"),
										action: this.videoActions.toggleAccessibility,
									},
									{
										name: () => "Delete Video",
										action: this.videoActions.delete,
									},
								]}
								callback={this.actions}
							/>
							<Chip style={{ height: "22px" }} label={videoDetail.video.access === "public" ? "Public" : "Private"} color={videoDetail.video.access === "public" ? "secondary" : "primary"} />
						</div>
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

	toggleVideoAccessLevel(response, key, access) {
		if (response.success) {
			this.props.toggleVideoAccessLocal(key, access === "public" ? "private" : "public");
		}
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
		// console.log(this.state.share);
		// console.log("SO:", this.state.share.popup);
	}

	actions(action, videoDetail) {
		let { key, url, access } = videoDetail;

		if (action === this.videoActions.share) {
			this.togglePopups(this.popups.shareVideo, true, `http://clients.patronish.com/?video=${key.substr(0, key.length - 4)}`);
		}
		if (action === this.videoActions.download) {
			this.downloadVideo(url);
		}
		if (action === this.videoActions.delete) {
			this.props.overlay();
			this.props.deleteVideo(key);
		}
		if (action === this.videoActions.toggleAccessibility) {
			this.props.overlay();
			this.props.toggleVideoAccess(key, access, (response) => this.toggleVideoAccessLevel(response, key, access));
			// this.props.toggleVideoAccessLocal(key, access);
		}
	}

	generateSharePopup() {
		return (
			<Modal show={this.state.share.popup} onHide={() => this.togglePopups(this.popups.shareVideo)}>
				<Modal.Header closeButton>
					<Modal.Title>Share Review Video</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						{/* <button style={{ float: "right", padding: "10px 20px 10px 20px"}} onClick={this.sendMailingList}>Send</button> */}
						<FacebookShareButton style={{ margin: "10px" }} url={this.state.share.url} quote={this.props.albumName} /* hashtag="#hashtag" */>
							<FacebookIcon size={36} />
						</FacebookShareButton>

						<TwitterShareButton style={{ margin: "10px" }} url={this.state.share.url} title={this.props.albumName}>
							<TwitterIcon size={36} />
						</TwitterShareButton>

						<RedditShareButton style={{ margin: "10px" }} url={this.state.share.url} title={this.props.albumName}>
							<RedditIcon size={36} />
						</RedditShareButton>

						<WhatsappShareButton style={{ margin: "10px" }} url={this.state.share.url} title={this.props.albumName}>
							<WhatsappIcon size={36} />
						</WhatsappShareButton>

						<LinkedinShareButton style={{ margin: "10px" }} url={this.state.share.url} title={this.props.albumName} source={"http://clients.patronish.com"}>
							<LinkedinIcon size={36} />
						</LinkedinShareButton>
					</div>
				</Modal.Body>
				{/* <Modal.Footer></Modal.Footer> */}
			</Modal>
		);
	}

	render() {
		const videoTable = this.generateTable2();

		let showVideo = "none";

		if (this.state.videoUrl) {
			if (this.props.albumList && this.props.albumList.filter((item) => item.url === this.state.videoUrl).length === 1) showVideo = "block";
			else this.closeVideo();
		}

		return (
			<div>
				{this.generateSharePopup()}
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
