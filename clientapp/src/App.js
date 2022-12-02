/** @format */

import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { ethers } from "ethers";
import VelasNS from "./utils/velas_abi.json";
import { useParams } from "react-router-dom";

const provider = new ethers.providers.JsonRpcProvider(
  "https://explorer.testnet.velas.com/rpc"
);

const App = () => {
  const [formParams, updateFormParams] = useState({
    name: "",
    price: "",
    resellprice: "",
  });
  const [data, setData] = useState([]);
  const [currAddress, updateCurrAddress] = useState([]);
  const [dataFetched, updateDataFetched] = useState(false);
  const [theData, setTheData] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setAct] = useState(false);
  const [nftsData, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [loadingStateX, setLoadingStateX] = useState("not-loaded");

  const { name, price, resellprice } = formParams;

  const MintNfts = async () => {
    if (!name || !price) {
      alert("all field are required");
    }
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Pull the deployed contract instance

      let contract = new ethers.Contract(VelasNS.address, VelasNS.abi, signer);
      let listingPrice = await contract.getListingPrice();
      listingPrice = listingPrice.toString();
      const price = ethers.utils.parseEther(formParams.price.toString());
      let transaction = await contract.register(price, formParams.name, {
        value: listingPrice,
      });
      await transaction.wait();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(error);
    }
  };

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */

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
          image: decoded_target_json.image,
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
    setLoadingStateX("loaded");
  }

  async function myNfts() {
    const thisProv = new ethers.providers.Web3Provider(window.ethereum);
    const signer = thisProv.getSigner();
    const contract = new ethers.Contract(VelasNS.address, VelasNS.abi, signer);
    const myNft = await contract.fetchMyNFTs();
    console.log("market", myNft);

    const items = await Promise.all(
      myNft.map(async (i) => {
        const jsonData = await contract.tokenURI(i.tokenId);
        var decoded_target_json = JSON.parse(
          atob(jsonData.replace(/^data:\w+\/\w+;base64,/, ""))
        );
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          image: decoded_target_json.image,
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller.toUpperCase(),
          owner: i.owner.toUpperCase(),
        };
        return item;
      })
    );
    setNfts(items);
    setTheData(true);
    setLoadingState("loaded");
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

  async function listNFTForSale(tokenId) {
    try {
      if (!resellprice) {
        alert("price field is empty!");
      }
      setAct(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const priceFormatted = ethers.utils.parseEther(
        formParams.resellprice.toString()
      );
      let contract = new ethers.Contract(VelasNS.address, VelasNS.abi, signer);
      let listingPrice = await contract.getListingPrice();

      listingPrice = listingPrice.toString();
      let transaction = await contract.resellToken(tokenId, priceFormatted, {
        value: listingPrice,
      });
      await transaction.wait();
      setAct(false);
      alert("resold successfully");
    } catch (error) {
      setAct(false);
      alert(error);
    }
  }

  const params = useParams();
  const tokenId = params.tokenId;
  if (!dataFetched) {
    loadNFTs(tokenId);
  }

  if (!theData) {
    myNfts();
  }

  useEffect(() => {
    loadNFTs();
    myNfts();
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
          {loading ? "loading..." : "Mint"}
        </button>
      </div>

      {/*==========All minted domains=============*/}
      {loadingStateX === "loaded" && !data.length ? (
        ""
      ) : (
        <div className="mintedDomains">
          <div className="allMintedDomains">All Minted Domains</div>
          <div className="mintedDomains_container">
            {data.map((nft, index) => (
              <div key={index} className="nftcard">
                <img src={nft.image} className="domainNft"></img>
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
      )}

      {loadingState === "loaded" && !nftsData.length ? (
        ""
      ) : (
        <div className="mintedDomains">
          <div className="allMintedDomains">Domains you own </div>
          <div className="mintedDomains_container">
            {nftsData.map((nft, index) => (
              <div key={index} className="nftcard_">
                <img src={nft.image} className="domainNft"></img>
                <div className="price_">
                  previous price: <span>{nft.price} ETL</span>
                </div>
                <div className="updatePrice">
                  update price:{" "}
                  <input
                    type={"number"}
                    className="updatePrice_input"
                    id={formParams.resellprice}
                    value={formParams.resellprice}
                    onChange={(e) =>
                      updateFormParams({
                        ...formParams,
                        resellprice: e.target.value,
                      })
                    }
                  />{" "}
                  ETL
                </div>
                <button
                  className="resellBtn"
                  onClick={() => listNFTForSale(nft.tokenId)}
                >
                  {active ? "loading..." : " Resell"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/*==========footer=============*/}
      <div className="foot">.</div>
      <Navbar />
    </div>
  );
};

export default App;
