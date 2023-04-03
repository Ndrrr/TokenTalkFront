import {createContext, useContext, useState} from "react";

const INITIAL_STATE = {
    account: JSON.parse(localStorage.getItem("web3Account") || null),
};

const Web3AccountContext = createContext();

export const Web3ContextProvider = ({ children }) => {
    const [web3Account, setWeb3Account] = useState(INITIAL_STATE);
    return (
        <Web3AccountContext.Provider
            value={{ web3Account: web3Account, onWeb3AccountChange: setWeb3Account }}
        >
            {children}
        </Web3AccountContext.Provider>
    );
};

export const useWeb3Data = () => {
    const { web3Account, onWeb3AccountChange } = useContext(Web3AccountContext)
    return { web3Account, onWeb3AccountChange }
}