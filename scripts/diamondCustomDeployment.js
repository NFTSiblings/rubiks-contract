const diamondName = "TestRubiksCubeDiamond"
// set DiamondInit to the contract address of an existing initialiser contract,
// or set it to "deploy" to have the script deploy it, or set it to false to
// deploy without an intialiser contract.
const DiamondInit = "0x7c6008DB09Ad2B86415E24ffb23d18D9CeeEcB83"
const existingFacets = { // Goerli
  // if DiamondCutFacet is not present, it will be deployed
  DiamondCutFacet: "0xda1b9A1DA02f1B5868Da7924679056C40cF7a25E",
  DiamondLoupeFacet: "0x48B0e6eE743eF0F1fdE73BF31d9503Af346a668d",
  AdminPauseFacet: "0xE205194889E98Bab7321589580579F2085D5F622",
  AdminPrivilegesFacet: "0xD856D9C6C380f2791a6B0287736F1b4c8D32F730",
  AllowlistFacet: "0xEAb224FB204eBC7a399D70E1Db26beB5e48Be05e",
  ERC721AFacet: "0x23bfba4Dfc1661DD66BBdcD54843Af7f5f38c6A8",
  CenterFacet: "0x810bAb7C35A8f14843537E8B7702f079D80066a8",
  ERC165Facet: "0x2E86755E180edAbC72B61069a0520EcB10545346",
  RoyaltiesConfigFacet: "0x7cAc10CbA5e21ce5F79cB9FdD35AA359922c3314",
  SaleHandlerFacet: "0xFd63CCB9A34F17775527caA3b97e3bF98a876c82",
  PaymentSplitterFacet: "0x659A7730B5c5c2f2ED24307BFfBA3347F38B3150"
}
const excludeFunctions = {
  ERC721AFacet: [
    "_setAux(address,uint64)",
    "_safeMint(address,uint256)",
    "_safeMint(address,uint256,bytes)",
    "_getAux(address)",
    "_burn(uint256)",
    "_burn(uint256,bool)",
    "safeTransferFrom(address,address,uint256)",
    "safeTransferFrom(address,address,uint256,bytes)",
    "transferFrom(address,address,uint256)"
  ]
}

////////////////////////////////////////////////////////////

const { getSelectors, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {
  let diamondCutFacet
  if (existingFacets.DiamondCutFacet) {
    // get existing deployed DiamondCutFacet
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', existingFacets.DiamondCutFacet)
    console.log('DiamondCutFacet exists at:', diamondCutFacet.address)
  } else {
    // deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
    diamondCutFacet = await DiamondCutFacet.deploy()
    await diamondCutFacet.deployed()
    console.log('DiamondCutFacet deployed:', diamondCutFacet.address)
  }

  // deploy Diamond
  const Diamond = await ethers.getContractFactory(diamondName)
  const diamond = await Diamond.deploy(diamondCutFacet.address)
  await diamond.deployed()
  console.log('Diamond deployed:', diamond.address)

  let diamondInit
  if (ethers.utils.isAddress(DiamondInit)) {
    // get existing deployed DiamondInit contract
    diamondInit = await ethers.getContractAt('DiamondInit', DiamondInit)
    console.log('DiamondInit contract exists at:', diamondInit.address)
  } else if (DiamondInit == "deploy") {
    // deploy DiamondInit
    const DiamondInit = await ethers.getContractFactory('DiamondInit')
    diamondInit = await DiamondInit.deploy()
    await diamondInit.deployed()
    console.log('DiamondInit deployed:', diamondInit.address)
  }
  
  const cut = []
  for (const FacetName in existingFacets) {
    if (FacetName == "DiamondCutFacet") continue

    const facet = await ethers.getContractAt(FacetName, existingFacets[FacetName])
    console.log(`${FacetName} exists at ${facet.address}`)

    let remove = []
    if (excludeFunctions[FacetName]) remove = excludeFunctions[FacetName]

    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet).remove(remove)
    })
  }

  // upgrade diamond with facets
  console.log('')
  console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt

  // call to init function
  if (DiamondInit) {
    let functionCall = diamondInit.interface.encodeFunctionData('initAll')
    tx = await diamondCut.diamondCut(cut, DiamondInit, functionCall)
  } else {
    tx = await diamondCut.diamondCut(cut, ethers.constants.AddressZero, [])
  }

  console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond cut failed: ${tx.hash}`)
  }
  console.log('Completed diamond cut')
  return diamond.address
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deployDiamond().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

exports.deployDiamond = deployDiamond