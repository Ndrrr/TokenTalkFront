import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AiOutlineSearch } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { BsPlusSquare } from "react-icons/bs";
import { AuthContext } from "../contexts/AuthContext/AuthContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
//import Modal from "../components/UI/Modal";
import Share from "./Share";
import Search from "./Search";
import axios from "axios";
import SearchBarMobile from "./SearchBarMobile";
import {Button, CloseButton, Modal} from "react-bootstrap";
import {useWeb3Data} from "../contexts/Web3AccountContext";

function Topbar(props) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { web3Account } = useWeb3Data();
  const [showMenu, setShowMenu] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [usersSearch, setUsersSearch] = useState([]);
  const [searchquery, setSearchquery] = useState("");
  const [showBarSearchMobile, setShowBarSearchMobile] = useState(false);
  const logoutHandler = async () => {
    // await axios.post("http:///user/logout", {
    //   refreshToken: user.refreshToken,
    // });
    localStorage.setItem("user", null);
    window.location.reload(false);
  };

  const disconnectWeb3AccountHandler = async () => {
    localStorage.removeItem("web3Account");
    window.location.reload(false);
  }

  const showBarSearchMobileHandler = () => {
    setShowBarSearchMobile(true);
  };
  const hideAddPostHandler = () => {
    setShowAddPost(false);
    props.onChange(1);
  };
  const hideAddPostWithBackdropHandler = () => {
    setShowAddPost(false);
  };
  const hideBarSearchMobileHandler = () => {
    setShowBarSearchMobile(false);
    setShowSearch(false);
  };
  const searchHandler = (e) => {
    if (searchquery.length < 1) {
      setShowSearch(false);
    } else {
      setShowSearch(true);
    }
    setSearchquery(e.target.value);
  };
  useEffect(() => {
    const getSearch = async () => {
      try {
        if (searchquery.length >= 1) {
          const searchresult = await axios.get(
            "/profile/search",
            {
              headers: { Authorization: "Bearer " + user.accessToken },
              params: { email: searchquery },
            }
          );
          setUsersSearch(searchresult.data);
        }
      } catch (error) {}
    };
    const timer = setTimeout(() => {
      getSearch();
    }, 700);
    return () => clearTimeout(timer);
  }, [searchquery]);
  return (
    <>
      {showBarSearchMobile && (
        <SearchBarMobile
          searchHandler={searchHandler}
          hidebar={hideBarSearchMobileHandler}
        />
      )}
        <Modal show={showAddPost}  onHide={hideAddPostWithBackdropHandler}>
            <Modal.Header >
              <Modal.Title>Share your thoughts</Modal.Title>
              <CloseButton onClick={hideAddPostHandler} />
            </Modal.Header>
            <Share hideAddPostHandler={hideAddPostHandler}></Share>
        </Modal>

      <TopbarContainer>
        <div className="TopbarLeft">
          <Link to="/" style={{ textDecoration: "none" }}>
             <span className={"Logo"}> TokenTalk </span>
          </Link>
        </div>
        <div className="TopbarCenter">
          <div className="Searchbar">
            <AiOutlineSearchStyled />
            <input
              onChange={searchHandler}
              type="text"
              className="SearchInput"
              placeholder="Search"
            />
          </div>
          {showSearch && (
            <>
              <Search
                data={usersSearch}
                hideSearch={() => {
                  setShowSearch(false);
                }}
              />
            </>
          )}
        </div>
        <div className="TopbarRight">
          <div className="TopbarIcons">
            <div className="TopbarIconItem">
              <FiSearchStyled
                onClick={showBarSearchMobileHandler}
              ></FiSearchStyled>
            </div>

            {props.showWallet && (
                  <Button variant="outline-dark"  style={{marginRight:"10px"}}>
                    {props.account.slice(0, 5) + '...' + props.account.slice(38, 42)}
                  </Button>
            ) }

            <div className="TopbarIconItem">
              <BsPlusSquareStyled
                onClick={() => {
                  setShowAddPost(true);
                }}
              />
            </div>
            <img
              className="TopbarImg"
              onClick={() => {
                setShowMenu(!showMenu);
              }}
              alt=""
              src={`${user.profileImage ? user.profileImage : "https://i.imgur.com/6VBx3io.png"}`}
            />
            {showMenu && (
              <div className="TopbarMenu">
                <span
                  className="menuItems"
                  onClick={() => {
                    navigate(`/profile/${user.email}`);
                  }}
                >
                  Profile
                </span>

                <span
                    className="menuItems"
                    onClick={() => {
                      navigate(`/nft-dashboard/${user.email}`);
                    }}
                >
                  Create Nft
                </span>
                {web3Account.account && (
                    <span
                    className="menuItems"
                    onClick={() => {
                      navigate(`/marketplace/`);
                    }}
                >
                  Marketplace
                </span>

                )}

                {web3Account.account && (
                    <span
                        className="menuItems"
                        onClick={() => {
                          navigate(`/listed-nft/`);
                        }}
                    >
                  My listed NFTs
                </span>

                )}

                {web3Account.account && (

                  <span className="menuItems" onMouseEnter={e => console.log(web3Account)} onClick={disconnectWeb3AccountHandler}>
                    Disconnect From Metamask
                  </span>
                )}
                <span className="menuItems" onClick={logoutHandler}>
                  Logout
                </span>
              </div>
            )}
          </div>
        </div>
      </TopbarContainer>
    </>
  );
}

const FiSearchStyled = styled(FiSearch)`
  font-size: 20px;
  margin-right: 10px;
  display: none;
  @media (max-width: 655px) {
    display: block;
  }
`;
const BsPlusSquareStyled = styled(BsPlusSquare)`
  font-size: 20px;
  margin-right: 10px;
`;
const AiOutlineSearchStyled = styled(AiOutlineSearch)`
  font-size: 20px !important;
  margin-left: 10px;
`;
const TopbarContainer = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: rgb(255, 255, 255);
  justify-content: center;
  border-bottom: 1px solid gray;
  box-shadow: -2px 10px 9px -7px rgba(0, 0, 0, 0.34);
  -webkit-box-shadow: -2px 10px 9px -7px rgba(0, 0, 0, 0.34);
  -moz-box-shadow: -2px 10px 9px -7px rgba(0, 0, 0, 0.34);
  @media (max-width: 655px) {
    justify-content: space-between;
  }
  .TopbarLeft {
    padding-right: 130px;
    display: flex;
    @media (max-width: 655px) {
      padding-right: 0px;
    }
  }
  .Logo {
    font-size: 32px;
    padding-right: 20px;
    padding-left: 20px;
    font-weight: bold;
    color: black;
    cursor: pointer;
    font-family: "Dancing Script", cursive;
  }
  .Searchbar {
    width: 100%;
    height: 30px;
    background-color: rgb(218, 218, 218);
    border-radius: 10px;
    display: flex;
    align-items: center;
    @media (max-width: 655px) {
      display: none;
    }
  }
  .TopbarCenter {
    display: flex;
    width: 400px;
    justify-content: center;
    margin: 0 20px;
    z-index: 2;
  }
  .SearchInput {
    border: none;
    width: 70%;
    background-color: rgb(218, 218, 218);

    &:focus {
      outline: none;
    }
  }
  .TopbarRight {
    margin-right: 10px;
    padding-left: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: 655px) {
      padding-left: 0px;
    }
  }
  .TopbarIcons {
    display: flex;
    position: relative;
  }
  .TopbarMenu {
    position: absolute;
    top: 42px;
    width: 120px;
    right: -4px;
    background-color: #f1f1f1;
    display: flex;
    flex-direction: column;
    -webkit-box-shadow: 0px 0px 16px -8px rgba(0, 0, 0, 0.68);
    box-shadow: 0px 0px 16px -8px rgba(0, 0, 0, 0.68);
  }
  .menuItems {
    margin: 7px;
    border-bottom: 1px solid #e1e1e1;
    color: black;
    cursor: pointer;
  }
  .TopbarIconItem {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .TopbarImg {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
  }
`;

export default Topbar;
