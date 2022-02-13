import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'kipsmadden';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/three-word-mixup';
const TOTAL_MINT_COUNT = 50;

// Contract address - needs to be changed on each redeployment of contract
const CONTRACT_ADDRESS = "0xc30D8B2a9C887F5920A90bf6Ecc6565FeB4A3309";

const App = () => {

  // State variable to store user's public wallet. Why we import useState above
    const [currentAccount, setCurrentAccount ] = useState("");
    const [numNfts, setNumNfts ] = useState(0);
    const [maxNftSupply, setMaxNftSupply ] = useState(0);
    
  //this is async.
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    
    // Check if there is a wallet connected 
    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access the user's wallet
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // User can have multiple authorized accounts, we grab the first one if its there!
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener()
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
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
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
          alert(`Hey there! You've minted an NFT for this project! We've sent it to your wallet, but it may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

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

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

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
        setNumNfts(nftCount)
        setMaxNftSupply(maxSupply)
        console.log(`The contract totalSupply is ${nftCount}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }




  // Render Methods
  const renderNotConnectedContainer = () => (
        <div>
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
            </button>
            <p className="mint-count">{`${numNfts} out of ${maxNftSupply} NFTs minted`}
            </p>
            </div>
    
  );

  const renderNoneLeft = () => (
    <div>
      <p className="mint-count">{`Sorry all ${maxNftSupply} NFTs have already been minted! Use the 'View Collection'link below to buy them on OpenSea`}
      </p>
    </div>
  );

  const renderMintUI = () => (
    <div>
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
    <p className="mint-count">{`${numNfts} out of ${maxNftSupply} NFTs minted`}
    </p>
    </div>
  );

    useEffect(() => {
    checkIfWalletIsConnected();
    getCountNfts();
  }, [])


  //  Added a conditional render! We don't want to show Connect to Wallet if we're already connected :).
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Crazy Animal Cards</p>
          <p className="sub-text">
            Mint a Crazy Animal Activity Card and have a laugh!
          </p>
          <div className="opensea-collection-container">
          { numNfts === maxNftSupply ? (
            renderNoneLeft()
          ) : ( null )}
          </div>
          <div className="opensea-collection-container">
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ): (
            renderMintUI()
          )}
          </div>
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