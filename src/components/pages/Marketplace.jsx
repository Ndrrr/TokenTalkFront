import React, {useEffect, useState} from 'react'
import {ethers} from "ethers"
import {Button, Card, Col, Row} from 'react-bootstrap'
import {loadContracts} from "../../util/web3Util";
import Topbar from "../Topbar";
import {useWeb3Data} from "../../contexts/Web3AccountContext";

const MarketPlace = (props) => {
    const {web3Account, onWeb3AccountChange} = useWeb3Data()
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    const [marketplace, setMarketplace] = useState(null)
    const [nft, setNft] = useState()
    const [account, setAccount] = useState(null)

    useEffect(() => {
        console.log(web3Account.account.account)
        const loadMarketplace = async () => {
            const {marketplace, nft} = await loadContracts()
            setNft(nft)
            setMarketplace(marketplace)
            console.log("marketplace", marketplace)
        }
        if (!marketplace && !nft) {
            loadMarketplace()

        }
    })

    const loadMarketplaceItems = async () => {
        // Load all unsold items
        const itemCount = await marketplace.itemCount()
        let items = []
        for (let i = 1; i <= itemCount; i++) {
            const item = await marketplace.items(i)
            if (!item.sold) {
                // get uri url from nft contract
                var uri = await nft.tokenURI(item.tokenId)
                uri = uri.replace('ipfs.infura', 'ndrrr.infura-ipfs')
                // use uri to fetch the nft metadata stored on ipfs
                const response = await fetch(uri)
                const metadata = await response.json()
                // get total price of item (item price + fee)
                const totalPrice = await marketplace.getTotalPrice(item.itemId)
                let filetype = "image";
                if (metadata.description.includes("video")) {
                    filetype = "video"
                }
                // Add item to items array
                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image,
                    fileType: filetype,
                })
            }
        }
        setLoading(false)
        setItems(items)
    }

    const buyMarketItem = async (item) => {
        try {
            await (await marketplace.purchaseItem(item.itemId, {value: item.totalPrice})).wait()
        } catch (e) {
            console.log(e)
        }
        loadMarketplaceItems()
    }

    useEffect(() => {
        loadMarketplaceItems()
    }, [marketplace, nft])
    if (loading) return (
        <main style={{padding: "1rem 0"}}>
            <h2>Loading...</h2>
        </main>
    )
    return (
        <>
            <Topbar
                rerenderFeed={props.rerenderFeed}
                onChange={props.onChange}
            ></Topbar>
            <div className="flex justify-center">
                {items.length > 0 ?
                    <div className="px-5 container">
                        <Row xs={1} md={2} lg={3} className="g-4 py-5">
                            {items.map((item, idx) => (
                                <Col key={idx} className="overflow-hidden">
                                    {console.log(item) && null}
                                    <Card>
                                        {item.fileType === "video" ?
                                            <video controls width={360} height={360} src={item.image}/> :
                                            item.fileType === "image" ?
                                                (
                                                    <Card.Img variant="top" src={item.image}/>
                                                )
                                                : <audio controls src={item.image}/>
                                        }
                                        <Card.Body color="secondary">
                                            <Card.Title>{item.name}</Card.Title>
                                        </Card.Body>
                                        <Card.Footer>
                                            {item.seller !== web3Account.account.account && (
                                                <div className='d-grid'>
                                                    <Button onClick={() => buyMarketItem(item)} variant="primary"
                                                            size="lg">
                                                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                                    </Button>
                                                </div>
                                            )}
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                    : (
                        <main style={{padding: "1rem 0"}}>
                            <h2>No listed assets</h2>
                        </main>
                    )}
            </div>
        </>
    );
}
export default MarketPlace;