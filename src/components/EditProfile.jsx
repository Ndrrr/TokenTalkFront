import React, { useContext, useState } from "react";
import styled from "styled-components";
import Intercept from "../util/refresh";
import { AuthContext } from "../contexts/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { NotificationManager } from "react-notifications";
import {baseFrontUrl} from "../axios-conf";
function EditProfile(props) {
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);
  const [description, setDescription] = useState('');
  const [file, setFile] = useState();
  const [picture, setPicture] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');

  const onNewPasswordChange = (e) => {
    setNewPassword(e.target.value);

    if((e.target.value === '' && passwordConfirm === '' ) || (e.target.value===null && passwordConfirm===null)) {
      setPasswordError('')
      return
    }

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
    if (e.target.value !== newPassword && !(newPassword === '' && e.target.value === '' )) {
      setPasswordConfirmError("Passwords do not match");
    } else {
      setPasswordConfirmError("");
    }
  }


  const axiosJWT = axios.create();
  Intercept(axiosJWT);
  const EditHandler = async (e) => {
    e.preventDefault();

    e.currentTarget.disabled = true;
    const UpdateData = { description, password, newPassword };
    try {
      // const formDataFile = new FormData();
      // if (file) {
      //   formDataFile.append("file", file);
      //   formDataFile.append("upload_preset", "raw8ntho");
      //   const img = await axios.post(
      //     "https://api.cloudinary.com/v1_1/YOUR_UPLOAD_PRESET/image/upload",
      //     formDataFile
      //   );
      //   UpdateData.profilePicture = img.data.secure_url;
      // }
      if (passwordError === '' && passwordConfirmError === '') {
        const res = await axiosJWT.post(
            `/profile/update`,
            UpdateData,
            {
              headers: {Authorization: "Bearer " + user.accessToken},
            }
        );
        dispatch({type: "UPDATE_DATA", payload: res.data.user});
        props.onClose();
        navigate(`/profile/${username}`);
      }
    } catch (error) {
      NotificationManager.error(error.response.data.message, "Warning", 3000);
      props.onClose();
    }
  };
  return (
    <EditProfileContainer>
      <div className="editProfileWrapper">
        <div className="editProfileLeft">
          {/*<label className="fileupload" htmlFor="file">*/}
          {/*  <img*/}
          {/*    src={*/}
          {/*      picture*/}
          {/*        ? picture*/}
          {/*        : baseFrontUrl + "/image/defaultavatar.png"*/}
          {/*    }*/}
          {/*    alt=""*/}
          {/*    className="editProfileLeftImg"*/}
          {/*  />*/}
          {/*  <span className="shareOptionText">Choose Picture</span>*/}
          {/*  <input*/}
          {/*    style={{ display: "none" }}*/}
          {/*    type="file"*/}
          {/*    id="file"*/}
          {/*    accept=".png,.jpeg,.jpg"*/}
          {/*    onChange={(e) => {*/}
          {/*      setFile(e.target.files[0]);*/}
          {/*      setPicture(URL.createObjectURL(e.target.files[0]));*/}
          {/*    }}*/}
          {/*  />*/}
          {/*</label>*/}
        </div>
        <div className="editProfileRight">
          <form className="editProfileBox">
            <div className="editProfileBoxInput">
              <label htmlFor={"id-description"} style={{marginRight:"5px"}}>Bio: </label>

              <input
                  id={"id-description"}
                  type="textarea"
                  className="BoxInput"
                  placeholder="Bio"
                  onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="editProfileBoxInput">
              <label htmlFor={"id-password"} style={{marginRight:"5px"}}>Old Password: </label>
              <input
                  id={"id-password"}
                  type="password"
                  className="BoxInput"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="editProfileBoxInput">
              <label htmlFor={"id-new-password"} style={{marginRight:"5px"}}>New Password: </label>

              <input
                  id={"id-new-password"}
                  type="password"
                  className="BoxInput"
                  placeholder="New Password"
                  onChange={onNewPasswordChange}
              />
              <p className={'text-danger'} style={{fontSize: "0.8rem"}} dangerouslySetInnerHTML={{ __html:passwordError}}></p>
            </div>
            <div className="editProfileBoxInput">
              <label htmlFor={"id-confirm-password"} style={{marginRight:"5px"}}>Confirm Password: </label>
              <input
                  id={"id-confirm-password"}
                  type="password"
                  className="BoxInput"
                  placeholder="PasswordConfirm"
                  onChange={onPasswordConfirmChange}
              />
              <p className={"text-danger"}>{passwordConfirmError}</p>

            </div>
            <div className="editProfileBoxInput">
              <button className="editProfileButton" onClick={EditHandler}>
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </EditProfileContainer>
  );
}

const EditProfileContainer = styled.div`
  padding: 9px;

  .editProfileLeftImg {
    width: 150px;
    display: block;
  }
  .editProfileWrapper {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
  }
  .editProfileBox {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    background-color: white;
    padding: 20px;
  }
  .editProfileBoxInput {
    padding-bottom: 10px;
  }
  .BoxInput {
    height: 30px;
    border-radius: 5px;
    border: 1px solid gray;
    font-size: 18px;
    padding-left: 10px;
  }
  .editProfileButton {
    height: 30px;
    border-radius: 10px;
    border: none;
    background-color: black;
    color: white;
    font-size: 16px;
    padding: 0 20px;
    cursor: pointer;
  }
  .shareOptionText {
    height: 20px;
    border-radius: 10px;
    border: none;
    background-color: #3b3b3b;
    color: white;
    font-size: 16px;
    padding: 0 20px;
    cursor: pointer;
  }
  .fileupload {
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }
`;

export default EditProfile;
