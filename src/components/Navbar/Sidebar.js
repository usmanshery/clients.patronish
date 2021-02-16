import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as nav from '../../store/globals/nav';
import * as filter from '../../store/globals/filter';
import { fetchCampaignAction, userFilter, fetchVideoListAction, campaignFilter, setActiveAlbumName, onWaitAction } from '../../store/session';
import { MDBLink, MDBNavItem } from "mdbreact";
import { BrowserRouter as Router } from 'react-router-dom';
import { ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';

const mapStateToProps = state => {
	return {
		activeModule: state.activeModule,
		userMenu: state.userFilter,
		campaignList: state.campaignList,
		campaignMenu: state.campaignFilter,
		userEmail: state.userData.email,
		isAdmin: state.userData.admin
	}
}

const mapDispatchToProps = dispatch => {
	return {
		fetchCampaigns: (email) => dispatch(fetchCampaignAction(email)),
		filterUsers: (filter) => dispatch(userFilter(filter)),
		filterVideos: (campaignUrl) => dispatch(fetchVideoListAction(campaignUrl)),
		filterCampaigns: (filter) => dispatch(campaignFilter(filter)),
		setAlbumName: (albumName) => dispatch(setActiveAlbumName(albumName)),
		overlay: () => dispatch(onWaitAction())
	}
}

class Sidebar extends Component {

	componentDidMount() {
		if (!this.props.campaignList) {
			if (!this.props.isAdmin) {
				this.props.fetchCampaigns(this.props.userEmail);
			} else {
				this.props.fetchCampaigns("*");
			}
		}
	}

	generateUserVideoMenu() {
		const campaignPlaylists = this.props.campaignList ? this.props.campaignList.map(
			(campaign) => {
				return <MDBLink to='' onClick={() => { this.props.overlay(); this.props.setAlbumName(campaign.name); this.props.filterVideos(campaign.campaignURL); }} link>
					{campaign.name}
				</MDBLink>
			}
		) : [];

		const videoMenu = <Menu>
			<SubMenu title="Video Folders">
				<MDBNavItem active={this.props.videoMenu === filter.videoFilters.videostuff}>
					{campaignPlaylists}
				</MDBNavItem>
			</SubMenu>
		</Menu>;
		return videoMenu;
	}

	generateAdminVideoMenu() {
		const userCampaignPlaylists = this.props.campaignList ? this.props.campaignList.map(
			// this is (user name, array of campaigns)
			(campaign) => {
				const campaignPlaylists =
					campaign.campaigns.map((campaign) => {
						return <MDBLink to='' onClick={() => { this.props.overlay(); this.props.setAlbumName(campaign.campaignName); this.props.filterVideos(campaign.campaignUrl); }} link>
							{campaign.campaignName}
						</MDBLink>
					});
				return<SubMenu title={campaign.name}>
							<MDBNavItem active={this.props.videoMenu === filter.videoFilters.videostuff}>
								{campaignPlaylists}
							</MDBNavItem>
						</SubMenu>;
			}
		) : [];

		const videoMenu = <Menu>
				{userCampaignPlaylists}
		</Menu>;
		return videoMenu;
	}

	render() {
		// user's menu
		const userMenu = <Menu>
			<SubMenu defaultOpen={true} title="Filter Users">
				<MDBNavItem active={this.props.userMenu === filter.userFilters.All}>
					<MDBLink to='' onClick={() => this.props.filterUsers(filter.userFilters.All)} link>
						All Users
					</MDBLink>
				</MDBNavItem>
				<MDBNavItem active={this.props.userMenu === filter.userFilters.Active}>
					<MDBLink to='' onClick={() => this.props.filterUsers(filter.userFilters.Active)} link>
						Active Users
					</MDBLink>
				</MDBNavItem>
				<MDBNavItem active={this.props.userMenu === filter.userFilters.Inactive}>
					<MDBLink to='' onClick={() => this.props.filterUsers(filter.userFilters.Inactive)} link>
						Inactive Users
					</MDBLink>
				</MDBNavItem>
			</SubMenu>
			<MDBNavItem active={this.props.userMenu === filter.userFilters.New}>
				<MDBLink to='' onClick={() => this.props.filterUsers(filter.userFilters.New)} link>
					Add New User
				</MDBLink>
			</MDBNavItem>
		</Menu>
		// console.log("campaign list here: ", this.props.campaignList);
		// video menu: (non-admin)
		const videoMenu = this.props.isAdmin ?
			this.generateAdminVideoMenu() :
			this.generateUserVideoMenu();

		// campaign's menu
		const campaignMenu = <Menu>
			<SubMenu defaultOpen={true} title="Filter Campaigns">
				<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.All}>
					<MDBLink to='' onClick={() => this.props.filterCampaigns(filter.campaignFilters.All)} link>
						All Campaigns
					</MDBLink>
				</MDBNavItem>
				<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.Active}>
					<MDBLink to='' onClick={() => this.props.filterCampaigns(filter.campaignFilters.Active)} link>
						Active Campaigns
					</MDBLink>
				</MDBNavItem>
				<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.Past}>
					<MDBLink to='' onClick={() => this.props.filterCampaigns(filter.campaignFilters.Past)} link>
						Past Campaigns
					</MDBLink>
				</MDBNavItem>
			</SubMenu>
			<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.New}>
				<MDBLink to='' onClick={() => this.props.filterCampaigns(filter.campaignFilters.New)} link>
					Add New Campaign
				</MDBLink>
			</MDBNavItem>
		</Menu>

		return (
			<div className="" style={{ position: "fixed", bottom: 0, left: 0, top: 0 }}>
				<Router>
					<ProSidebar width={270}>
						<Menu><MenuItem></MenuItem><MenuItem></MenuItem><MenuItem></MenuItem></Menu>
						{this.props.activeModule === nav.modules.user ? userMenu : <></>}
						{this.props.activeModule === nav.modules.video ? videoMenu : <></>}
						{this.props.activeModule === nav.modules.campaign ? campaignMenu : <></>}
					</ProSidebar>
				</Router>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);