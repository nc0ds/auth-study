import { validateUserPermissions } from '../utils/validateUserPermissions';
import { useAuth } from './useAuth';

interface UseCanProps {
	permissions?: string[];
	roles?: string[];
}

export const useCan = ({ permissions = [], roles = [] }: UseCanProps) => {
	const { user, isAuthenticated } = useAuth();

	if (!isAuthenticated) return false;

	const userHasValidPermissions = validateUserPermissions({
		user,
		permissions,
		roles,
	});

	return userHasValidPermissions;
};
