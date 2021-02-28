import * as actions from "../api";

/*
	Required:
	-	url
	-	method
	-	headers
	-	body
	-	onSuccess
	-	onFailure
*/

const debug = false;

const api = (state) => (next) => async (action) => {
	let { dispatch } = state;
	log("action", action);
	if (action.type !== actions.apiCall.type) return next(action);

	const { onSuccess, onFailure, url, callParams, cb } = action.payload;
	log("url", action.payload.url);

	fetch(url, { ...callParams })
		.then((response) => response.json())
		.then((response) => {
			log("response", response);
			if (cb && typeof cb === "function") {
				cb(response);
			}
			if (onSuccess) dispatch({ type: onSuccess, payload: response });
		})
		.catch((err) => {
			// dispatch(actions.apiCallFailure(err));
			log("error", err);
			if (onFailure) {
				dispatch({ type: onFailure, payload: err });
			}
		});
};

function log(type, data) {
	if (debug) console.log("MIDDLEWARE<API> -> " + type + ": ", data);
}

export default api;
