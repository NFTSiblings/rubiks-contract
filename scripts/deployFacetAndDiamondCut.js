const { ethers } = require('hardhat')
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

const facetName = "CenterFacet";
const diamondAddress = "0x31D7Fe07B61CB11f66A502a6990926B18A633A77";
const diamondInitAddress = "0x719C20b49eFb87f30043673a862dFc980aFCff77";
const zeroAddress = "0x0000000000000000000000000000000000000000";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  
  console.log("Account balance:", (await deployer.getBalance()).toString());

  ////////////////////////////////////////////////////////////////////////////
  
  const Facet = await ethers.getContractFactory(facetName);
  const facet = await Facet.deploy();
  await facet.deployed();
  
  console.log("New contract address:", facet.address);

  ////////////////////////////////////////////////////////////////////////////

  // get existing deployed DiamondInit contract
  const diamondInit = await ethers.getContractAt('DiamondInit', diamondInitAddress)
  console.log('DiamondInit contract exists at:', diamondInit.address)

  ////////////////////////////////////////////////////////////////////////////

  const cut = [{
    facetAddress: facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(facet)
  }];

  console.log('')
  console.log('Diamond Cut:', cut)

  ////////////////////////////////////////////////////////////////////////////

  const diamondCut = await ethers.getContractAt('IDiamondCut', diamondAddress)
  let tx
  let receipt

  // call to init function
  // let functionCall = diamondInit.interface.encodeFunctionData('init' + facetName)
  // tx = await diamondCut.diamondCut(cut, diamondInitAddress, functionCall)

  tx = await diamondCut.diamondCut(cut, zeroAddress, [])

  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')

  ////////////////////////////////////////////////////////////////////////////

  console.log('Verifying new facet:')
  await hre.run("verify:verify", {
    address: facet.address
  });
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });