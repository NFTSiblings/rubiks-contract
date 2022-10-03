// Console messages are currently disabled for testing purposes.
// They should be reenabled for deployments to testnets or mainnet!
const allowConsoleLogging = false
let diamondName = "TestRubiksCubeDiamond"
const excludeFacets = ["ExcludedFacet"]
const excludeFunctions = {
  ERC721AFacet: [
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
}

////////////////////////////////////////////////////////////

const fs = require('fs/promises')
const path = require('path')
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {
  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  if (allowConsoleLogging) console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  // deploy Diamond
  const Diamond = await ethers.getContractFactory(diamondName)
  const diamond = await Diamond.deploy(diamondCutFacet.address)
  await diamond.deployed()
  if (allowConsoleLogging) console.log('Diamond deployed:', diamond.address)

  // deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory('DiamondInit')
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  if (allowConsoleLogging) console.log('DiamondInit deployed:', diamondInit.address)

  // deploy facets
  if (allowConsoleLogging) {
    console.log('')
    console.log('Deploying facets')
  }

  // get list of facets to add from files in the contracts directory
  // note that file names must be the same as the contract name for this to work
  const FacetFileNames = await fs.readdir(path.join(path.resolve(), '/contracts/facets'))
  const FacetNames = []
  FacetFileNames.forEach((fileName) => {
    let contractName = fileName.substring(0, fileName.length - 4)
    if (
      fileName != "DiamondCutFacet.sol" &&
      !excludeFacets.includes(fileName || contractName)
    ) FacetNames.push(contractName)
  })

  const cut = []
  const FacetAddresses = []
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName)
    const facet = await Facet.deploy()
    await facet.deployed()
    FacetAddresses.push(facet.address)
    if (allowConsoleLogging) console.log(`${FacetName} deployed: ${facet.address}`)
    
    let remove = []
    if (excludeFunctions[FacetName]) remove = excludeFunctions[FacetName]

    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet).remove(remove)
    })
  }

  // upgrade diamond with facets
  if (allowConsoleLogging) {
    console.log('')
    console.log('Diamond Cut:', cut)
  }
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData('initAll')
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
  if (allowConsoleLogging) console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond cut failed: ${tx.hash}`)
  }
  if (allowConsoleLogging) console.log('Completed diamond cut')
  
  const CenterFacetDeployed = await ethers.getContractAt('CenterFacet', diamond.address)
  await CenterFacetDeployed.setERC721AFacet(FacetAddresses[6])
  const diamondAddresses = new Object()
  diamondAddresses.Diamond = diamond.address
  diamondAddresses.DiamondInit = diamondInit.address
  diamondAddresses.AdminPauseFacet = FacetAddresses[0]
  diamondAddresses.AdminPrivilegesFacet = FacetAddresses[1]
  diamondAddresses.AllowlistFacet = FacetAddresses[2]
  diamondAddresses.CenterFacet = FacetAddresses[3]
  diamondAddresses.DiamondCutFacet = diamondCutFacet.address
  diamondAddresses.DiamondLoupeFacet = FacetAddresses[4]
  diamondAddresses.ERC165Facet = FacetAddresses[5]
  diamondAddresses.ERC721AFacet = FacetAddresses[6]
  diamondAddresses.PaymentSplitterFacet = FacetAddresses[7]
  diamondAddresses.RoyaltiesConfigFacet = FacetAddresses[8]
  diamondAddresses.SaleHandlerFacet = FacetAddresses[9]

  return diamondAddresses
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDiamond().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

exports.deployDiamond = deployDiamond