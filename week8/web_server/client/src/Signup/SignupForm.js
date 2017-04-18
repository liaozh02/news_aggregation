import React, {PropTypes} from 'react'
import './SignupForm.css'

const SignupForm = ({
    onSubmit,
    onChange,
    errors,
    userInfo,
}) => (
    <div className="container">
    <div className="signup-panel">
        <form className="col s12" action="/" onSubmit={onSubmit}>
            <div className="row center">
                <div className="input-field col s6">
                    <input placeholder="First Name" id="first_name" type="text" name="first_name" required onChange={onChange}/>
                    <label htmlFor="fist_name">First Name</label>
                </div>
                <div className="input-field col s6">
                    <input placeholder="Last Name" id="last_name" name="last_name" type="text" required onChange={onChange}/>
                    <label htmlFor="last_name">Last Name</label>
                </div>
            </div>
            {errors.email && <p className="error-message">{errors.email}</p>}
            <div className="row">
                <div className="input-field col s12">
                    <input id="email" type="email" name="email" required onChange={onChange}/>
                    <label htmlFor="email">Email</label>
                </div>
            </div>
             <div className="row">
                <div className="input-field col s12">
                    {errors.password && <p className="error-message">{errors.password}</p>}
                    <input id="password" type="password" name="password" required onChange={onChange}/>
                    <label htmlFor="passworld">Password</label>
                </div>
            </div>
            <div className="row">
                <div className="input-field col s12">
                    <input id="confirm-password" type="password" name="confirm_password" required onChange={onChange}/>
                    <label htmlFor="confirm-passworld">Confirm Password</label>
                   
                </div>
            </div>
            <div className="row">
                <button className="btn col s12 waves-effect waves-light blue lighten-2" type="submit" name="action">Sign Up</button>
            </div>
        </form>
    </div> 
    </div>
);

SignupForm.prototype = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    userInfo:  PropTypes.object.isRequired
};

export default SignupForm;