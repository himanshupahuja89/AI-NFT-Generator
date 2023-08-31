import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { useNFTDataContext } from '../context/NFTDataContext';
import { toast } from 'react-toastify';
import Toast from './toast';
import Spinner from 'react-bootstrap/Spinner';

const ViewNFT = () => {
    const { isDarkMode, nft, provider, account } = useNFTDataContext();
    const [nftData, setNFTData] = useState([]);
    const [error, setError] = useState('');
    const [loadingNFTs, setLoadingNFTs] = useState([]); // Array to track loading status of individual NFTs
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        async function fetchNFTData() {
            try {
                if (account == null) {
                    toast.error('Please connect application with Metamask account');
                    return;
                }
                setDataLoading(true);

                const signer = await provider.getSigner();
                const user = await signer.getAddress();
                const userTokenIds = await nft.getUserTokenIds(user);

                const nftData = await Promise.all(userTokenIds.map(async tokenId => {
                    setLoadingNFTs(prevLoadingNFTs => [...prevLoadingNFTs, tokenId]); // Mark NFT as loading
                    const tokenURI = await nft.getTokenURI(tokenId);
                    const response = await fetch(tokenURI);
                    const data = await response.json();
                    const imageUrl = data.image.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
                    setLoadingNFTs(prevLoadingNFTs => prevLoadingNFTs.filter(id => id !== tokenId)); // Mark NFT as loaded
                    return { tokenId, ...data, image: imageUrl };
                }));

                setNFTData(nftData);
                setError(nftData.length === 0 ? 'You have not minted any NFT.' : '');
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setDataLoading(false); // Set loading state to false when done
            }
        }

        fetchNFTData();
    }, [account]);

    return (
        <div className={`view-nft-page ${isDarkMode ? 'dark' : 'light'}`}>
            <Navigation />
            <Toast />
            <div className='view-heading'>NFTs</div>

            {nftData.length > 0 ? (
                <div className={`nft-card-container ${isDarkMode ? 'dark' : 'light'}`}>
                    {error && <p className="error-message">{error}</p>}

                    <div>
                        {dataLoading ? (
                            <div className="image__placeholder">
                                <Spinner animation="border" />
                                <p>Loading ..</p>
                            </div>
                        ) : (
                            <div className={`nft-card-grid`}>
                                {nftData.map(item => (
                                    <div key={item.tokenId} className="nft-card">
                                        {loadingNFTs.includes(item.tokenId) ? (
                                            <div className="image__placeholder">
                                                <Spinner animation="border" />
                                            </div>
                                        ) : (
                                            <>
                                                <img src={item.image} alt={item.name} />
                                                <p>Id: {item.tokenId.toString()}</p>
                                                <h3>{item.name}</h3>
                                                <p>{item.description}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="error-message">{error}</p>
            )}
        </div>
    );
};

export default ViewNFT;
