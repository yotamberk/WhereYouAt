import { useState, useEffect } from 'react';
import { ADMINS, MANAGERS, PEOPLE, SITE_OPTIONS } from '../../consts';
import * as XLSX from 'xlsx';
import PersonCard from './components/PersonCard';
import { useQueryClient } from '@tanstack/react-query';
import {
	usePeopleData,
	useUserSite,
	useUpdateUserSite,
} from '../../hooks/useQueries';
import TopBar from './components/TopBar';
import { Stack } from '@mui/material';

function getUserRole(userId: string) {
	if (ADMINS.includes(userId)) return 'admin';
	if (MANAGERS.some((m) => m.id === userId)) return 'manager';
	if (PEOPLE.includes(userId)) return 'person';
	return null;
}

export default function WhereYouAt() {
	const [userId, setUserId] = useState('');
	const [selected, setSelected] = useState('');
	const queryClient = useQueryClient();

	useEffect(() => {
		const id = localStorage.getItem('login_token') || '';
		setUserId(id);
	}, []);

	const { data: userSite, isLoading: userSiteLoading } = useUserSite(userId);
	const { data: sortedPeople, isLoading: peopleLoading } =
		usePeopleData(userId);

	const updateUserSiteMutation = useUpdateUserSite();

	const role = getUserRole(userId);

	const handleSiteChange = async (newSite: string) => {
		setSelected(newSite);
		await updateUserSiteMutation.mutateAsync({
			userId,
			currentSite: newSite,
		});
	};

	return (
		<Stack direction="column" alignItems="center" minWidth="40vw" gap={2}>
			<TopBar />
			{!!sortedPeople?.user && !peopleLoading && (
				<PersonCard person={sortedPeople.user} isUser />
			)}
		</Stack>
	);
}
