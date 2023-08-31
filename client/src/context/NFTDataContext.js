import React, { createContext, useContext, useState, useEffect } from 'react';
// ABIs
import NFT from '../abis/NFT.json';

// Config
import config from '../config.json';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';



const NFTDataContext = createContext();

export const NFTDataProvider = ({ children }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [url, setURL] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [account, setAccount] = useState(null)
    const [nft, setNFT] = useState(null)
    const [provider, setProvider] = useState(null)
    const [message, setMessage] = useState("")
    const [isWaiting, setIsWaiting] = useState(false)

    useEffect(() => {

        async function loadBlockchainData() {
            try {
                if (window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(provider);

                    const network = await provider.getNetwork();
                    if (!Object.keys(config).includes(network.chainId.toString())) {
                        toast.error('Please switch to Avalanche Fuji Testnet');
                    }
                    else {
                        const nftContract = new ethers.Contract(
                            config[network.chainId].nft.address,
                            NFT,
                            provider // This is important for sending transactions
                        );
                        setNFT(nftContract);
                    }

                } else {
                    toast.info('Please install MetaMask.');

                    return
                }
            } catch (err) {
                console.log(err)
                toast.error('Error', err.message);
                return
            }
        }
        loadBlockchainData()
    }, []);

    return (
        <NFTDataContext.Provider
            value={{
                name,
                setName,
                description,
                setDescription,
                image,
                setImage,
                url,
                setURL,
                isDarkMode,
                setIsDarkMode,
                account,
                setAccount,
                nft,
                setNFT,
                provider,
                setProvider,
                message,
                setMessage,
                isWaiting,
                setIsWaiting
            }}
        >
            {children}
        </NFTDataContext.Provider>
    );
};

export const useNFTDataContext = () => useContext(NFTDataContext);
