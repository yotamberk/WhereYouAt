import axios from 'axios';
import type { Person } from '../types';
import { MANAGERS, PEOPLE, ADMINS, SITE_OPTIONS } from '../consts';

const STATUS_OPTIONS = ['At Home', 'At Work', 'On Vacation', 'In Transit'];

export async function getPeopleData(userId: string) {
	const { data } = await axios.get(
		'https://person-management-b7hve6ftb9b6cfh8.westeurope-01.azurewebsites.net/users'
	);

	const [user, people] = (data as []).reduce(
		(acc: Person[][], person: Person) => {
			if (person.id === 'feb8bf9c-d2be-4f25-ad79-9d478af482a1') {
				acc[0].push(person);
				return acc;
			}
			acc[1].push(person);
			return acc;
		},
		[[], []]
	);

	return { user: user[0], people };
}
