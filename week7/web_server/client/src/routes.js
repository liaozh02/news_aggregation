import Base from './Base/Base';
import App from './App/App';
import Auth from './Auth/Auth';

const routes = {
    childRoutes: [
    { path: '/',
      
      component: Base,
    /*
        if (Auth.isUserAuthenticated()) {
            console.log("authenticated")
            callback(null, App);
        }
        else {
            console.log("not authenticated")
            callback(null, Base);
        }
      } */
      onEnter: (nextState, replace) => {
         if (Auth.isUserAuthenticated()) {
            console.log("Already authenticated.Load news")
            replace('/news')
        }
      }

    },
      
    { path: '/news',
      component: App    
    },

    { path: '/login',
      component: Base    
    },

    { path: '/signup',
      component: Base    
    },

    { path: '/logout',
        onEnter: (nextState, replace) => {
        console.log("logout");
        Auth.deauthenticateUser();
        // change the current URL to /
        replace('/');
      }
    }    
]}

export default routes;