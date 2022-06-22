import React, { useEffect, useState } from 'react';
import CONTRACT_ADDRESS from './constants';
import alfaHanta from './utils/AlfaHanta.json';
import { ethers } from 'ethers';
import './App.css';
import LoadingIndicator from './components/LoadingIndicator';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [nftContract, setNftContract] = useState(null);
  const [inputData, setInputData] = useState({});

  const { amount, tokenId } = inputData;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask');
        return;
      } else {
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== '5') {
        alert("Please connect to Rinkeby!");
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkNetwork();
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, alfaHanta.abi, signer);

      setNftContract(nftContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  const onAlfaPassInputChange = (event) => {
    setInputData({ [event.target.name]: event.target.value });
  }

  const onAllowListInputChange = (event) => {
    setInputData({ [event.target.name]: event.target.value });
  }

  const onPublicMintInputChange = (event) => {
    setInputData({ [event.target.name]: event.target.value });
  }

  const alfaPassMint = async () => {
    if (amount === 0) {
      alert('No amount given');
      return;
    }

    if (tokenId === 0) {
      alert('No token ids given');
      return;
    }

    try {
      if (nftContract) {
        const ethAmount = 0.04;
        const number = 1;
        const value = (ethAmount * amount);
        const mintValue = ethers.utils.parseEther(ethAmount.toString());
        const mintTxn = await nftContract.alfaPassMintMultiple(
          number.toString(), [tokenId.toString()], {
            value: mintValue,
          }
        )
        await mintTxn.wait();
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const allowListMint = async () => {
    if (amount === 0) {
      alert('No amount given');
      return;
    }

    try {
      if (nftContract) {
        const ethAmount = 0.1;
        const value = (ethAmount * amount);
        const mintValue = ethers.utils.parseEther(value.toString());
        const mintTxn = await nftContract.mintAllowList(
          amount.toString(), {
            value: mintValue,
          }
        )
        await mintTxn.wait();
        console.log('Mint complete');
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const publicMint = async () => {
    if (amount === 0) {
      alert('No amount given');
      return;
    }

    try {
      if (nftContract) {
        const ethAmount = 0.1;
        const value = (ethAmount * amount);
        const mintValue = ethers.utils.parseEther(value.toString());
        const mintTxn = await nftContract.publicMint(
          amount.toString(), {
            value: mintValue,
          }
        )
        await mintTxn.wait();
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const renderContent = () => {
    try {
      if (!currentAccount) {
        return (
          <button className="cta-button connect-wallet-button" onClick={connectWalletAction}>
            Connect to Wallet
          </button>
        );
      } else {
        return (
          <div className="connected-container">
            <div>
              <div className="header">Alfa Pass Mint</div>
              <div className="sub-text">You must hold an Alfa Pass NFT to mint.</div>
              <form
                className="dataContainer"
                onSubmit={(event) => {
                  event.preventDefault();
                  alfaPassMint();
                }}
              >
                <input
                  type="text"
                  name="amount"
                  placeholder="Enter Amount"
                  onChange={onAlfaPassInputChange}
                />
                <input
                  type="text"
                  name="tokenId"
                  placeholder="Enter Alfa Pass Token ID"
                  onChange={onAlfaPassInputChange}
                />
                <button type="submit" className="cta-button mint-button">
                  Mint
                </button>
              </form>
            </div>
            <div>
              <div className="header">Whitelist Mint</div>
              <div className="sub-text">You must be added to whitelist to mint.</div>
              <form
                className="dataContainer"
                onSubmit={(event) => {
                  event.preventDefault();
                  allowListMint();
                }}
              >
                <input
                  type="text"
                  name="amount"
                  placeholder="Enter Amount"
                  onChange={onAllowListInputChange}
                />
                <button type="submit" className="cta-button mint-button">
                  Mint
                </button>
              </form>
            </div>
            <div>
              <div className="header">Public Mint</div>
              <div className="sub-text">For everyone else!</div>
              <form
                className="dataContainer"
                onSubmit={(event) => {
                  event.preventDefault();
                  publicMint();
                }}
              >
                <input
                  type="text"
                  name="amount"
                  placeholder="Enter Amount"
                  onChange={onPublicMintInputChange}
                />
                <button type="submit" className="cta-button mint-button">
                  Mint
                </button>
              </form>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="App">
      <div className="mainContainer">
        <div className="dataContainer">
          <div className="header">
            <img src="https://uploads-ssl.webflow.com/626c1d7d929822114a3572ab/626c2288b5f669082a203941_Alfa%20Hanta%20text.png" alt="Alfa Hanta nametag" />
          </div>
          {renderContent()}
          
        </div>
      </div>
    </div>
  );
}

export default App;
