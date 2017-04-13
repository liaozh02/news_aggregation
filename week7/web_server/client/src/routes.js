import Base from './Base/Base';
import App from './App/App';
import Auth from './Auth/Auth';

const routes = [
    { path: '/',
      getComponent: (location, callback) => {
        if (Auth.isUserAuthenticated()) {
            console.log("authenticated")
            callback(null, App);
        }
        else {
            console.log("not authenticated")
            callback(null, Base);
        }
      }
    },

    { path: '/login',
      component: Base    
    },

    { path: '/signup',
      component: Base    
    },

    { path: '/logout',
        onEnter: (nextState, replace) => {
        Auth.deauthenticateUser();
        // change the current URL to /
        replace('/');
    }
}    
]

export default routes;