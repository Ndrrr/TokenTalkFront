import React, {useContext, useEffect, useState} from "react";
import styled from "styled-components";
import Topbar from "../Topbar";
import axios from "axios";
import {useParams} from "react-router-dom";
import {AuthContext} from "../../contexts/AuthContext/AuthContext";
import Intercept from "../../util/refresh";
import {baseBackUrl, baseFrontUrl} from "../../axios-conf";
import {Button, Spinner, Form} from 'react-bootstrap'
import {useWeb3Data} from "../../contexts/Web3AccountContext";
import {loadContracts} from "../../util/web3Util";
import { Buffer } from "buffer";
import {ethers} from "ethers";
const ipfsClient = require('ipfs-http-client')

const projectId = '2KzzBjslsSMCfSyardRsBvCDYqt'
const projectSecret = '254ccd688ac2acd90841b0a493d65770'
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const client = ipfsClient.create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth
    }
})
function NftDashboard(props) {
    const email = useParams().email;

    const nftUrl = baseBackUrl + "/nft";
    const postsUrl = baseBackUrl + "/posts/files";

    const {web3Account, onWeb3AccountChange} = useWeb3Data()
    const {user: currentUser, dispatch} = useContext(AuthContext);
    const [posts, setPosts] = useState([]);
    const [nfts, setNfts] = useState([]);
    const [resetter, reset] = useState(0)

    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(true)
    const [account, setAccount] = useState(null)
    const [nft, setNFT] = useState({})
    const [marketplace, setMarketplace] = useState({})
    const [selectedPost, setSelectedPost] = useState({id:0})
    const [price, setPrice] = useState(0)
    const [nftName, setNftName] = useState('')
    const [nftInfuraUrl, setNftInfuraUrl] = useState('')

    const web3HandlerUtil = async () => {
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('chainChanged')
            window.location.reload();
        })

        window.ethereum.on('accountsChanged', async function (accounts) {
            console.log(accounts + ' accountsChanged')
            setAccount(accounts[0])
            onWeb3AccountChange({account})
            await web3Handler()
        })
        await loadContractsFromUtil()
    }
    const web3Handler = async () => {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        setAccount(accounts[0])
        onWeb3AccountChange({account: accounts[0]})
        localStorage.setItem('web3Account', JSON.stringify({account: accounts[0]}))
        // Get provider from Metamask
        await web3HandlerUtil()
    }

    const loadContractsFromUtil = async () => {
        const {nft, marketplace} = await loadContracts()
        setNFT(nft)
        setMarketplace(marketplace)
        setLoading(false)
    }

    useEffect(() => {
        if (web3Account.account && !account) {
            web3Handler()
        }
    })

    const axiosJWT = axios.create();
    Intercept(axiosJWT);

    useEffect(() => {
        const fetchUser = async () => {
            const user = await axios.get(
                "/profile?email=" + currentUser.email,
                {
                    headers: { Authorization: "Bearer " + currentUser.accessToken },
                }
            );
            setUser(user.data);

            const pst = await axios.get(
                "/posts/all?authorEmails=" + currentUser.email,
                {
                    headers: { Authorization: "Bearer " + currentUser.accessToken },
                }
            );
            setPosts(
                pst.data.posts.sort((p1, p2) => {
                    return new Date(p2.createdAt) - new Date(p1.createdAt);
                })
            );
        };
        fetchUser();
    }, [currentUser.email]);

    const handlePostSelect = async (p) => {
        setSelectedPost(p)

        uploadToIPFS(p)
    }

    const uploadToIPFS = async (p) => {
        fetch(postsUrl + "/" + p.fileId, {
            method: 'GET',
        }).then(response => response.blob())
            .then(async fileBlob => {
                const fileExtension = p.mimeType.split('/')[1]
                const file = new File([fileBlob], `${p.id}.${fileExtension}`, {type: p.mimeType})

                console.log("log from upload: " )
                console.log(p)
                if (typeof file !== 'undefined') {
                    try {
                        const result = await client.add(file)
                        console.log(result)
                        setNftInfuraUrl(`https://ndrrr.infura-ipfs.io/ipfs/${result.path}`)
                    } catch (error) {
                        console.log("ipfs image upload error: ", error)
                    }
                }
            })
    }
    const createNFT = async () => {
        if (!nftInfuraUrl || !price || !nftName || !selectedPost.content) return
        try{
            const result = await client.add(JSON.stringify({
                seller: account,
                image: nftInfuraUrl, price,
                name: nftName,
                description: selectedPost.mimeType,
                fileType: selectedPost.fileType}))
            mintThenList(result)
            // wait for 2 seconds then redirect to marketplace
            setTimeout(() => {
                this.props.history.push('/marketplace');
            }, 2000)

        } catch(error) {
            console.log("ipfs uri upload error: ", error)
        }
    }
    const mintThenList = async (result) => {
        console.log('starting to mint')
        const uri = `https://ndrrr.infura-ipfs.io/ipfs/${result.path}`
        // mint nft
        await(await nft.mint(uri)).wait()
        console.log('mint finished')
        // get tokenId of new nft
        const id = await nft.tokenCount()
        // approve marketplace to spend nft
        await(await nft.setApprovalForAll(marketplace.address, true)).wait()
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    }

    return (
        <>
            <Topbar
                rerenderFeed={props.rerenderFeed}
                onChange={props.onChange}
                showWallet={!loading}
                account={account}
            ></Topbar>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                    alignContent: 'center',
                    flexDirection: 'column'
                }}>
                    <Button onClick={web3Handler} variant="outline-dark">Connect Wallet</Button>
                    <br/>
                    <Spinner animation="border" style={{display: 'flex'}}/>
                    <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
                </div>
            ) : (
                <>
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
                                <div className="profileInfo">
                                  <span className="profileInfoPost">
                                    {posts.length} Posts
                                  </span>
                                  <span className="profileInfoFollowers">
                                    {nfts.length} NFTs
                                  </span>
                                </div>
                                <div>
                                    <Form.Control onChange={(e) => setNftName(e.target.value)} size="lg" required type="text" placeholder="Name of NFT" />
                                    <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                                    <Button onClick={createNFT} variant="primary" size="lg">
                                        Create & List NFT!
                                    </Button>
                                </div>
                                <div className="profileBio">
                                    <span className="profileBioUsername">{user.firstName + " " + user.lastName}</span>
                                </div>
                            </div>

                        </div>
                    </ProfileContainer>
                    <ProfilePosts>
                        <div className="postsWrapper">
                            {posts.map((p) => (
                                <div key={p.id}
                                     className={`profilePostWrapper ${selectedPost.id === p.id ? 'selectedPost' : ''}`}
                                     onClick={async () => handlePostSelect(p)}>
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
                                                   src={p.fileId ? `${postsUrl}/${p.fileId}` : baseFrontUrl + "/images/defaultpost.jpg"}/>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ProfilePosts>
                </>
            )}
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
export default NftDashboard;
