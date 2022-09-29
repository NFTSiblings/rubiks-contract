const diamondName = "ERC721ADiamondTemplate"
// set DiamondInit to the contract address of an existing initialiser contract,
// or set it to "deploy" to have the script deploy it, or set it to false to
// deploy without an intialiser contract.
const DiamondInit = "0xFFeB46fE993b2dB2330694e0088831B4F2E213d9"
const existingFacets = { // Rinkeby
  // if DiamondCutFacet is not present, it will be deployed
  DiamondCutFacet: "0x3C616F532cBA23F2A2690B12FCA495aAD4a16E43",
  DiamondLoupeFacet: "0x706985da9e528b86c0553d676cac0315ff3c8d48",
  AdminPauseFacet: "0x92e28663ebf433d8a3785d96a70a6233dff60233",
  AdminPrivilegesFacet: "0x4b5f7cb0ebe63bfc7a125e7bea74f6beb5aef987",
  AllowlistFacet: "0x8cce85961d8fc6ef0c70a5ef21df0c0b190465d6",
  ERC721AFacet: "0x80d2c3f931ffbdf2977c4517a6319a46ffd5fdf7",
  CenterFacet: "0x2419740564746c90b64d0cc105f15617e4fe5462",
  ERC165Facet: "0x56e20b2e43a9b5862103d4e020e593fb5974bad5",
  RoyaltiesConfigFacet: "0x74a71e558abf9ed54a238c1e30041d6ed510260e",
  SaleHandlerFacet: "0xf8c21152fd4402a181ce17654ff196e5e76060fc",
  PaymentSplitterFacet: "0x1172c87e415f701c15c400a8114562d1475d1632"
}
const excludeFunctions = {
  ERC721AFacet: [
    "_setAux(address,uint64)",
    "_safeMint(address,uint256)",
    "_safeMint(address,uint256,bytes)",
    "_getAux(address)",
    "_burn(uint256)",
    "_burn(uint256,bool)"
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