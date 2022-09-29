const facetName = "PaymentSplitterFacet"
const Diamond = "0x31D7Fe07B61CB11f66A502a6990926B18A633A77"
// const DiamondInit = "0x2440FbB92BADC44dAb731634B46842a3D73EBC41"
const DiamondInit = false

////////////////////////////////////////////////////////////////////////////

const { ethers } = require('hardhat')
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function main() {
  const [deployer] = await ethers.getSigners()
  
  console.log("Deploying facet with the account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  ////////////////////////////////////////////////////////////////////////////
  
  const Facet = await ethers.getContractFactory(facetName)
  const facet = await Facet.deploy()
  await facet.deployed()
  
  console.log(`${facetName} deployed: ${facet.address}`)

  ////////////////////////////////////////////////////////////////////////////

  // get existing deployed DiamondInit contract
  let diamondInit
  if (DiamondInit) {
    diamondInit = await ethers.getContractAt('DiamondInit', DiamondInit)
    console.log('DiamondInit contract exists at:', diamondInit.address)
  }

  ////////////////////////////////////////////////////////////////////////////

  const cut = [{
    facetAddress: facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(facet)
  }]

  console.log('')
  console.log('Diamond Cut:', cut)

  ////////////////////////////////////////////////////////////////////////////

  const diamondCut = await ethers.getContractAt('IDiamondCut', Diamond)
  let tx
  let receipt

  // call to init function
  if (DiamondInit) {
    let functionCall = diamondInit.interface.encodeFunctionData('init' + facetName)
    tx = await diamondCut.diamondCut(cut, DiamondInit, functionCall)
  } else {
    tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, [])
  }

  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')

  ////////////////////////////////////////////////////////////////////////////

  console.log('Verifying new facet:')
  await hre.run("verify:verify", { address: facet.address })
}
  
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})