import React from "react";
import { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { NotificationManager } from "react-notifications";
import TokenTalkLogo from "../../assets/images/tokentalklogo-transparent.png";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [password, setPassword] = useState();
  const [passwordConfirm, setPasswordConfirm] = useState();

  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');

  const onPasswordChange = (e) => {
    setPassword(e.target.value);

    if (!e.target.value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)) {
      let errorMsg = `Password must contain`;
      if (!e.target.value.match(/^(?=.*\d)/gm)) {
        errorMsg += ` <li>at least one number</li>`;
      }
      if (!e.target.value.match(/^(?=.*[a-z])/gm)) {
        errorMsg += ` <li>at least one lowercase letter</li>`;
      }
      if (!e.target.value.match(/^(?=.*[A-Z])/gm)) {
        errorMsg += ` <li>at least one uppercase letter</li>`;
      }
      if (!e.target.value.match(/^(?=.*[@$!%*?&])/gm)) {
        errorMsg += ` <li>at least one special character</li>`;
      }
      if (!e.target.value.match(/^(?=.{8,})/gm)) {
        errorMsg += ` <li>at least 8 characters</li>`;
      }
      setPasswordError(errorMsg);
    } else {
      setPasswordError('');
    }
  }

  const onPasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    if (e.target.value !== password) {
      setPasswordConfirmError("Passwords do not match");
    } else {
      setPasswordConfirmError("");
    }
  }

  const registerHandler = async (e) => {
    e.preventDefault();
    const data = { email, firstName ,lastName, password };
    try {
      await axios.post("/auth/register", data);
      navigate("/login");
    } catch (error) {
      NotificationManager.error(error.response.data.message, "Warning", 3000);
    }
  };
  return (
    <SignupContainer>
      <div className="signupWrapper">
        <div className="signupRight">
          <div className="signupRightTop">
            <div className="signupRightTopTop">
              <span className="signupRightTopLogo"><img src={TokenTalkLogo}/></span>
            </div>
            <div className="signupRightTopForm">
              <form action="" className="signupBox" onSubmit={registerHandler}>
                <input
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    placeholder="First Name"
                    type="text"
                    required
                    className="signupInput"
                />
                <input
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                  placeholder="Last Name"
                  type="text"
                  required
                  className="signupInput"
                />
                <input
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="Email"
                  autoFocus={true}
                  type="email"
                  required
                  className="signupInput"
                />
                <input
                  onChange={onPasswordChange}
                  placeholder="Password"
                  type="password"
                  required
                  minLength="8"
                  className="signupInput"
                />
                <p className={'text-danger'} style={{fontSize: "0.8rem"}} dangerouslySetInnerHTML={{ __html:passwordError}}></p>
                <input
                    onChange={onPasswordConfirmChange}
                    placeholder="Confirm Password"
                    type="password"
                    required
                    minLength="8"
                    className="signupInput"
                />
                <p className={"text-danger"} style={{fontSize: "0.8rem"}}>{passwordConfirmError}</p>
                <button className="signupButton">Sign Up</button>
              </form>
            </div>
          </div>
          <div className="signupRightBottom">
            <center>
              <span>have an account? </span>
              <Link to="/login" style={{ textDecoration: "none" }}>
                <span
                  className="SignUptext"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Log in
                </span>
              </Link>
            </center>
          </div>
        </div>
      </div>
    </SignupContainer>
  );
}

const SignupContainer = styled.div`
  width: 100vw;
  display: flex;
  margin-top: 100px;
  justify-content: center;
  .signupRight {
    flex: 1;
    display: flex;
    height: max-content;
    justify-content: center;
    flex-direction: column;
    max-width: 360px;
    border: 1px solid #d6d6d6;
    padding: 10px;
    @media (max-width: 877px) {
      justify-content: center;
    }
  }
  .signupWrapper {
    width: 100%;
    height: 70%;
    display: flex;
    justify-content: center;
  }
  .signupRightWrapper {
    width: 360px;
    border: 1px solid rgb(224, 224, 224);
    border-radius: 3px;
    padding-bottom: 10px;
  }

  .signupRightTop {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .signupRightTopTop {
    display: flex;
    width: 100%;
    justify-content: center;
    margin: 35px 0;
  }
  .signupRightTopLogo {
    font-family: "Dancing Script", cursive;
    font-size: 60px;
    font-weight: bold;
  }
  .signupRightTopForm {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  .signupBox {
    display: flex;
    align-items: center;
    flex-direction: column;
    width: 70%;
    padding-bottom: 20px;
  }
  .signupInput {
    height: 30px;
    width: 100%;
    border-radius: 5px;
    border: 1px solid gray;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 5px;
    padding-right: 5px;
  }
  .signupButton {
    margin-top: 10px;
    width: 100%;
    height: 25px;
    background-color: #0095f6;
    color: white;
    border-radius: 5px;
    border: none;
    font-size: 15px;
    cursor: pointer;
  }
  .SignUptext {
    color: #0095f6;
    font-weight: 500;
  }
`;
export default Signup;
