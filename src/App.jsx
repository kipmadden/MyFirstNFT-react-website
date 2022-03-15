import React, { useEffect, useState } from "react";
import ErrorMessage from "./ErrorMessage";
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';
import Lottie from "lottie-react";
import minting from "./assets/minting.json";
import nfts from "./assets/nfts.json";
import pepecoin from "./assets/pepecoin.json";
import pleasewait from "./assets/pleasewait.json";


// Constants
const TWITTER_HANDLE = 'kipsmadden';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/crazy-animals-cafe';
// const mySecret = process.env['infuraApi'];
//const TOTAL_MINT_COUNT = 10;

// Contract address - needs to be changed on each redeployment of contract
const CONTRACT_ADDRESS = "0xa49a6222bF6910F87fcf736C3B4a77c3016a0619";

// Chains for this project
const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: [
      "https://polygon-rpc.com/",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com"
      ],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  rinkeby: {
    chainId: "0x4",
    chainName: "Rinkeby",
    nativeCurrency: {
      name: "Rinkeby Ether",
      symbol: "RIN",
      decimals: 18
    },
    rpcUrls: [
      "https://rinkeby.infura.io/v3/569c865feb98409d8234426c2b2fb480"
    ],
    blockExplorerUrls: ["https://rinkeby.etherscan.io"]
  }
};

const changeNetwork = async ({ networkName, setError }) => {
  try {
  await ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x4' }],
  });
} catch (switchError) {
  // This error code indicates that the chain has not been added to MetaMask.
  if (switchError.code === 4902) {
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x4',
            chainName: 'Rinkeby',
            rpcUrls: ['https://rinkeby.infura.io/v3/569c865feb98409d8234426c2b2fb480'] /* ... */,
          },
        ],
      });
    } catch (addError) {
      // handle "add" error
    }
  }
  // handle other "switch" errors
}
};

const lottiestyle = {
  height: 500,
};

const App = () => {

  // State variable to store user's public wallet. Why we import useState above
    const [currentAccount, setCurrentAccount ] = useState("");
    const [error, setError] = useState();
    const [hasWallet, setHasWallet] = useState(0);
    const [walletChain, setWalletChain] = useState(0);
    const [numNfts, setNumNfts ] = useState(0);
    const [maxNftSupply, setMaxNftSupply ] = useState(0);
    const [mintingNow, setMintingNow ] = useState(0);
  //this is async.
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    
    // Check if there is a wallet connected 
    if (!ethereum) {
        console.log("Make sure you have metamask!");
        setHasWallet(0)
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
        setHasWallet(1)
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    console.log("accounts is: ", accounts)
    // User can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      //setCurrentAccount(account)
      //setupEventListener()
      connectWallet()
    } else {
      console.log("No authorized account found")
    }
  }

  // Implement your connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // Fancy method to request access to account.
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      // Alert user when they're on the wrong network
      let chainIdnum = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainIdnum);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainIdnum !== rinkebyChainId) {
        //alert("You are not connected to the Rinkeby Test Network!");
        setWalletChain(1)
        setCurrentAccount(accounts[0]); 
        return;
      }
     // This should print out public address once we authorize Metamask.
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setNumNfts(tokenId.toNumber())
        });

        console.log("Setup event listener!")
        getCountNfts()
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

 // method to ask the blockchain contract to mint an NFT
  const askContractToMintNft = async () => {
  
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
      
        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMintingNow(1)
        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setMintingNow(2)
        getCountNfts()
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  
   // method to ask the blockchain contract to mint an NFT
  const getCountNfts = async () => {
  
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, provider);
        const nftCount = await contract.totalSupply();
        const maxSupply = await contract.maxSupply();
        setNumNfts(nftCount.toNumber())
        setMaxNftSupply(maxSupply.toNumber())
        console.log(`The contract totalSupply is ${nftCount}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  

  // method to handle switching the chain on Metamask if not on Rinkeby
  const handleNetworkSwitch = async (networkName) => {
    setError();
    await changeNetwork({ networkName, setError});
    setWalletChain(0)
    console.log(`setWalletChain ${walletChain} currentAccount: ${currentAccount}`)
    setupEventListener()
  }

  const networkChanged = (chainId) => {
    console.log({chainId});
  }

  // Render Methods
    const needWallet = () => (
        <div>
          <p className="need-wallet">You need Metamask to interact with this website!</p>
          <p className="need-wallet">Download Metamask here: <a href="https://metamask.io/">Download Metamask</a></p>
        </div>
    
  );

    const renderSwitchNetwork = () => (
        <div>
            <h1 className="need-wallet">
              Change Your MetaMask network
            </h1>
            <div>
              <button onClick={() => handleNetworkSwitch("rinkeby")} className="cta-button connect-wallet-button">
                Switch to Rinkeby Network
              </button>
              <ErrorMessage message={error} />
            </div>
        </div>
    )


  const renderNotConnectedContainer = () => (
        <div>
          <button onClick={connectWallet} className="cta-button connect-wallet-button">
          Connect to Wallet
          </button>
        </div>
    
  );

  const renderNoneLeft = () => (
        <div className="header-container">
          <p className="noneleft-text">{`Sorry all ${maxNftSupply} NFTs have already been minted!`}
          </p>
          <p className="noneleft-text">{`Use the 'View Collection' link below to buy them on OpenSea`}
          </p>     
        </div>
  );

  const renderMintUI = () => (
        <div>
          <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint NFT
          </button>
          {mintingNow === 2 ? <div><p>Finished Minting</p></div> :  null }
          <p className="mint-count">{`${numNfts} out of ${maxNftSupply} NFTs minted`}
          </p>
        </div>
  );
  
  const mintMessage = () => (
        <div>
          <p className="mint-count">CONGRATS! You've minted a brand spanking new NFT!</p>
          <p className="mint-count">OpenSea can take up to 10 mins to render it - So be patient!"</p>
          <p className="mint-count">Here's your link: <a href={`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${numNfts - 1 }`}>Your New NFT number {`${numNfts - 1}`}</a></p>
        </div>
  )
  const renderproceed = () => {
    if (hasWallet === 0){
      return needWallet()
    }
    if (walletChain === 1 ){
      return renderSwitchNetwork()
    }
    if (currentAccount === ""){
      return renderNotConnectedContainer()
    }

    if (numNfts === maxNftSupply){
      return renderNoneLeft()
    }
    return renderMintUI()
  }

  const elementToInclude = renderproceed()


    useEffect(() => {
    checkIfWalletIsConnected();
    // getCountNfts();
    

  }, [])


  //  Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Crazy Animal Cafe</p>
          <p className="sub-text">
            Mint a Crazy Animal Card and have a laugh!
          </p>
          <div className="header-container">
          {mintingNow === 1 ? <Lottie animationData={pleasewait} style={lottiestyle} loop="true"/> : elementToInclude}
          </div>
        </div>
        <div className="header-container">
         {mintingNow === 0 ? <Lottie animationData={nfts} style={lottiestyle} loop="true"/> : null }
         {mintingNow === 1 ? <Lottie animationData={minting} style={lottiestyle} loop="true" /> : null}
         {mintingNow === 2 ? (mintMessage()) : null }
        </div>
        <div className="opensea-collection-container">
        <a
          className="opensea-gradient"
          href={OPENSEA_LINK}
          target="_blank"
          rel="noreferrer"
          >{`🌊 View Collection on OpenSea`}</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;