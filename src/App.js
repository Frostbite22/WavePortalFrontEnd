import * as React from "react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";
import "./App.css";

import LoadingSpinner from "./LoadingSpinner";

export default function App() {
  const [totalWaves, setTotalWaves] = useState();
  const [currentAccount, setCurrentAccount] = useState("");
  const [connEthers, setConnEthers] = useState();
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //0xb3CeB1859f7d1c7AcB1B8D5F3C034a14f6b5CCD0
  //0x1ba528bE2E7Be425d04F1017Fae4a4ec75f726dd
  //
  //0xdb5D1186A80426951DC40b59085047a5CB5AD6b9
  const contractAddress = "0xcdcEDfa3c2654Ec0fD04264621476E2dCE727E53";
  const contractABI = abi.abi;
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get Metamask");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log("Connected", [0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("error");
    }
  };

  function connectEthers() {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setConnEthers(wavePortalContract);
    } else {
      console.log("Ethereum object doesn't exist ");
    }
  }

  const calculateWaves = async (conn) => {
    try {
      let wavePortalContract = conn;
      let count = await wavePortalContract.getTotalWaves();
      setTotalWaves(count.toNumber());
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async (conn) => {
    try {
      let wavePortalContract = conn;
      setIsLoading(true);
      const waveTxn = await wavePortalContract.wave(message, {
        gasLimit: 300000,
      });
      await waveTxn.wait();
    } catch (error) {
      console.log(error);
    } finally {
      calculateWaves(conn);
      setIsLoading(false);
    }
  };

  const getAllWaves = async (conn) => {
    try {
      let wavePortalContract = conn;
      let waves = await wavePortalContract.getAllWaves();
      let wavesCleaned = [];
      waves.forEach((wave) => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message,
        });
      });
      setAllWaves(wavesCleaned);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    connectEthers();
  }, []);

  useEffect(() => {
    getAllWaves(connEthers);
  });
  useEffect(() => {
    calculateWaves(connEthers);
  });

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header"> {totalWaves} 👋 Hey there!</div>
        <div className="bio">
          Fares here !<br></br>
          {isLoading ? <LoadingSpinner /> : ""}
        </div>
        <input
          type="text"
          value={message.value}
          placeholder="say hi !!!"
          name="message"
          onChange={(message) => setMessage(message.target.value)}
        />
        <button
          className="waveButton"
          onClick={() => wave(connEthers)}
          disabled={isLoading}
        >
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            connect Wallet
          </button>
        )}
        {allWaves &&
          allWaves
            .map((wave, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "OldLace",
                    marginTop: "16px",
                    padding: "8px",
                  }}
                >
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              );
            })
            .reverse()}
      </div>
    </div>
  );
}
