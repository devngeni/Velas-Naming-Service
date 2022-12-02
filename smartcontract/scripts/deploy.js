/** @format */

const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const velasDomains = await hre.ethers.getContractFactory("Velas");
  const velasDNS = await velasDomains.deploy();
  await velasDNS.deployed();
  console.log("velasDNS deployed to:", velasDNS.address);

  const data = {
    address: velasDNS.address,
    abi: JSON.parse(velasDNS.interface.format("json")),
  };

  //This writes the ABI and address to the mktplace.json
  fs.writeFileSync("./velas_DNS.json", JSON.stringify(data));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
