import { ethers } from 'ethers';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useNFTDataContext } from '../context/NFTDataContext';


const Navigation = () => {
    const navigate = useNavigate();

    const {
        isDarkMode,
        setIsDarkMode,
        account,
        setAccount
    } = useNFTDataContext();

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    const handleViewNFT = () => {
        navigate('/view');
    };


    const connectHandler = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = ethers.getAddress(accounts[0])
            setAccount(account);
        } catch (err) {
            if (err.code === 4001) {
                toast.error("User rejected the connection request.")
                return
            } else {
                toast.error("An error occurred while connecting.")
                return
            }
        }

    }

    return (
        <nav>
            <div className='nav__brand' onClick={() => navigate('/')}>
                <h1>AI NFT Generator</h1>
            </div>

            <div className='toggle-container'>

                <DarkModeSwitch
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                    size={25}
                    sunColor={"#6C63FF"}
                />

            </div>
            <div >
                <button
                    type="button"
                    className='nav__connect'
                    onClick={handleViewNFT}
                >
                    View NFT
                </button>
            </div>

            <div>
                {account ? (
                    <button
                        type="button"
                        className='nav__connect'
                    >
                        {account.slice(0, 6) + '...' + account.slice(38, 42)}
                    </button>
                ) : (
                    <button
                        type="button"
                        className='nav__connect'
                        onClick={connectHandler}
                    >
                        Connect
                    </button>
                )}
            </div>

        </nav>
    );
}

export default Navigation;