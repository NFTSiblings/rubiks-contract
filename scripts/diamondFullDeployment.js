/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, removeSelectors, remove, FacetCutAction } = require('./libraries/diamond.js')

async function deployDiamond () {

  const accounts = await ethers.getSigners()
  const contractOwner = accounts[0]

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet')
  const diamondCutFacet = await DiamondCutFacet.deploy()
  await diamondCutFacet.deployed()
  //console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

  // deploy Diamond
  const Diamond = await ethers.getContractFactory('ERC721ADiamondTemplate')
  const diamond = await Diamond.deploy(diamondCutFacet.address)
  await diamond.deployed()
  //console.log('Diamond deployed:', diamond.address)

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory('DiamondInit')
  const diamondInit = await DiamondInit.deploy()
  await diamondInit.deployed()
  //console.log('DiamondInit deployed:', diamondInit.address)

  // deploy facets
  //console.log('')
  //console.log('Deploying facets')
  const cut = []

  // Going for a manual diamondCut array to learn to manupilate the cut array properly
  // and also const of all the facet contracts might be useful when interacting with the diamond

  // AdminPauseFacet
  const AdminPauseFacet = await ethers.getContractFactory("AdminPauseFacet")
  const AdminPausefacet = await AdminPauseFacet.deploy()
  await AdminPausefacet.deployed()
  //console.log('AdminPauseFacet deployed: ' + AdminPausefacet.address)
  cut.push({
    facetAddress: AdminPausefacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(AdminPausefacet)
  })

  // AdminPrivilegesFacet
  const AdminPrivilegesFacet = await ethers.getContractFactory("AdminPrivilegesFacet")
  const AdminPrivilegesfacet = await AdminPrivilegesFacet.deploy()
  await AdminPrivilegesfacet.deployed()
  //console.log('AdminPrivilegesFacet deployed: ' + AdminPrivilegesfacet.address)
  cut.push({
    facetAddress: AdminPrivilegesfacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(AdminPrivilegesfacet)
  })

  // AllowlistFacet
  const AllowlistFacet = await ethers.getContractFactory("AllowlistFacet")
  const Allowlistfacet = await AllowlistFacet.deploy()
  await Allowlistfacet.deployed()
  //console.log('AllowlistFacet deployed: ' + Allowlistfacet.address)
  cut.push({
    facetAddress: Allowlistfacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(Allowlistfacet)
  })

  // CenterFacet
  const CenterFacet = await ethers.getContractFactory("CenterFacet")
  const Centerfacet = await CenterFacet.deploy()
  await Centerfacet.deployed()
  //console.log('CenterFacet deployed: ' + Centerfacet.address)
  cut.push({
    facetAddress: Centerfacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(Centerfacet)
  })
  
  // DiamondLoupeFacet
  const DiamondLoupeFacet = await ethers.getContractFactory("DiamondLoupeFacet")
  const DiamondLoupefacet = await DiamondLoupeFacet.deploy()
  await DiamondLoupefacet.deployed()
  //console.log('DiamondLoupeFacet deployed: ' + DiamondLoupefacet.address)
  cut.push({
    facetAddress: DiamondLoupefacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(DiamondLoupefacet)
  })

  //ERC165Facet
  const ERC165Facet = await ethers.getContractFactory("ERC165Facet")
  const ERC165facet = await ERC165Facet.deploy()
  await ERC165facet.deployed()
  //console.log('ERC165Facet deployed: ' + ERC165facet.address)
  cut.push({
    facetAddress: ERC165facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(ERC165facet)
  })

  //ERC721AFacet
  const ERC721AFacet = await ethers.getContractFactory("ERC721AFacet")
  const ERC721Afacet = await ERC721AFacet.deploy()
  await ERC721Afacet.deployed()
  getSelectors(ERC721Afacet)
  //console.log('ERC721AFacet deployed: ' + ERC721Afacet.address)
  const sig = [
    '0x095ea7b3', '0xa22cb465',
    '0x70a08231', '0x081812fc',
    '0xe985e9c5', '0x06fdde03',
    '0x6352211e', '0x95d89b41',
    '0x18160ddd', '0x8462151c'
  ] 
  cut.push({
    facetAddress: ERC721Afacet.address,
    action: FacetCutAction.Add,
    functionSelectors: sig
  })

  //PaymentSplitterFacet
  const PaymentSplitterFacet = await ethers.getContractFactory("PaymentSplitterFacet")
  const PaymentSplitterfacet = await PaymentSplitterFacet.deploy()
  await PaymentSplitterfacet.deployed()
  //console.log('PaymentSplitterFacet deployed: ' + PaymentSplitterfacet.address)
  cut.push({
    facetAddress: PaymentSplitterfacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(PaymentSplitterfacet)  
  })

  //RoyaltiesConfigFacet
  const RoyaltiesConfigFacet = await ethers.getContractFactory("RoyaltiesConfigFacet")
  const RoyaltiesConfigfacet = await RoyaltiesConfigFacet.deploy()
  await RoyaltiesConfigfacet.deployed()
  //console.log('RoyaltiesConfigFacet deployed: ' + RoyaltiesConfigfacet.address)
  cut.push({
    facetAddress:RoyaltiesConfigfacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(RoyaltiesConfigfacet)
  })

  const SaleHandlerFacet = await ethers.getContractFactory("SaleHandlerFacet")
  const SaleHandlerfacet = await SaleHandlerFacet.deploy()
  await SaleHandlerfacet.deployed()
  //console.log('SaleHandlerFacet deployed: ' + SaleHandlerfacet.address)
  cut.push({
    facetAddress: SaleHandlerfacet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(SaleHandlerfacet)
  })

  // upgrade diamond with facets
  //console.log('')
  //console.log('Diamond Cut:', cut)
  const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address)
  let tx
  let receipt
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData('initAll')
  //console.log(functionCall)
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall)
  //console.log('Diamond cut tx: ', tx.hash)
  receipt = await tx.wait()
  //console.log('')


  const CenterFacetDeployed = await ethers.getContractAt('CenterFacet', diamond.address)
  tx = await CenterFacetDeployed.setERC721AFacet(ERC721Afacet.address)
  receipt = await tx.wait()
  
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }
  //console.log('Completed diamond cut')
  const diamondAddresses = new Object()
  diamondAddresses.Diamond = diamond.address
  diamondAddresses.DiamondInit = diamondInit.address
  diamondAddresses.AdminPauseFacet = AdminPausefacet.address
  diamondAddresses.AdminPrivilegesFacet = AdminPrivilegesfacet.address
  diamondAddresses.AllowlistFacet = Allowlistfacet.address
  diamondAddresses.CenterFacet = Centerfacet.address
  diamondAddresses.DiamondCutFacet = diamondCutFacet.address
  diamondAddresses.DiamondLoupeFacet = DiamondLoupefacet.address
  diamondAddresses.ERC165Facet = ERC165facet.address
  diamondAddresses.ERC721AFacet = ERC721Afacet.address
  diamondAddresses.PaymentSplitterFacet = PaymentSplitterfacet.address
  diamondAddresses.RoyaltiesConfigFacet = RoyaltiesConfigfacet.address
  diamondAddresses.SaleHandlerFacet = SaleHandlerfacet.address

  return diamondAddresses
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

exports.deployDiamond = deployDiamond