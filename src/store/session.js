import { createSlice } from "@reduxjs/toolkit";
import Cookies from "universal-cookie";
import { apiCall } from "./api";
import * as nav from "./globals/nav";
import * as filter from "./globals/filter";
// import conf from '../../config.js';

const initialState = {
	loading: false,
	loggedIn: false,
	activeModule: null,
	userFilter: filter.userFilters.All,
	campaignFilter: filter.campaignFilters.All,
	userData: {
		name: null,
		email: null,
		admin: false,
		key: null,
		bucketFolder: null,
	},
};

const cookies = new Cookies();

const slice = createSlice({
	name: "session",
	initialState,
	reducers: {
		onPageLoad: (state, action) => {
			/*
				when page loads, first of all we need to check if we are logged in or not
			*/
			let activeModule;
			// if not logged in
			if (!action.payload.success) {
				cookies.set("activeModule", nav.modules.login);
				activeModule = nav.modules.login;
				return {
					...state,
					loading: false,
					loggedIn: false,
					activeModule,
					userData: {},
				};
			}

			// if logged in
			activeModule = cookies.get("activeModule");

			if (!activeModule) {
				cookies.set("activeModule", nav.modules.video);
				activeModule = nav.modules.video;
			}

			let { name, email, admin, key, bucketFolder } = action.payload;
			if (activeModule === nav.modules.user && !admin) {
				activeModule = nav.modules.video;
				cookies.set("activeModule", nav.modules.video);
			}

			if (activeModule === nav.modules.campaign && admin) {
				activeModule = nav.modules.video;
				cookies.set("activeModule", nav.modules.video);
			}

			return {
				...state,
				loading: false,
				loggedIn: true,
				activeModule,
				userData: {
					name,
					email,
					admin,
					key,
					bucketFolder,
				},
			};
		},

		onLogin: (state, action) => {
			if (!action.payload.success) {
				return {
					...state,
					loading: false,
					loggedIn: false,
					userData: {},
				};
			}

			let { name, email, admin, key, bucketFolder } = action.payload;
			let activeModule = admin ? nav.modules.user : nav.modules.campaign;
			cookies.set("activeModule", activeModule);

			return {
				...state,
				loading: false,
				loggedIn: true,
				activeModule,
				userData: {
					name,
					email,
					admin,
					key,
					bucketFolder,
				},
			};
		},

		onLogout: (state, action) => {
			if (action.payload.success) {
				cookies.set("activeModule", nav.modules.login);
				return {
					loading: false,
					loggedIn: false,
					activeModule: nav.modules.login,
					userFilter: filter.userFilters.All,
					campaignFilter: filter.campaignFilters.All,
					userData: {
						name: null,
						email: null,
						admin: false,
						key: null,
						bucketFolder: null,
					},
				};
			}
			return state;
		},

		onNevigate: (state, action) => {
			// validate payload maybe
			if (!nav.validate(action.payload.to)) return state;
			// validate admin rights
			if (state.admin && !nav.validateAdminRight(action.payload.to)) return state;

			let activeModule = action.payload.to;
			cookies.set("activeModule", activeModule);

			return {
				...state,
				activeModule,
			};
		},

		onFetchUsers: (state, action) => {
			if (!action.payload.success) {
				return state;
			}
			return {
				...state,
				userPoolData: action.payload.users,
			};
		},

		onUserFilter: (state, action) => {
			return {
				...state,
				userFilter: action.payload.filter,
			};
		},

		onVideoFilter: (state, action) => {
			return {
				...state,
				albumUrl: action.payload.filter,
				albumName: action.payload.name,
			};
		},

		onCampaignFilter: (state, action) => {
			return {
				...state,
				campaignFilter: action.payload.filter,
			};
		},

		onFetchCampaigns: (state, action) => {
			if (!action.payload.success) {
				return state;
			}

			const campaignList = state.userData.admin
				? // admin part
				  action.payload.campaigns.map(
						// map on user
						(userCampaignData) => {
							return {
								name: userCampaignData.user,
								campaigns: userCampaignData.campaigns.map(
									// map on user's campaigns
									(campaignData) => {
										return {
											campaignName: campaignData.name,
											campaignUrl: campaignData.campaignURL,
										};
									}
								),
							};
						}
				  )
				: // user part
				  action.payload.campaigns;
			return {
				...state,
				campaignList,
			};
		},

		onFetchVideoList: (state, action) => {
			if (!action.payload.success) {
				return {
					...state,
					loading: false,
					albumList: undefined,
				};
			}

			return {
				...state,
				loading: false,
				albumList: action.payload.videos,
			};
		},

		onRemoveVideo: (state, action) => {
			if (!action.payload.success) {
				return {
					...state,
					loading: false,
				};
			}
			return {
				...state,
				loading: false,
				albumList: state.albumList.filter((album) => album.key !== action.payload.videoKey),
			};
		},

		onSelectAlbum: (state, action) => {
			return {
				...state,
				albumName: action.payload.albumName,
			};
		},

		onFetchVideoUrl: (state, action) => {
			if (!action.payload.success) {
				return {
					...state,
					loading: false,
				};
			}

			return {
				...state,
				loading: false,
				videoUrl: action.payload.videoUrl,
			};
		},

		onClearVideoUrl: (state, action) => {
			return {
				...state,
				loading: false,
			};
		},

		onToggleVideoAccess: (state, action) => {
			console.log(action);
			let key = action.payload.key;
			let access = action.payload.access;
			return {
				...state,
				loading: false,
				albumList: state.albumList.map((album) => {
					if (album.key === key) {
						return {
							...album,
							access,
						};
					} else return album;
				}),
			};
		},

		onWaitAction: (state, action) => {
			return {
				...state,
				loading: true,
			};
		},
	},
});

export const { onPageLoad, onLogin, onLogout, onFetchUsers, onNevigate, onExistingUserCheck } = slice.actions;
export const { onFetchCampaigns, onFetchVideoList, onFetchVideoUrl, onRemoveVideo, onClearVideoUrl, onSelectAlbum } = slice.actions;
export const { onCampaignFilter, onVideoFilter, onUserFilter, onToggleVideoAccess } = slice.actions;
export const { onWaitAction } = slice.actions;
export default slice.reducer;

let baseUrl;
if (window.env === "dev") {
	baseUrl = window.devURL;
} else {
	baseUrl = window.prodURL;
}

// Action creators
const usersUrl = baseUrl + "/users";
const loginUrl = usersUrl + "/login";
const otpUrl = usersUrl + "/otp";
const passResetUrl = usersUrl + "/passwordReset";
const registerUrl = usersUrl + "/register";
const campaignsUrl = baseUrl + "/campaigns";
const videosUrl = baseUrl + "/videos";

const pageLoadUrl = usersUrl + "/getSessionUser";
const logoutUrl = usersUrl + "/logout";
const fetchUsersUrl = usersUrl + "/getAllUsers";
const updateUserUrl = usersUrl + "/updateUser";
const removeUserUrl = usersUrl + "/removeUser";
const addUserUrl = usersUrl + "/addUser";
const existingUserUrl = usersUrl + "/userExists";

const headersFileUpl = { "Content-Type": undefined };
const headers = { "Content-Type": "application/json" };
const methods = {
	get: "GET",
	put: "PUT",
	post: "POST",
	delete: "DELETE",
};

// login, register, password-reset and session
// export const loginAction = (email, password, cb) =>
// 	apiCall({
// 		url: loginUrl,
// 		callParams: {
// 			method: methods.post,
// 			headers,
// 			credentials: "include",
// 			body: JSON.stringify({
// 				email,
// 				password,
// 			}),
// 		},
// 		cb,
// 		onSuccess: onLogin.type,
// 		onFailure: onLogin.type,
// 	});

export const loginAction = (email, password, cb) =>
	apiCall({
		url: loginUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				email,
				password,
			}),
		},
		cb,
		onSuccess: onLogin.type,
		onFailure: onLogin.type,
	});

export const registerAction = (newUser, cb) =>
	apiCall({
		url: registerUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				newUser,
			}),
		},
		cb,
	});

export const otpAction = (email, cb) =>
	apiCall({
		url: otpUrl + "/" + email,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		cb,
	});

export const passwordResetAction = (email, otp, password, cb) =>
	apiCall({
		url: passResetUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				email,
				otp,
				password,
			}),
		},
		cb,
	});

export const pageLoadAction = () =>
	apiCall({
		url: pageLoadUrl,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		onSuccess: onPageLoad.type,
		onFailure: onPageLoad.type,
	});

export const logoutAction = () =>
	apiCall({
		url: logoutUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
		},
		onSuccess: onLogout.type,
		onFailure: onLogout.type,
	});

// users
export const fetchUsersAction = () =>
	apiCall({
		url: fetchUsersUrl,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		onSuccess: onFetchUsers.type,
		onFailure: onFetchUsers.type,
	});

export const updateUserAction = (userEmail, updatedUser) =>
	apiCall({
		url: updateUserUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				updatedUser,
				userEmail,
			}),
		},
		onSuccess: onFetchUsers.type,
		onFailure: onFetchUsers.type,
	});

export const removeUserAction = (removedUser) =>
	apiCall({
		url: removeUserUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				removedUser,
			}),
		},
		onSuccess: onFetchUsers.type,
		onFailure: onFetchUsers.type,
	});

export const addUserAction = (newUser, cb) =>
	apiCall({
		url: addUserUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				newUser,
			}),
		},
		cb,
		onSuccess: onFetchUsers.type,
	});

export const existingUserAction = (email, cb) => {
	const existingUserCheckURL = existingUserUrl + "/" + email;
	return apiCall({
		url: existingUserCheckURL,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		cb,
	});
};

// navigation and filtering
export const navigate = (to) => onNevigate({ to });

export const userFilter = (filter) => onUserFilter({ filter });

export const campaignFilter = (filter) => onCampaignFilter({ filter });

export const videoFilter = (filter, name) => onVideoFilter({ filter, name });

export const setActiveAlbumName = (albumName) => onSelectAlbum({ albumName });

export const enableOverlay = () => onWaitAction({});

// video module loading
export const fetchVideoListAction = (albumUrl) => {
	const fetchVideoListUrl = campaignsUrl + "/getCampaignVideosListWTags/" + albumUrl;
	return apiCall({
		url: fetchVideoListUrl,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		onSuccess: onFetchVideoList.type,
		onFailure: onFetchVideoList.type,
	});
};

export const removeVideoAction = (videoKey) => {
	const removeVideoURL = campaignsUrl + "/removeCampaignVideo/" + videoKey.replace("/", "$");
	return apiCall({
		url: removeVideoURL,
		callParams: {
			method: methods.delete,
			headers,
			credentials: "include",
		},
		onSuccess: onRemoveVideo.type,
		onFailure: onRemoveVideo.type,
	});
};

export const clearVideoAction = () => onClearVideoUrl({});

export const toggleVideoAccess = (videoKey, currentLevel, cb) => {
	const videoAccessChangeURL = videosUrl + (currentLevel === "public" ? "/setPrivate/" : "/setPublic/") + videoKey;
	return apiCall({
		url: videoAccessChangeURL,
		callParams: {
			method: methods.put,
			headers,
			credentials: "include",
		},
		cb,
		onFailure: onRemoveVideo.type,
	});
};

export const toggleVideoAccessLocalAction = (videoKey, newAccessLevel) => onToggleVideoAccess({ key: videoKey, access: newAccessLevel });

// campaigns
export const fetchCampaignAction = (userEmail) => {
	const fetchCampaignUrl = campaignsUrl + "/getUserCampaigns/" + userEmail;
	return apiCall({
		url: fetchCampaignUrl,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		onSuccess: onFetchCampaigns.type,
		onFailure: onFetchCampaigns.type,
	});
};

export const updateCampaignAction = (campaignURL, updatedCampaign) => {
	const updateCampaignUrl = campaignsUrl + "/updateCampaign/" + campaignURL;
	return apiCall({
		url: updateCampaignUrl,
		callParams: {
			method: methods.put,
			headers,
			credentials: "include",
			body: JSON.stringify({
				updatedCampaign,
			}),
		},
		onSuccess: onFetchCampaigns.type,
		onFailure: onFetchCampaigns.type,
	});
};

export const uploadMailListAction = (campaignURL, file) => {
	const uploadMailListUrl = campaignsUrl + "/setMailingList/" + campaignURL;

	const data = new FormData();
	data.append("file", file);

	return apiCall({
		url: uploadMailListUrl,
		callParams: {
			method: methods.put,
			headersFileUpl,
			credentials: "include",
			body: data,
		},
	});
};

export const removeCampaignAction = (campaignURL, cb) => {
	const removeCampaignUrl = campaignsUrl + "/removeCampaign/" + campaignURL;
	return apiCall({
		url: removeCampaignUrl,
		callParams: {
			method: methods.delete,
			headers,
			credentials: "include",
		},
		cb,
	});
};

export const addCampaignAction = (newCampaign, cb) => {
	const addCampaignUrl = campaignsUrl + "/addCampaign";
	return apiCall({
		url: addCampaignUrl,
		callParams: {
			method: methods.post,
			headers,
			credentials: "include",
			body: JSON.stringify({
				newCampaign,
			}),
		},
		cb,
		onSuccess: onFetchCampaigns.type,
	});
};

export const existingCampaignAction = (campaignURL, cb) => {
	const existingCampaignCheckURL = campaignsUrl + "/campaignURLExists/" + campaignURL;
	return apiCall({
		url: existingCampaignCheckURL,
		callParams: {
			method: methods.get,
			headers,
			credentials: "include",
		},
		cb,
	});
};
