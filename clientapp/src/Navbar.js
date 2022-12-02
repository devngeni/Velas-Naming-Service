/** @format */

import React, { useEffect, useState } from "react";

const Navbar = () => {
  const [currentAdd, updateCurrAddress] = useState("0x");

  const numberToHex = (num) => {
    const val = Number(num);
    return "0x" + val.toString(16);
  };
  const walletConnet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateCurrAddress(
      String(
        accounts[0].substring(0, 5) + "..." + String(accounts[0].substring(38))
      )
    );

    if (window.ethereum.networkVersion !== 111) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(111) }],
      });
    }
  };

  useEffect(() => {
    walletConnet();
  }, [currentAdd]);

  if (currentAdd === "0x") {
    walletConnet();
  }
  return (
    <div className="App">
      <div className="logo">Velas Name Service</div>
      {currentAdd === "0x" ? (
        <button className="walletBtn">connect</button>
      ) : (
        <button className="walletBtn" onClick={walletConnet}>
          Wallet:{currentAdd}
        </button>
      )}
    </div>
  );
};

export default Navbar;
