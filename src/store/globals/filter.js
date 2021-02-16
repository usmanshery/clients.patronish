export const userFilters = {
	All: "All",
	Active: "Active",
	Inactive: "Inactive",
	New: "New"
}

export const campaignFilters = {
	All: "All",
	Active: "Active",
	Past: "Past",
	New: "New"
}

export const videoFilters = {
	videostuff: 'videostuff'
}


export const validateEmail = (mail) => {
	if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
		return true;
	}
	return false;
}