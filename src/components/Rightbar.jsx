import { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import { AuthContext } from "../contexts/AuthContext/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import Intercept from "../util/refresh";

function Rightbar() {
  const { user, dispatch } = useContext(AuthContext);
  const [Followings, setFollowings] = useState([]);
  const username = user.email;
  const axiosJWT = axios.create();
  Intercept(axiosJWT);
  useEffect(() => {
    const getFollowings = async () => {
      try {
        console.log("trying to fetch followings")
        const FollowingsList = await axios.get(
          "/follow/followees/" + username,
            { headers: { Authorization: "Bearer " + user.accessToken } }
        );
        console.log(FollowingsList)
        setFollowings(FollowingsList.data.followees);
      } catch (e) {}
    };
    getFollowings();
  }, [username]);
  return (
    <RightbarContainer>
      <div className="rightbarWrapper">
        <span className="rightbarFollowingTitle">Followings</span>
        <div className="rightbarFollowings">
          {Followings.map((f) => (
            <div key={f.email} className="rightbarFollowing">
              <div className="rightbarfollowingLeft">
                <Link
                  style={{ textDecoration: "none", color: "#000000" }}
                  to={"/profile/" + f.email}
                >
                  <img
                    src={f.profileImage ? f.profileImage : "https://i.imgur.com/6VBx3io.png"}
                    alt=""
                    className="rightbarFollowingImg"
                  />
                </Link>
                <span className="rightbarFollowingName">{f.firstName}</span>
              </div>
              <div className="rightbarfollowingRight">
                <span
                  className="rightbarFollowingAction"
                  onClick={async () => {
                    await axiosJWT.post(
                      `/follow/unfollow`,
                      {
                        followerEmail: user.email,
                        followeeEmail: f.email,
                      },
                      {
                        headers: {
                          Authorization: "Bearer " + user.accessToken,
                        },
                      }
                    );
                    window.location.reload()
                    //dispatch({ type: "UNFOLLOW", payload: f.email });
                  }}
                >
                  UnFollow
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </RightbarContainer>
  );
}

const RightbarContainer = styled.div`
  width: 300px;
  height: calc(100vh - 63px);
  overflow: scroll;
  position: sticky;
  top: 51px;
  padding-left: 10px;
  overflow-x: hidden;
  ::-webkit-scrollbar {
    width: 3px;
  }
  ::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgb(192, 192, 192);
  }
  .rightbarWrapper {
    padding: 10px 10px;
  }
  .rightbarFollowingTitle {
    padding-left: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  .rightbarFollowings {
    display: flex;
    padding-top: 5px;
    flex-direction: column;
  }
  .rightbarFollowing {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 5px;
  }
  .rightbarfollowingLeft {
    display: flex;
    align-items: center;
  }
  .rightbarFollowingImg {
    padding-left: 5px;
  }
  .rightbarFollowingName {
    padding-left: 10px;
  }
  .rightbarFollowingImg {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }
  .rightbarFollowingName {
    font-size: 15px;
    font-weight: bold;
  }
  .rightbarfollowingRight {
    display: flex;
  }
  .rightbarFollowingAction {
    font-size: 18px;
    color: rgb(0, 149, 246);
    cursor: pointer;
  }
  .rightbarFollowingAction:hover {
    font-size: 18px;
    font-weight: 500;
    color: rgb(0, 149, 246);
    cursor: pointer;
  }
  @media (max-width: 780px) {
    display: none;
  }
`;
export default Rightbar;
