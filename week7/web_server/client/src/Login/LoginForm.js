import React, {PropTypes} from 'react'
import './LoginForm.css'

const LoginForm = ({
    onSubmit,
    onChange,
    errors,
    userInfo,
}) => (
    <div className="container">
    <div className="login-panel">
        <form className="col s12" action="/" onSubmit={onSubmit}>
            {errors.summary && <p className="error-message">{errors.summary}</p>}
            <div className="row">
                <div className="input-field col s12">
                    <input id="email" type="email" name="email" required onChange={onChange}/>
                    <label htmlFor="email">Email</label>
                </div>
            </div>
             <div className="row">
                <div className="input-field col s12">
                    <input id="password" type="password" name="password" required onChange={onChange}/>
                    <label htmlFor="passworld">Password</label>
                </div>
            </div>
            <div className="row">
                <button className="btn col s12 waves-effect waves-light blue lighten-2" type="submit" name="action">Log In</button>
            </div>
        </form>
    </div> 
    </div>
);

LoginForm.prototype = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    userInfo:  PropTypes.object.isRequired
};

export default LoginForm;