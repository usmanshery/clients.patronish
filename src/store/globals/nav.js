export const modules = {	
	user: 'user',
	video: 'video',
	campaign: 'campaign',
	passwordReset: 'passwordReset',
	login: 'login',
	register: 'register'
}

const adminModules = [
	'user'
]

export const validate = (to) => {
	return to in modules;
}

export const validateAdminRight = (to) => {
	return adminModules.includes(to);
}