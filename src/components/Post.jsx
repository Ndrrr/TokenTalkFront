import { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import Intercept from "../util/refresh";
import { FiMoreVertical } from "react-icons/fi";
import { AuthContext } from "../contexts/AuthContext/AuthContext";
import { AiFillHeart } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";
import Modal from "./UI/Modal";
import ShowPost from "./ShowPost";
import { NotificationManager } from "react-notifications";
import { format } from "timeago.js";
import Backdrop from "./UI/Backdrop";
import {baseBackUrl} from "../axios-conf";

function Post(props) {
  const postsUrl = baseBackUrl + "/posts/files";
  const post = props.post;
  post.likes = []; //TODO
  post.comments = []
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [Countcomments, setCountComments] = useState(0);

  const [showPost, setShowPost] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const axiosJWT = axios.create();
  Intercept(axiosJWT);
  useEffect(() => {
    setIsLiked(post.likes.includes(user.email));
  }, []);
  const deleteHandler = async () => {
    try {
      await axiosJWT.delete(`posts/${post.id}`, {
        headers: { Authorization: "Bearer " + user.accessToken },
      });
      NotificationManager.success("Success", "Post has been deleted", 3000);
      props.onChange(1);
    } catch (error) {
      NotificationManager.warning("Warning", "error", 3000);
    }
  };
  const likeHandler = async () => {
    try {
      await axiosJWT.get(`posts/${post.id}/like`, {
        headers: { Authorization: "Bearer " + user.accessToken },
      });
    } catch (error) {}

    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
  };
  const setcommentHandler = () => {
    setCountComments(Countcomments + 1);
  };
  const showMenuHandler = () => {
    setShowMenu(!showMenu);
  };

  return (
    <>
      {showMenu && <Backdrop onClose={showMenuHandler} />}
      {showPost && (
        <Modal
          onClose={() => {
            setShowPost(false);
          }}
        >
          <ShowPost post={post} newComment={setcommentHandler}></ShowPost>
        </Modal>
      )}
      <PostContainer>
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={"/profile/" + post.user.email}>
              <img
                src={post.user.profileImage}
                alt=""
                className="postProfileImg"
              />
            </Link>
            <Link
              style={{ textDecoration: "none", color: "#000000" }}
              to={"/profile/" + post.user.email}
            >
              <span className="postUsername">{post.user.firstName + " " + post.user.lastName}</span>
            </Link>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopright">
            <FiMoreVertical
              onClick={() => {
                setShowMenu(!showMenu);
              }}
            />
            {showMenu && (
              <div className="topRightPanel" onClick={deleteHandler}>
                Make Nft
              </div>
            )}
          </div>
        </div>
        <hr className="hrh" />
        <div className="postCenter">
          <p className="postText">{post.content}</p>
          <div className="postImgWrapper">
            {post.fileType === "IMAGE" ?
            <img
              src={post.fileId ? (`${postsUrl}/${post.fileId}`) :
                  "https://w0.peakpx.com/wallpaper/979/89/HD-wallpaper-purple-smile-design-eye-smily-profile-pic-face.jpg"}
              alt=""
              width={480}
              height={480}
              className="postImg"
            />
                :
                <video controls width={480} height={480}
                    src={ post.fileId ? `${postsUrl}/${post.fileId}` : ""} />
            }
          </div>
        </div>
        <hr className="hrh" />
        <div className="postBottom">
          <div className="postBottomLeft">
            <AiFillHeart
              onClick={likeHandler}
              className="likeIcon"
              color={isLiked ? "red" : "#e0e0e0ed"}
            />
            <span
              className="postLikeCounter"
              onClick={() => {
                setShowPost(true);
              }}
            >
              {likes} Likes {Countcomments} Comments
            </span>
          </div>
        </div>
      </PostContainer>
    </>
  );
}
const PostContainer = styled.div`
  width: 99%;
  border-radius: 10px;
  border: 1px solid rgb(211, 211, 211);
  -webkit-box-shadow: 0px 0px 16px -8px rgba(0, 0, 0, 0.68);
  box-shadow: 0px 0px 16px -8px rgba(0, 0, 0, 0.68);
  margin-top: 10px;
  margin-bottom: 50px;
  .postTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px;
  }
  .postTopright {
    position: relative;
  }
  .topRightPanel {
    position: absolute;
    background-color: #eaeaea;
    width: 80px;
    height: 30px;
    right: 5px;
    z-index: 60;
    border-radius: 5px;
    border: 1px solid rgb(211, 211, 211);
    -webkit-box-shadow: 0px 0px 16px -8px rgba(0, 0, 0, 0.68);
    box-shadow: 0px 0px 16px -8px rgba(0, 0, 0, 0.68);
    padding-top: 10px;
    text-align: center;
    &:hover {
      cursor: pointer;
    }
  }
  .postTopLeft {
    display: flex;
    align-items: center;
  }
  .postProfileImg {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
  .postUsername {
    font-size: 15px;
    font-weight: 500;
    padding: 0 10px;
  }
  .postDate {
    font-size: 10px;
    font-weight: 500;
  }
  .postImgWrapper {
    padding-right: 3px;
    padding-left: 3px;
  }
  .postImg {
    padding-top: 5px;
    width: 100%;
    object-fit: contain;
  }
  .postCenter {
    display: flex;
    flex-direction: column;
  }
  .postText {
    padding-top: 5px;
    padding-bottom: 3px;
    font-weight: 400;
    font-size: 15px;
    padding-left: 4px;
  }
  .postBottom {
    padding-top: 5px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 4px;
  }
  .postBottomLeft {
    display: flex;
    align-items: center;
    &:hover {
      cursor: pointer;
    }
  }
  .likeIcon {
    font-size: 30px;
    padding-right: 5px;
    cursor: pointer;
  }
  .postLikeCounter {
    font-size: 15px;
  }
  .hrh {
    opacity: 0.4;
  }
`;
export default Post;
