import React, { Component } from "react";
import { connect } from "react-redux";
import * as nav from "../../store/globals/nav";
import * as filter from "../../store/globals/filter";
import { fetchCampaignAction, userFilter, fetchVideoListAction, campaignFilter, setActiveAlbumName, onWaitAction } from "../../store/session";
import { MDBNavItem } from "mdbreact";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import Button from "@material-ui/core/Button";
import "react-pro-sidebar/dist/css/styles.css";
import "./Styles.css";

const mapStateToProps = (state) => {
	return {
		activeModule: state.activeModule,
		userMenu: state.userFilter,
		campaignList: state.campaignList,
		campaignMenu: state.campaignFilter,
		userEmail: state.userData.email,
		isAdmin: state.userData.admin,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		fetchCampaigns: (email) => dispatch(fetchCampaignAction(email)),
		filterUsers: (filter) => dispatch(userFilter(filter)),
		filterVideos: (campaignUrl) => dispatch(fetchVideoListAction(campaignUrl)),
		filterCampaigns: (filter) => dispatch(campaignFilter(filter)),
		setAlbumName: (albumName) => dispatch(setActiveAlbumName(albumName)),
		overlay: () => dispatch(onWaitAction()),
	};
};

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
		const campaignPlaylists = this.props.campaignList
			? this.props.campaignList.map((campaign) => {
					return (
						<Button
							className="sidebarLinks sidebarSubLink"
							onClick={() => {
								this.props.overlay();
								this.props.setAlbumName(campaign.name);
								this.props.filterVideos(campaign.campaignURL);
							}}
						>
							<p>{campaign.name}</p>
						</Button>
					);
			  })
			: [];

		const videoMenu = (
			<Menu>
				<SubMenu title="Video Folders">
					<MDBNavItem active={this.props.videoMenu === filter.videoFilters.videostuff}>{campaignPlaylists}</MDBNavItem>
				</SubMenu>
			</Menu>
		);
		return videoMenu;
	}

	generateAdminVideoMenu() {
		const userCampaignPlaylists = this.props.campaignList
			? this.props.campaignList.map(
					// this is (user name, array of campaigns)
					(campaign) => {
						const campaignPlaylists = campaign.campaigns.map((campaign) => {
							return (
								<MDBNavItem active>
									<Button
										className="sidebarLinks sidebarSubLink"
										onClick={() => {
											this.props.overlay();
											this.props.setAlbumName(campaign.campaignName);
											this.props.filterVideos(campaign.campaignUrl);
										}}
									>
										<p>{campaign.campaignName}</p>
									</Button>
								</MDBNavItem>
							);
						});
						return <SubMenu title={campaign.name}>{campaignPlaylists}</SubMenu>;
					}
			  )
			: [];

		const videoMenu = <Menu>{userCampaignPlaylists}</Menu>;
		return videoMenu;
	}

	render() {
		// user's menu
		const userMenu = (
			<Menu>
				<SubMenu defaultOpen={true} title="Filter Users">
					<MDBNavItem active={this.props.userMenu === filter.userFilters.All}>
						<Button className="sidebarLinks sidebarSubLink" onClick={() => this.props.filterUsers(filter.userFilters.All)}>
							<p>All Users</p>
						</Button>
					</MDBNavItem>
					<MDBNavItem active={this.props.userMenu === filter.userFilters.Active}>
						<Button className="sidebarLinks sidebarSubLink" onClick={() => this.props.filterUsers(filter.userFilters.Active)}>
							<p>Active Users</p>
						</Button>
					</MDBNavItem>
					<MDBNavItem active={this.props.userMenu === filter.userFilters.Inactive}>
						<Button className="sidebarLinks sidebarSubLink" onClick={() => this.props.filterUsers(filter.userFilters.Inactive)}>
							<p>Inactive Users</p>
						</Button>
					</MDBNavItem>
				</SubMenu>
				<MDBNavItem active={this.props.userMenu === filter.userFilters.New}>
					<Button className="sidebarLinks sidebarMainLink" onClick={() => this.props.filterUsers(filter.userFilters.New)}>
						<p>Add New User</p>
					</Button>
				</MDBNavItem>
			</Menu>
		);
		// console.log("campaign list here: ", this.props.campaignList);
		// video menu: (non-admin)
		const videoMenu = this.props.isAdmin ? this.generateAdminVideoMenu() : this.generateUserVideoMenu();

		// campaign's menu
		const campaignMenu = (
			<Menu>
				<SubMenu defaultOpen={true} title="Filter Campaigns">
					<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.All}>
						<Button className="navbarModuleButtons" onClick={() => this.props.filterCampaigns(filter.campaignFilters.All)}>
							<p>All Campaigns</p>
						</Button>
					</MDBNavItem>
					<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.Active}>
						<Button className="navbarModuleButtons" onClick={() => this.props.filterCampaigns(filter.campaignFilters.Active)}>
							<p>Active Campaigns</p>
						</Button>
					</MDBNavItem>
					<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.Past}>
						<Button className="navbarModuleButtons" onClick={() => this.props.filterCampaigns(filter.campaignFilters.Past)}>
							<p>Past Campaigns</p>
						</Button>
					</MDBNavItem>
				</SubMenu>
				<MDBNavItem active={this.props.campaignMenu === filter.campaignFilters.New}>
					<Button className="navbarModuleButtons" onClick={() => this.props.filterCampaigns(filter.campaignFilters.New)}>
						<p>Add New Campaign</p>
					</Button>
				</MDBNavItem>
			</Menu>
		);

		return (
			<div className="" style={{ position: "fixed", bottom: 0, left: 0, top: 0 }}>
				<ProSidebar width={270}>
					<Menu>
						<MenuItem></MenuItem>
						<MenuItem></MenuItem>
						<MenuItem></MenuItem>
					</Menu>
					{this.props.activeModule === nav.modules.user ? userMenu : <></>}
					{this.props.activeModule === nav.modules.video ? videoMenu : <></>}
					{this.props.activeModule === nav.modules.campaign ? campaignMenu : <></>}
				</ProSidebar>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
