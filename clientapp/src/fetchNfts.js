/** @format */

async function myNfts() {
  const provider = new ethers.providers.Web3Provider(window.etherum);
  //   const signer = provider.getSigner();

  const contract = new ethers.Contract(
    marketplaceAddress,
    NFTMarketplace.abi,
    provider
  );
  const data = await contract.fetchMyNFTs();

  const items = await Promise.all(
    data.map(async (i) => {
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
  setNfts(items);
  setLoadingState("loaded");
}

async function listNFTForSale(index) {
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
    let transaction = await contract.resellToken(
      index.tokenId,
      priceFormatted,
      {
        value: listingPrice,
      }
    );
    await transaction.wait();
    setAct(false);
    alert("resold successfully");
  } catch (error) {
    setAct(false);
    alert(error.code);
  }
}

setTimeout(function () {}, 2000);
