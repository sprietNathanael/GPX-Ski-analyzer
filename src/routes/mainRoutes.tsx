import DashboardPage from 'views/Dashboard';
import Page404 from 'views/Page404';
import ErrorPage from 'views/PageError';

const mainRoutes = [
	{
		path: '/Error',
		component: ErrorPage,
	},
	{
		path: '/',
		component: DashboardPage,
	},
	{
		path: '*',
		component: Page404,
	},
];

export default mainRoutes;
