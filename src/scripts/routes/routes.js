import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';

const routes = {
  '/': HomePage, 
  '/home': HomePage,
  '/about': AboutPage,
  '/login': LoginPage,
  '/register': RegisterPage,
};

export default routes;