import React, { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

import type { Person } from '../../../../types';
import { getPerson } from '~/clients/personsClient';
import { usePostMoveStatus, useUpdateMoveStatus } from '~/hooks/useQueries';

const MoveAction = ({
	person,
	onClose,
}: {
	person: Person;
	onClose: () => void;
}) => {
	const { id, site, transaction } = person;
	const [origin, setOrigin] = useState(site);
	const [target, setTarget] = useState('');
	const [permissions, setPermissions] = useState({
		isOriginManager: false,
		isTargetManager: false,
		isHrManager: false,
		isPersonnelManager: false,
	});

	const postMoveStatusMutation = usePostMoveStatus();
	const updateMoveStatusMutation = useUpdateMoveStatus();

	// Load permissions on component mount
	React.useEffect(() => {
		const loadPermissions = async () => {
			const userId = localStorage.getItem('login_token') || '';
			const user = await getPerson(userId);
			const newPermissions = {
				isOriginManager: false,
				isTargetManager: false,
				isHrManager: false,
				isPersonnelManager: false,
			};

			if (transaction) {
				user.personRoles?.forEach(({ role }) => {
					if (userId === person.manager?.id)
						newPermissions.isPersonnelManager = true;
					if (role.name === 'hrManager' || role.name === 'admin')
						newPermissions.isHrManager = true;
					if (role.name === 'siteManager') {
						if (
							role?.opts.some(
								(siteToManage: string) => siteToManage === transaction.origin
							)
						) {
							newPermissions.isOriginManager = true;
						}
						if (
							role?.opts.some(
								(siteToManage: string) => siteToManage === transaction.target
							)
						) {
							newPermissions.isTargetManager = true;
						}
					}
				});
			}
			setPermissions(newPermissions);
		};

		loadPermissions();
	}, [person.manager, transaction]);

	const handleButtonClick = (event: SyntheticEvent) => {
		event.stopPropagation();
		postMoveStatusMutation.mutate(
			{ userId: id, origin, target },
			{
				onSuccess: () => {
					onClose();
				},
			}
		);
	};

	const handleConfirmButtonClick = (
		originator: string,
		event: SyntheticEvent
	) => {
		event.stopPropagation();
		updateMoveStatusMutation.mutate(
			{ userId: id, originator, status: true },
			{
				onSuccess: () => {
					onClose();
				},
			}
		);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>, setter: Function) => {
		const { value } = e.target;
		setter(value);
	};

	const isButtonDisabled = (originator: string) => {
		// Check if confirmation has already been made
		if (originator === 'origin' && transaction?.originConfirmation) return true;
		if (originator === 'target' && transaction?.targetConfirmation) return true;

		// Check permissions
		if (
			transaction?.origin === 'other' &&
			(!permissions.isPersonnelManager || !permissions.isOriginManager)
		)
			return false;
		if (
			transaction?.target === 'other' &&
			(!permissions.isPersonnelManager || !permissions.isTargetManager)
		)
			return false;
		if (
			originator === 'origin' &&
			(permissions.isOriginManager || permissions.isHrManager)
		)
			return false;
		if (
			originator === 'target' &&
			(permissions.isTargetManager || permissions.isHrManager)
		)
			return false;
		return true;
	};

	const isLoading =
		postMoveStatusMutation.isPending || updateMoveStatusMutation.isPending;

	// Check if we should show text inputs (no transaction or resolved transaction)
	const shouldShowTextInputs =
		!transaction || transaction.status === 'resolved';

	// Check if we should show confirmation buttons (pending transaction)
	const shouldShowConfirmationButtons =
		transaction && transaction.status === 'pending';

	return (
		<Stack spacing={3} sx={{ minWidth: 300 }}>
			<Typography variant="h6" component="h2" gutterBottom>
				Move Person
			</Typography>

			{shouldShowTextInputs && (
				<Stack spacing={2}>
					<TextField
						label="Origin"
						fullWidth
						value={origin}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							handleChange(e, setOrigin)
						}
					/>
					<TextField
						label="Target"
						fullWidth
						value={target}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							handleChange(e, setTarget)
						}
					/>
				</Stack>
			)}

			{shouldShowConfirmationButtons && (
				<Stack spacing={2}>
					<Typography variant="body2" color="text.secondary">
						Awaiting confirmation for move from {transaction.origin} to{' '}
						{transaction.target}
					</Typography>

					<Stack direction="row" spacing={2}>
						<Button
							variant="outlined"
							startIcon={<Check />}
							onClick={(e) => handleConfirmButtonClick('origin', e)}
							disabled={isButtonDisabled('origin') || isLoading}
							fullWidth
						>
							Origin Auth
						</Button>
						<Button
							variant="outlined"
							startIcon={<Check />}
							onClick={(e) => handleConfirmButtonClick('target', e)}
							disabled={isButtonDisabled('target') || isLoading}
							fullWidth
						>
							Target Auth
						</Button>
					</Stack>
				</Stack>
			)}

			<Stack direction="row" spacing={2} justifyContent="flex-end">
				<Button variant="outlined" onClick={onClose}>
					Cancel
				</Button>
				{shouldShowTextInputs && (
					<Button
						variant="contained"
						onClick={handleButtonClick}
						disabled={isLoading}
					>
						Submit
					</Button>
				)}
			</Stack>
		</Stack>
	);
};

export default MoveAction;
