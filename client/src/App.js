import { useState, useEffect } from 'react';
import { NFTStorage, File } from 'nft.storage'
import { toast } from 'react-toastify';
import { Buffer } from 'buffer';
import { ethers } from 'ethers';
import axios from 'axios';

// Components
import Spinner from 'react-bootstrap/Spinner';
import Navigation from './components/Navigation';
import Toast from './components/toast';

// ABIs
import NFT from './abis/NFT.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState(null)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [url, setURL] = useState(null)

  const [message, setMessage] = useState("")
  const [isWaiting, setIsWaiting] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false);


  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const loadBlockchainData = async () => {
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

  const submitHandler = async (e) => {
    e.preventDefault()

    if (name === "" || description === "") {
      toast.info('Please provide a name and description');
      return
    }

    if (account === null) {
      toast.info('Please connect application with Metamask account');
      return
    }

    setIsWaiting(true)

    // Call AI API to generate a image based on description
    const imageData = await createImage()

    // Upload image to IPFS (NFT.Storage)
    const url = await uploadImage(imageData)

    // Mint NFT
    await mintImage(url)

    setIsWaiting(false)
    setMessage("")
  }

  const createImage = async () => {
    setMessage("Generating Image...")

    // You can replace this with different model API's
    const URL = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`

    // Send the request
    const response = await axios({
      url: URL,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE_API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        inputs: description, options: { wait_for_model: true },
      }),
      responseType: 'arraybuffer',
    })

    const type = response.headers['content-type']
    const data = response.data

    const base64data = Buffer.from(data).toString('base64')
    const img = `data:${type};base64,` + base64data // <-- This is so we can render it on the page
    setImage(img)

    return data
  }

  const uploadImage = async (imageData) => {
    setMessage("Uploading Image...")

    // Create instance to NFT.Storage
    const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY })

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([imageData], "image.jpeg", { type: "image/jpeg" }),
      name: name,
      description: description,
    })

    // Save the URL
    const url = `https://ipfs.io/ipfs/${ipnft}/metadata.json`
    setURL(url)

    return url
  }

  const mintImage = async (tokenURI) => {
    try {
      setMessage("Waiting for Mint...")

      const signer = await provider.getSigner()
      if (nft != null) {
        const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.parseUnits("1", "ether") })
        await transaction.wait()
        // Reset the state to null or initial values
        setName("");
        setDescription("");
        setImage(null);
      }
      else {
        toast.error("Please switch to Avalanche Fuji Testnet.")
        setImage(null);
        setName("")
        setDescription("")
        return
      }

    } catch (error) {
      if (error.code === "ACTION_REJECTED") {
        // User rejected the transaction
        toast.error("Transaction was rejected by the user.")
        setName("")
        setDescription("");
        setImage(null);
        return

      } else {
        // Handle other errors
        console.log(error)
        toast.error("An error occurred while minting the image.")
        return
      }
    }

  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (

    <div className={`App ${isDarkMode ? 'dark' : 'light'}`}>
      <Navigation account={account} setAccount={setAccount} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />


      <div className='form'>
        <form onSubmit={submitHandler}>
          <input type="text" value={name} placeholder="Create a name..." onChange={(e) => { setName(e.target.value) }} />
          <input type="text" value={description} placeholder="Create a description..." onChange={(e) => setDescription(e.target.value)} />
          <input type="submit" value="Create & Mint" />
        </form>

        <div className="image">
          {!isWaiting && image ? (
            <img src={image} alt="AI generated image" />
          ) : isWaiting ? (
            <div className="image__placeholder">
              <Spinner animation="border" />
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>

      {!isWaiting && url && (
        <p>
          View&nbsp;<a href={url} target="_blank" rel="noreferrer">Metadata</a>
        </p>
      )}
      <Toast />
    </div>

  );
}

export default App;