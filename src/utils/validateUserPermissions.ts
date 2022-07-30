interface UserType {
	permissions: string[];
	roles: string[];
}

interface ValidateUserPermissionsProps {
	user: UserType;
	permissions?: string[];
	roles?: string[];
}

export const validateUserPermissions = ({
	user,
	permissions = [],
	roles = [],
}: ValidateUserPermissionsProps) => {
	if (permissions.length > 0) {
		const hasAllPermissions = permissions.every((item) =>
			user.permissions?.includes(item)
		);

		if (!hasAllPermissions) return false;
	}

	if (roles.length > 0) {
		const hasAllRoles = roles.some((item) => user.roles?.includes(item));

		if (!hasAllRoles) return false;
	}

	return true;
};
