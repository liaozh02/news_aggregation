class Auth {
    static authenticateUser(token, email, name) {
        localStorage.setItem('token', token);
        localStorage.setItem('email', email);
        localStorage.setItem('name', name);
    }

    static isUserAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    static deauthenticateUser(token, email, name) {
        localStorage.removeItem('token', token);
        localStorage.removeItem('email', email);
        localStorage.removeItem('name', name);
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getEmail() {
        return localStorage.getItem('email');
    }

    static getName() {
        return localStorage.getItem('name');
    }
}
export default Auth;