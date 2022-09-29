const facetName = "ERC721AFacet"
const Diamond = "0xCACA247E67A9E57b36c266db378Cf29d828256fF"
// const DiamondInit = "0x2440FbB92BADC44dAb731634B46842a3D73EBC41"
const DiamondInit = false
const excludeFunctions = [
  "_BITMASK_ADDRESS()",
  "_BITMASK_ADDRESS_DATA_ENTRY()",
  "_BITMASK_AUX_COMPLEMENT()",
  "_BITMASK_BURNED()",
  "_BITMASK_EXTRA_DATA_COMPLEMENT()",
  "_BITMASK_NEXT_INITIALIZED()",
  "_BITPOS_AUX()",
  "_BITPOS_EXTRA_DATA()",
  "_BITPOS_NEXT_INITIALIZED()",
  "_BITPOS_NUMBER_BURNED()",
  "_BITPOS_NUMBER_MINTED()",
  "_BITPOS_START_TIMESTAMP()",
  "_MAX_MINT_ERC2309_QUANTITY_LIMIT()",
  "_TRANSFER_EVENT_SIGNATURE()",
  "__burn(uint256,bool)",
  "__burn(uint256)",
  "__checkContractOnERC721Received(address,address,uint256,bytes)",
  "__extraData(address,address,uint24)",
  "__getApprovedSlotAndAddress(uint256)",
  "__getAux(address)",
  "__initializeOwnershipAt(uint256)",
  "__isSenderApprovedOrOwner(address,address,address)",
  "__mint(address,uint256)",
  "__nextExtraData(address,address,uint256)",
  "__nextInitializedFlag(uint256)",
  "__ownershipAt(uint256)",
  "__ownershipOf(uint256)",
  "__packOwnershipData(address,uint256)",
  "__packedOwnershipOf(uint256)",
  "__safeMint(address,uint256,bytes)",
  "__safeMint(address,uint256)",
  "__setAux(address,uint64)",
  "__setExtraDataAt(uint256,uint24)",
  "__startTokenId()",
  "__unpackedOwnership(uint256)",
  "_checkContractOnERC721Received(address,address,uint256,bytes)",
  "_explicitOwnershipOf(uint256)",
  "_getApprovedSlotAndAddress(uint256)",
  "_isSenderApprovedOrOwner(address,address,address)",
  "_nextExtraData(address,address,uint256)",
  "_nextInitializedFlag(uint256)",
  "_packOwnershipData(address,uint256)",
  "_packedOwnershipOf(uint256)",
  "_unpackedOwnership(uint256)",
  "explicitOwnershipOf(uint256)",
  "safeTransferFrom(address,address,uint256)",
  "safeTransferFrom(address,address,uint256,bytes)",
  "transferFrom(address,address,uint256)"
]

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
    functionSelectors: getSelectors(facet).remove(excludeFunctions)
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