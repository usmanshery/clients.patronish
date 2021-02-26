import React, { Component } from 'react';
import VideoPlayer from 'react-video-js-player';
import './Styles.css';

class VJSPlayer extends Component {

	player = {}

	onPlayerReady(player) {
		// console.log("Player is ready: ", player);
		this.player = player;
	}

	onVideoPlay(duration) {
		// console.log("Video played at: ", duration);
	}

	onVideoEnd() {
		// console.log("Video playback ended");
		// var playButton = document.getElementById('playButton');
		// playButton.style.display = "block";
	}

	render() {
		if (this.props.src == null)
			return (<></>);
		return (
			<>
				<div style={{height: "100%"}}>
					<VideoPlayer
						className={this.props.fullScreen ? "videoPlayerFullScreen" : "videoPlayer"}
						controls={true}
						src={{src: this.props.src, type: 'video/mp4'}}
						onReady={this.onPlayerReady.bind(this)}
						onPlay={this.onVideoPlay.bind(this)}
						onEnd={this.onVideoEnd.bind(this)}
						/>
				</div>
			</>
		);
	}
}
export default VJSPlayer;