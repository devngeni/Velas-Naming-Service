/** @format */

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { ethers } from "ethers";
import VelasNS from "./utils/velas_abi.json";
import { useParams } from "react-router-dom";

const App = () => {
  const [formParams, updateFormParams] = useState({
    name: "",
    price: "",
  });
  const [data, setData] = useState([]);
  const [currAddress, updateCurrAddress] = useState([]);
  const [dataFetched, updateDataFetched] = useState(false);
  const [busy, setBusy] = useState(false);

  const MintNfts = async () => {
    setBusy(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    //Pull the deployed contract instance
    let contract = new ethers.Contract(VelasNS.address, VelasNS.abi, signer);
    const price = ethers.utils.parseUnits(formParams.price, "ether");
    let transaction = await contract.register(price, formParams.name);
    await transaction.wait();
    setBusy(false);
  };

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider(
      "https://evmexplorer.testnet.velas.com/rpc"
    );

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const contract = new ethers.Contract(
      VelasNS.address,
      VelasNS.abi,
      provider
    );
    const marketItems = await contract.fetchMarketItems();
    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      marketItems.map(async (i) => {
        const jsonData = await contract.tokenURI(i.tokenId);

        var decoded_target_json = JSON.parse(
          atob(jsonData.replace(/^data:\w+\/\w+;base64,/, ""))
        );

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        let item = {
          domain: decoded_target_json.image,
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller.toUpperCase(),
          owner: i.owner.toUpperCase(),
        };
        return item;
      })
    );
    setData(items);
    updateCurrAddress(accounts[0].toUpperCase());
    updateDataFetched(true);
  }

  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    try {
      setBusy(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        VelasNS.address,
        VelasNS.abi,
        signer
      );
      const salePrice = ethers.utils.parseUnits(nft.price, "ether");
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: salePrice,
      });
      await transaction.wait();
      loadNFTs();
      alert("transaction successful");
      setBusy(false);
    } catch (error) {
      alert(error);

      setBusy(false);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) loadNFTs(tokenId);

  useEffect(() => {
    loadNFTs();
  }, []);

  return (
    <div>
      <div className="domainInputs">
        <div className="input_and_text">
          <input
            type={"text"}
            className="domainInput"
            placeholder="domain name"
            id={formParams.name}
            value={formParams.name}
            onChange={(e) =>
              updateFormParams({ ...formParams, name: e.target.value })
            }
          ></input>
          <input
            className="domain_text"
            placeholder=".vls"
            disabled={true}
          ></input>
        </div>
        <input
          type={"text"}
          className="domainInput_v"
          placeholder="set selling price for your domain"
          id={formParams.price}
          value={formParams.price}
          onChange={(e) =>
            updateFormParams({ ...formParams, price: e.target.value })
          }
        ></input>
        <button className="mint" onClick={MintNfts}>
          {busy ? "loading..." : "Mint"}
        </button>
      </div>

      {/*==========All minted domains=============*/}
      <div className="mintedDomains">
        <div className="allMintedDomains">All Minted Domains</div>
        <div className="mintedDomains_container">
          {data.map((nft, index) => (
            <div key={index} className="nftcard">
              <img src={nft.domain} className="domainNft"></img>
              <div className="price">{nft.price} ETL</div>
              {currAddress === nft.owner || currAddress === nft.seller ? (
                <button className="buy">you own this</button>
              ) : (
                <button className="buy" onClick={() => buyNft(nft)}>
                  {busy ? "..." : "buy"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/*==========footer=============*/}
      <div className="foot">.</div>
      <Navbar />
    </div>
  );
};

export default App;
