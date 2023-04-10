import axios from "axios";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { NotificationManager } from "react-notifications";
import { AuthContext } from "../contexts/AuthContext/AuthContext";
import Intercept from "../util/refresh";
import {format} from "timeago.js";

function ShowPost(props) {
  const { user } = useContext(AuthContext);
  const [yourComment, setYourComment] = useState(null);
  const [comments, setComments] = useState([]);
  const axiosJWT = axios.create();
  Intercept(axiosJWT);
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const submitData = {};
      submitData.postId = props.post.id;
      submitData.content = yourComment;
      submitData.authorEmail = user.email;
      submitData.authorName = user.firstName + " " + user.lastName;
      await axiosJWT.post("comments", submitData, {
        headers: { Authorization: "Bearer " + user.accessToken },
      });
      const newComment = {};
      newComment.authorName = user.firstName + " " + user.lastName;
      newComment.userPicture = user.profilePicture;
      newComment.content = submitData.content;
      newComment.id = Math.random();
      props.post.comments = [newComment, ...props.post.comments];
      setComments((comments) => [newComment, ...comments]);
      NotificationManager.success("Success", "Comment has been created", 3000);
    } catch (error) {
      NotificationManager.error("Error", "Warning", 3000);
    }
  };
  useEffect(() => {
    props.post.comments?.sort((a, b) => { return new Date(b.createdAt) - new Date(a.createdAt) })
    console.log(props.post)
      setComments(props.post.comments ? props.post.comments : [])
  }, [props.post.id]);
  return (
    <ShowPostContainer>
      <div className="addComment">
        <input
          className="addCommentInput"
          placeholder="Your Comment !"
          type="text"
          onChange={(e) => setYourComment(e.target.value)}
        />
        <button className="addCommentButton" onClick={submitHandler}>
          Add Comment
        </button>
      </div>
      <div className="showComments">
        {comments.map((comment) => (
          <div key={comment.id} className="oneComment">
            <div className="pictureUserCommentWrapper">
              <img className="pictureUser" src="https://i.imgur.com/6VBx3io.png" alt="" />
            </div>
            <div className="usernameAndCommentWrapper">
              <span className="usernameComment">{comment.authorName}
                <span style={{fontSize: "10px" ,fontWeight: 500}}> {format(comment.createdAt)}</span>
              </span>
              <span className="Comment">{comment.content}</span>
            </div>
          </div>
        ))}
      </div>
    </ShowPostContainer>
  );
}
const ShowPostContainer = styled.div`
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .addComment {
    width: 100%;
    display: flex;
    justify-content: space-between;
    border: solid 1px #cecdcd;
    @media (max-width: 655px) {
      flex-direction: column;
    }
  }
  .addCommentInput {
    width: 70%;
    border: none;
    padding: 7px;
    border-radius: 5px;
    &:focus {
      outline: none;
    }
    @media (max-width: 655px) {
      width: 90%;
    }
  }
  .addCommentButton {
    border: none;
    padding: 7px;
    border-radius: 5px;
    background-color: #4a4b4b;
    color: white;
    margin: 5px;
  }
  .showComments {
    width: 100%;
    margin-top: 10px;
    height: 30vh;
    overflow-y: scroll;
    ::-webkit-scrollbar {
      width: 3px;
    }
    ::-webkit-scrollbar-track {
      background-color: #f1f1f1;
    }
    ::-webkit-scrollbar-thumb {
      background-color: rgb(192, 192, 192);
    }
  }
  .oneComment {
    display: flex;
    margin-bottom: 5px;
  }
  .usernameAndCommentWrapper {
    display: flex;
    flex-direction: column;
    margin-left: 5px;
    padding: 5px;
    border: solid 1px #cecdcd;
    border-radius: 10px;
    width: 100%;
  }
  .usernameComment {
    font-weight: bold;
  }
  .pictureUser {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }
`;
export default ShowPost;
