import React, { useEffect, useContext, useState } from "react";
import styled from "styled-components";
import { FiSettings } from "react-icons/fi";
import Topbar from "../Topbar";
import axios from "axios";
import { useParams } from "react-router-dom";
import Modal from "../UI/Modal";
import EditProfile from "../EditProfile";
import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import Intercept from "../../util/refresh";
import {baseBackUrl} from "../../axios-conf";
import {baseFrontUrl} from "../../axios-conf";
import {Button} from "react-bootstrap";
function Profile(props) {
  const postsUrl = baseBackUrl + "/posts/files";

  const email = useParams().email;
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [followed, setFollowed] = useState(false);
  const [showEditProfile, setshowEditProfile] = useState(false);
  const [selectedPost, setSelectedPost] = useState({id:0})

  const [user, setCurrentUser] = useState({
    followers: [],
    followees: [],
  });
  const axiosJWT = axios.create();
  Intercept(axiosJWT);
  const hideEditProfileHandler = () => {
    setshowEditProfile(false);
  };
  const showEditProfileHandler = (e) => {
    e.preventDefault();
    setshowEditProfile(true);
  };

  const deletePostHandler = async () => {

    try {
      await axiosJWT.delete(`posts/delete`, {
        headers: { Authorization: "Bearer " + currentUser.accessToken },
        data: {id: selectedPost.id, authorEmail: email}
      });
      setPosts(posts.filter((p) => p.id !== selectedPost.id));
    } catch (error) {}
  }
  const followHandler = async () => {
    try {
      if (followed) {
        await axiosJWT.post(
          `/follow/unfollow`,
          {
            "followeeEmail": user.email,
            "followerEmail": currentUser.email
          },
          {
            headers: { Authorization: "Bearer " + currentUser.accessToken },
          }
        );
        user.followers = user.followers.filter((f) => f.email !== currentUser.email);
      } else {
        await axiosJWT.post(
          `/follow`,
          {
            "followeeEmail": user.email,
            "followerEmail": currentUser.email
          },
          {
            headers: { Authorization: "Bearer " + currentUser.accessToken },
          }
        );
        user.followers.push(currentUser);
      }
      setFollowed(!followed);
    } catch (e) {}
  };
  useEffect(() => {
    const fetchUser = async () => {
      const user = await axios.get(
        "/profile?email=" + email,
          {
            headers: { Authorization: "Bearer " + currentUser.accessToken },
          }
      );

      const followers = await axios.get(
        "/follow/followers/" + email,
            {
                headers: { Authorization: "Bearer " + currentUser.accessToken },
            }
        );

      const followees = await axios.get(
          "/follow/followees/" + email,
          {
              headers: { Authorization: "Bearer " + currentUser.accessToken },
          }
      );
      user.data.followers = followers.data.followers;
      user.data.followees = followees.data.followees;
      setCurrentUser(user.data);
      console.log(user.data)
      let follows = false
      user.data.followers.forEach((f) => {
        if (f.email === currentUser.email) {
          follows = true
        }
      });
      setFollowed(follows)

      const pst = await axios.get(
        "/posts/all?authorEmails=" + email,
          {
            headers: { Authorization: "Bearer " + currentUser.accessToken },
          }
      );
      console.log(pst)
      setPosts(
        pst.data.posts.sort((p1, p2) => {
          return new Date(p2.createdAt) - new Date(p1.createdAt);
        })
      );
    };
    fetchUser();
  }, [email]);
  return (
    <>
      {showEditProfile && (
        <Modal onClose={hideEditProfileHandler}>
          <EditProfile onClose={hideEditProfileHandler} />
        </Modal>
      )}
      <Topbar
        rerenderFeed={props.rerenderFeed}
        onChange={props.onChange}
      ></Topbar>
      <ProfileContainer>
        <div className="profileWrapper">
          <div className="profilePicture">
            <img
              src={user.profileImage ? user.profileImage : "https://i.imgur.com/6VBx3io.png"}
              alt=""
              className="ProfilePictureImg"
            />
          </div>
          <div className="profileData">
            <div className="profileSettings">
              <span className="profileSettingsUsername">{user.email}</span>
              {currentUser.email === email ? (
                <>
                  <a
                    className="profileSettingsButton"
                    onClick={showEditProfileHandler}
                    href="/"
                  >
                    Edit profile
                  </a>

                  <FiSettings className="profileSettingsIcon" />
                </>
              ) : (
                <button
                  className="rightbarFollowButton"
                  onClick={followHandler}
                >
                  {followed ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
            <div className="profileInfo">
              <span className="profileInfoPost">
                <span className="profileInfoNum"></span>
                {posts.length} Posts
              </span>
              <span className="profileInfoFollowers">
                <span className="profileInfoNum"></span>
                {user.followers.length} followers
              </span>
              <span className="profileInfoFollowings">
                <span className="profileInfoNum"></span>
                {user.followees.length} followings
              </span>
            </div>
            <div className="profileBio">
              <span className="profileBioUsername">{user.username}</span>
              <span className="profileBioBio">{user.description ? user.description : 'lorem ipsum'}</span>
            </div>
            {currentUser.email === email && posts.length > 0 && (
              <div>
                <button className="btn-danger" onClick={deletePostHandler}>Delete Post</button>
              </div>
            )}
          </div>
        </div>
      </ProfileContainer>
      <ProfilePosts>
        <div className="postsWrapper">
          {posts.map((p) => (
            <div key={p.id}
                 className={`profilePostWrapper ${selectedPost.id === p.id ? 'selectedPost' : ''}`}
                 onClick={(e) => setSelectedPost(p)}>
              <div className="profilePost" style={{border: "1px solid black"}}>
                {p.fileType === "IMAGE" ?
                  <img
                    src={
                      p.fileId ? (`${postsUrl}/${p.fileId}`)
                        : baseFrontUrl + "/images/defaultpost.jpg"
                    }
                    alt=""
                    className="profilePostImg"
                  />
                    :
                    <video controls className="profilePostImg"
                           src={ p.fileId ? `${postsUrl}/${p.fileId}` : baseFrontUrl + "/images/defaultpost.jpg"} />
                }
              </div>
            </div>
          ))}
        </div>
      </ProfilePosts>
    </>
  );
}

const ProfileContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
  .profileWrapper {
    display: flex;
    width: 999px;
    @media (max-width: 655px) {
      flex-direction: column;
    }
  }
  .profilePicture {
    display: flex;
    justify-content: center;
    flex-grow: 1;
  }
  .ProfilePictureImg {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    @media (max-width: 655px) {
      width: 30vw;
      height: 30vw;
      border-radius: 50%;
      object-fit: cover;
    }
  }
  .profileData {
    flex-grow: 2;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    @media (max-width: 655px) {
      flex-basis: auto;
      padding: 10px;
      display: flex;
      align-items: flex-start;
      flex-direction: column;
    }
  }
  .profileSettings {
    display: flex;
    height: 30px;
    width: 100%;
    align-items: flex-end;
    @media (max-width: 655px) {
      padding-bottom: 5px;
    }
  }
  .profileSettingsUsername {
    width: 280px;
    font-size: 30px;
    font-weight: 300;
    @media (max-width: 655px) {
      font-size: 25px;
      width: 200px;
    }
  }
  .profileSettingsButton {
    display: block;
    font-size: 14px;
    border: 1px solid black;
    border-radius: 4px;
    text-decoration: none;
    padding: 5px 9px;
    box-sizing: border-box;
    color: black;
    cursor: pointer;
  }
  .profileSettingsButton:visited {
    text-decoration: none;
  }
  .profileSettingsIcon {
    padding-left: 10px;
    cursor: pointer;
    font-size: 28px;
  }
  .profileInfo {
    display: flex;
  }
  .profileInfoPost {
    padding-right: 30px;
  }
  .profileInfoFollowers {
    padding-right: 30px;
  }
  .profileInfoFollowings {
  }
  .profileInfoNum {
    font-weight: bold;
  }
  .profileBio {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  .profileBioUsername {
    font-size: 18px;
    font-weight: bold;
  }
  .profileBioBio {
    font-size: 15px;
    font-weight: 300;
    max-width: 400px;
    text-align: justify;
  }
  .rightbarFollowButton {
    margin-top: 30px;
    /* margin-bottom: 10px; */
    border: none;
    background-color: #1872f2;
    color: white;
    border-radius: 5px;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
  }

  .rightbarFollowButton:focus {
    outline: none;
  }
`;

const ProfilePosts = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
  .postsWrapper {
    display: flex;
    width: 999px;
    flex-wrap: wrap;
  }
  .profilePostWrapper {
    aspect-ratio: 1 / 1;
    flex-grow: 1;
    width: 33.33%;
    max-width: 33.33%;
    display: flex;
  }
  .profilePost {
    width: 100%;
    height: 100%;
    padding: 1%;
    justify-content: center;
  }
  .profilePostImg {
    width: 100%;
    height: 100%;
    object-fit: fill;
    display: block;
  }
  .selectedPost {
    border: 5px solid #1872f2;
  }
`;
export default Profile;
