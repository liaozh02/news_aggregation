import React, {PropTypes} from "react";
import SignupForm from "./SignupForm";
import Auth from "../Auth/Auth";

const config = require('../../../../config/config.json');
class SignupPage extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            errors:{},
            userInfo: {
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                confirm_password: ""
            }
        };
        this.processForm = this.processForm.bind(this);
        this.changeUserInfo = this.changeUserInfo.bind(this);
    }

    processForm(event) {
        event.preventDefault();
        const email = this.state.userInfo.email;
        const password = this.state.userInfo.password;
        const firstname = this.state.userInfo.first_name;
        const lastname = this.state.userInfo.last_name;
        const confirm_password = this.state.userInfo.confirm_password;
        console.log(email + ": " + password);
        if (password !== confirm_password) {
            console.log("password not match with confirm_password");
            return;
        }
        const domain = config.webServer.domain;
        const port = config.webServer.port;
        const url = "http://" + domain + ":" + port + "/auth/signup";
        fetch(url, {
            method: 'POST',
            cache: false,
            headers: {
                'accept': 'application/json',
                'content-type':'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                firstname: firstname,
                lastname: lastname
            })
        }).then(response => {
            if (response.status === 200) {
                console.log("signup successful");
                this.setState({
                    errors: {}
                });
                response.json().then((json) => {
                    Auth.authenticateUser(json.token, email, json.data);
                    this.context.router.replace('/');
                });
            
            }
            else {
                console.log("signup failed");
                response.json().then((json) => {
                    const errors = json.errors? json.errors:{};
                    errors.summary = json.message;
                    this.setState({errors});
                });
            }
        })
    }

    changeUserInfo(event) {
        const field = event.target.name;
        const userInfo = this.state.userInfo;
        userInfo[field] = event.target.value;
        this.setState({userInfo});

        if(this.state.userInfo.password !== this.state.userInfo.confirm_password) {
            const errors = this.state.errors;
            errors.password = "Password and Confirm Password not match";
            this.setState({errors});
        } else{
            const errors = this.state.errors;
            errors.password = "";
            this.setState({errors});
        }
    } 

    render(){
        return (
            <SignupForm
                onSubmit={this.processForm}
                onChange={this.changeUserInfo}
                errors={this.state.errors}
                userInfo={this.state.userInfo}
            />
        )
    }   
}

SignupPage.contextTypes = {
    router: PropTypes.object.isRequired
}
export default SignupPage;