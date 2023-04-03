import {ethers} from "ethers";
import MarketplaceAddress from "../contractData/Marketplace-address.json";
import MarketplaceAbi from "../contractData/Marketplace.json";
import NFTAddress from "../contractData/NFT-address.json";
import NFTAbi from "../contractData/NFT.json";

export const loadContracts = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    return { marketplace, nft }
}