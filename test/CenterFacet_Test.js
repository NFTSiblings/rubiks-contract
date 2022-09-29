const { expect } = require('chai')
const { deployDiamond } = require('../scripts/diamondFullDeployment.js')
const helpers = require('@nomicfoundation/hardhat-network-helpers')


describe("CenterFacet", () => {
    

    beforeEach(async () => {

        [owner, address1, address2, address3, address4, address5, address6] = await ethers.getSigners()

        diamond = await deployDiamond()
        TestDiamond = await ethers.getContractAt('TestRubiksCubeDiamond', diamond)
        AdminPauseFacet = await ethers.getContractAt('AdminPauseFacet', diamond)
        AdminPrivilegesFacet = await ethers.getContractAt('AdminPrivilegesFacet', diamond)
        Allowlist = await ethers.getContractAt('AllowlistFacet', diamond)
        CenterFacet = await ethers.getContractAt('CenterFacet', diamond)
        DiamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamond)
        DiamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamond)
        ERC165Facet = await ethers.getContractAt('ERC165Facet', diamond)
        ERC721AFacet = await ethers.getContractAt('ERC721AFacet', diamond)
        PaymentSplitterFacet = await ethers.getContractAt('PaymentSplitterFacet', diamond)
        RoyaltiesConfigFacet = await ethers.getContractAt('RoyaltiesConfigFacet', diamond)
        SaleHandlerFacet = await ethers.getContractAt('SaleHandlerFacet', diamond)

        await CenterFacet.setERC721AFacet(ERC721AFacet.address)
        
        priceAl = ethers.utils.parseEther('0.001')
        price = ethers.utils.parseEther('0.0015')

        merkleProof1 = [
            '0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0',
            '0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94'
        ]

        merkleProof2 = [
            '0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9',
            '0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94'
        ]

        merkleProof3 = [
            '0x070e8db97b197cc0e4a1790c5e6c3667bab32d733db7f815fbe84f5824c7168d'
          ]
        
    })

    describe('Internal Minting logic', () => {

        it('Check the simple reserve function', async () => {

            await CenterFacet.reserve(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(1)

        })

    })

    describe('Check maxSupply function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.maxSupply()).to.equal(22)

        })

    })

    describe('Check reservedRemaining function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.reservedRemaining()).to.equal(7)

        })
        
    })

    describe('Check walletCap function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.walletCap()).to.equal(4)

        })
        
    })

    describe('Check priceAL function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.priceAL()).to.equal(ethers.BigNumber.from(ethers.utils.parseEther("0.001")))

        })
        
    })

    describe('Check price function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.price()).to.equal(ethers.BigNumber.from(ethers.utils.parseEther("0.0015")))

        })
        
    })

    describe('Check burnStatus function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.burnStatus()).to.equal(false)

        })

    })

    describe('Check ERC721AFacet function', () => {

        it('Check the initial states', async () => {

            expect(await CenterFacet.ERC721AFacet()).to.equal(ERC721AFacet.address)

        })
        
    })

    describe('Check level function', () => {

        it('Check the initial states', async () => {

            await CenterFacet.reserve(1);
            expect(await CenterFacet.level(0)).to.equal(0)

        })

        it("Reverts if the tokenId doesn't exist", async () => {

            await expect(CenterFacet.level(0))
            .to.be.revertedWith("Given tokenId doesn't exist")

        })
        
    })

    describe('Check setPrices function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            price = [ethers.BigNumber.from(ethers.utils.parseEther('0.01')), ethers.BigNumber.from(ethers.utils.parseEther('0.015'))]

        })

        it('Admins should setPrices', async () => {

            await CenterFacet.connect(owner).setPrices(price[0], price[1])
            expect(await CenterFacet.priceAL()).to.equal(price[0])
            expect(await CenterFacet.price()).to.equal(price[1])

        })

        it('Non-admin calling setPrices should revert', async () => {

            await expect(CenterFacet.connect(address1).setPrices(price[0], price[1]))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check setWalletCap function', () => {
        
        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            walletCap = 5

        })

        it('Admins should setWalletCap', async () => {

            await CenterFacet.connect(owner).setWalletCap(walletCap)
            expect(await CenterFacet.walletCap()).to.equal(walletCap)

        })

        it('Non-admin calling setWalletCap should revert', async () => {

            await expect(CenterFacet.connect(address1).setWalletCap(walletCap))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })

    })

    describe('Check toggleBurnStatus function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            currentBurnStatus = await CenterFacet.burnStatus()

        })

        it('Admins should toggleBurnStatus', async () => {

            await CenterFacet.connect(owner).toggleBurnStatus()
            expect(await CenterFacet.burnStatus()).to.equal(!currentBurnStatus)

        })

        it('Non-admin calling toggleburnStatus should revert', async () => {

            await expect(CenterFacet.connect(address1).toggleBurnStatus())
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check setBaseURI function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)
            await CenterFacet.reserve(1)
            baseURI = 'https://gateway.ipfs.io/#1243/'

        })

        it('Admins should setBaseURI', async () => {

            await CenterFacet.connect(owner).setBaseURI(baseURI)
            expect(await CenterFacet.tokenURI(0)).to.equal(baseURI + "0")

        })

        it('Non-admin calling setBaseURI should revert', async () => {

            await expect(CenterFacet.connect(address1).setBaseURI(baseURI))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check setERC721AFacet function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)

        })

        it('Admins should setERC721AFacet', async () => {

            await CenterFacet.connect(owner).setERC721AFacet(ERC721AFacet.address)
            expect(await CenterFacet.ERC721AFacet()).to.equal(ERC721AFacet.address)

        })

        it('Non-admin calling setERC721AFacet should revert', async () => {

            await expect(CenterFacet.connect(address1).setERC721AFacet(ERC721AFacet.address))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')

        })
        
    })

    describe('Check reserve function', () => {

        beforeEach(async () => {

            expect(await AdminPrivilegesFacet.isAdmin(owner.address)).to.equal(true)
            expect(await AdminPrivilegesFacet.isAdmin(address1.address)).to.equal(false)

            currentTotalSupply = await ERC721AFacet.totalSupply()
            currentBalanceOfOwner = await ERC721AFacet.balanceOf(owner.address)
            reservedRemaining = await CenterFacet.reservedRemaining()

        })

        it('reserve function working as intended', async () => {

            await CenterFacet.connect(owner).reserve(reservedRemaining)
            expect(await ERC721AFacet.totalSupply()).to.equal(currentTotalSupply + 3)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(currentBalanceOfOwner + 3)

        })

        it('Mint reservedRemaining in batches', async () => {

            const numberOfTokensToMint = 1
            const newReservedRemaining = reservedRemaining - numberOfTokensToMint

            await CenterFacet.connect(owner).reserve(numberOfTokensToMint)
            expect(await ERC721AFacet.totalSupply()).to.equal(currentTotalSupply + numberOfTokensToMint)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(currentBalanceOfOwner + numberOfTokensToMint)

            await CenterFacet.connect(owner).reserve(newReservedRemaining)
            expect(await ERC721AFacet.totalSupply()).to.equal(ethers.BigNumber.from(currentTotalSupply).add(numberOfTokensToMint + 2))
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(ethers.BigNumber.from(currentBalanceOfOwner).add(numberOfTokensToMint + 2))

        })
        
        it('Non-admin calling reserve should revert', async () => {

            await expect(CenterFacet.connect(address1).reserve(reservedRemaining))
            .to.be.revertedWith('GlobalState: caller is not admin or owner')
            
        })

        it('Admin cannot mint more than reservedRemaining', async () => {
            
            await expect(CenterFacet.reserve(reservedRemaining + 1))
            .to.be.revertedWith('Not enough reserved mint remaining')

        })

    })

    describe('Check mint function', () => {

        beforeEach(async () => {

            expect(await ERC721AFacet.totalSupply()).to.equal(0)
            expect(await AdminPauseFacet.paused()).to.equal(false)
            priceAl = ethers.utils.parseEther('0.001')
            price = ethers.utils.parseEther('0.0015')

        })

        it('mint function reverted as either sale did not start', async () => {

            const amountToMint = 4
            await expect(CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value:price*amountToMint}))
            .to.be.revertedWith('CenterFacet: Sale is not active')

        })

        it('mint function working as intended for privSale(mint 1)', async () => {

            const amountToMint = 1
            await helpers.time.increaseTo(await SaleHandlerFacet.saleTimestamp())
            await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: priceAl*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.balance; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(0)

        })

        it('mint function working as intended for privSale(mint 2)', async () => {

            const amountToMint = 2
            await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: priceAl*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(1)
            

        })

        it('mint function working as intended for privSale(mint 3)', async () => {

            const amountToMint = 3
            await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: priceAl*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(2)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(1)
            expect(await CenterFacet.level(tokenIds[1])).to.equal(0)
            

        })

        it('mint function working as intended for privSale(mint 4)', async () => {

            const amountToMint = 4
            await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: priceAl*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(2)

        })

        it('mint function working as intended for publicSale(mint 1)', async () => {

            const amountToMint = 1
            await helpers.time.increaseTo((await SaleHandlerFacet.saleTimestamp()).add((await SaleHandlerFacet.privSaleLength())))
            await CenterFacet.connect(address1).mint(amountToMint, [], {value: price*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(0)


        })

        it('mint function working as intended for publicSale(mint 2)', async () => {

            const amountToMint = 2
            await CenterFacet.connect(address1).mint(amountToMint, [], {value: price*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(1)    

        })

        it('mint function working as intended for publicSale(mint 3)', async () => {

            const amountToMint = 3
            await CenterFacet.connect(address1).mint(amountToMint, [], {value: price*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(2)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(1)
            expect(await CenterFacet.level(tokenIds[1])).to.equal(0)

        })

        it('mint function working as intended for publicSale(mint 4)', async () => {

            const amountToMint = 4
            await CenterFacet.connect(address1).mint(amountToMint, [], {value: price*amountToMint})
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            const tokenIds = await ERC721AFacet.tokensOfOwner(address1.address)
            for(let i = 0; i < tokenIds.length; i++) {
                expect(await ERC721AFacet.ownerOf(tokenIds[i])).to.equal(address1.address)
            }
            expect(await CenterFacet.level(tokenIds[0])).to.equal(2)

        })

        it('mint function reverted as improper amount sent', async () => {

            const amountToMint = 4
            await expect(CenterFacet.connect(address1).mint(amountToMint, [], {value: price*2}))
            .to.be.revertedWith('CenterFacet: incorrect amount of ether sent')
            await expect(CenterFacet.connect(address1).mint(amountToMint, []))
            .to.be.revertedWith('CenterFacet: incorrect amount of ether sent')

        })

        it('mint function reverted as minting more than walletCap', async () => {

            const amountToMint = 1
            for(let i = 0; i < 4; i++) {
                await CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: price*amountToMint})
            }
            await expect(CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value: price*amountToMint}))
            .to.be.revertedWith('CenterFacet: maximum tokens per wallet during the sale is 4')

        })

        it('mint function reverted as supply has ended', async () => {

            const newWalletCap = 23
            await CenterFacet.setWalletCap(newWalletCap)
            const fullAmount = ethers.BigNumber.from(price).mul(11)
            for(let i = 0; i < 2; i++) {
                await CenterFacet.mint(11, [], {value: fullAmount})
            }
            await expect(CenterFacet.mint(1, [], {value: price}))
            .to.be.revertedWith('Too few tokens remaining')

        })

    })

    describe('Check burn function', () => {

        beforeEach(async () => {

            numberOfTokensToMint = 1
            currentTotalSupply = await ERC721AFacet.totalSupply()
            currentBalanceOfAddress1 = await ERC721AFacet.balanceOf(address1.address)

            await CenterFacet.connect(address1).mint(1, [], {value: price})
            expect(await CenterFacet.burnStatus()).to.equal(false)
            await CenterFacet.toggleBurnStatus()
            expect(await CenterFacet.burnStatus()).to.equal(true)
            expect(await AdminPauseFacet.paused()).to.equal(false)
            tokenIdsOfAddress1 = await ERC721AFacet.tokensOfOwner(address1.address)

        })
        
        it('burn function works as intended', async () => {

            await CenterFacet.connect(address1).burn(tokenIdsOfAddress1[0])
            expect(await ERC721AFacet.totalSupply()).to.equal(currentTotalSupply + numberOfTokensToMint - 1)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(currentBalanceOfAddress1 + numberOfTokensToMint - 1)
            
        })

        it('burn function reverts when contract is paused', async () => {

            await AdminPauseFacet.togglePause()
            expect(await AdminPauseFacet.paused()).to.equal(true)
            await expect(CenterFacet.connect(address1).burn(tokenIdsOfAddress1[0]))
            .to.be.revertedWith('GlobalState: contract is paused')
            
        })

        it('burn function reverts when burnStatus is false', async () => {

            await CenterFacet.toggleBurnStatus()
            expect(await CenterFacet.burnStatus()).to.equal(false)
            await expect(CenterFacet.connect(address1).burn(tokenIdsOfAddress1[0]))
            .to.be.revertedWith('CenterFacet: token burning is not available now')
            
        })

        it('burn function reverts when the sender is the owner of the tokenId', async () => {

            await expect(CenterFacet.connect(owner).burn(tokenIdsOfAddress1[0]))
            .to.be.revertedWith('CenterFacet: delegate call from CenterFacet to ERC721AFacet failed')
            
        })

    })

    describe('Check tokenURI function', () => {

        beforeEach(async () => {

            await CenterFacet.reserve(1)
            baseURI = 'https://gateway.ipfs.io/'
            await CenterFacet.setBaseURI(baseURI)

        })

        it('Check tokenURI function is working correctly', async () => {

            expect(await CenterFacet.tokenURI(0)).to.equal(baseURI + '0')

        })
        
    })

    describe('Check transferFrom function', () => {

        beforeEach(async () => {

            await CenterFacet.reserve(7)
            await CenterFacet.connect(address1).mint(1, [], {value: price})
            await CenterFacet.connect(address2).mint(2, [], {value: price*2})
            await CenterFacet.connect(address3).mint(3, [], {value: price*3})
            await CenterFacet.connect(address4).mint(4, [], {value: price*4})
            await CenterFacet.connect(address6).mint(1, [], {value: price})
            tokenIdsOfOwner = await ERC721AFacet.tokensOfOwner(owner.address)
            tokenIdsOfAddress1 = await ERC721AFacet.tokensOfOwner(address1.address)
            tokenIdsOfAddress2 = await ERC721AFacet.tokensOfOwner(address2.address)
            tokenIdsOfAddress3 = await ERC721AFacet.tokensOfOwner(address3.address)
            tokenIdsOfAddress4 = await ERC721AFacet.tokensOfOwner(address4.address)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address4.address)
            tokenIdsOfAddress6 = await ERC721AFacet.tokensOfOwner(address6.address)
            olderTotalSupply = await ERC721AFacet.totalSupply()

        })

        it('transferFrom function working as intended and checking merge works as intended for 3x3', async () => {

            // Four different scenerios to test when receiving a 3x3, as 3x3 and 4x4 are the levels when merge can happen
            // Each wallet can have either 0 or 1 token of 3x3 and 4x4
            // Based on the following four situations come up:
            // 1 => (0, 0); 2 => (1, 0); 3 => (0, 1); 4 => (1, 1)

            let tokenIdToBeSend

            // Situation 1 (0, 0) -> (1, 0) (No burn/merge)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(0)
            let firstTokenIdSent = tokenIdsOfAddress1[0]
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(0)
            let tx1 = await CenterFacet.connect(address1).transferFrom(address1.address, address5.address, firstTokenIdSent)
            let receipt1 = await tx1.wait()
            expect(receipt1.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(0)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(0)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

            // Situation 2 (1, 0) -> (0, 1) (1 burn/merge)
            expect(await ERC721AFacet.balanceOf(address3.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            let secondTokenIdSent = tokenIdsOfAddress3[1]
            expect(await CenterFacet.level(secondTokenIdSent)).to.equal(0)
            let tx2 = await CenterFacet.connect(address3).transferFrom(address3.address, address5.address, secondTokenIdSent)
            let receipt2 = await tx2.wait()
            expect(receipt2.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address3.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
            await expect(CenterFacet.level(secondTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

            // Situation 3 (0, 1) -> (1, 1) (No burn/merge)
            expect(await ERC721AFacet.balanceOf(address6.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            let thirdTokenIdSent = tokenIdsOfAddress6[0]
            expect(await CenterFacet.level(thirdTokenIdSent)).to.equal(0)
            let tx3 = await CenterFacet.connect(address6).transferFrom(address6.address, address5.address, thirdTokenIdSent)
            let receipt3 = await tx3.wait()
            expect(receipt3.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address6.address)).to.equal(0)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(2)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
            expect(await CenterFacet.level((tokenIdsOfAddress1[0]))).to.equal(1)
            expect(await CenterFacet.level(thirdTokenIdSent)).to.equal(0)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(2)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)
            expect(tokenIdsOfAddress5[1]).to.equal(thirdTokenIdSent)

            // Situation 4 (1, 1) -> (0, 0) (2 burn/merge)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(2)
            let fourthTokenIdSent = tokenIdsOfOwner[2]
            expect(await CenterFacet.level(fourthTokenIdSent)).to.equal(0)
            let tx4 = await CenterFacet.connect(owner).transferFrom(owner.address, address5.address, fourthTokenIdSent)
            let receipt4 = await tx4.wait()
            expect(receipt4.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 3)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            await expect(CenterFacet.level(fourthTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            await expect(CenterFacet.level(thirdTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

        })
        
        it('transferFrom function working as intended and checking merge works as intended for 4x4', async () => {

            // Only two different scenerios to test when receiving a 4x4, as it affects 4x4 level
            // Each wallet can have either 0 or 1 token of 4x4
            // Based on the following four situations come up:
            // 1 => (0); 2 => (1)

           // Situation 1 (0) -> (1) (No burn/merge)
           expect(await ERC721AFacet.balanceOf(address2.address)).to.equal(1)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(0)
           let firstTokenIdSent = tokenIdsOfAddress2[0]
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
           let tx1 = await CenterFacet.connect(address2).transferFrom(address2.address, address5.address, firstTokenIdSent)
           let receipt1 = await tx1.wait()
           expect(receipt1.status).to.equal(1)
           expect(await ERC721AFacet.balanceOf(address2.address)).to.equal(0)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
           tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
           expect(tokenIdsOfAddress5.length).to.equal(1)
           expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

           // Situation 1 (1) -> (0) (1 burn/merge)
           expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           let secondTokenIdSent = tokenIdsOfOwner[1]
           expect(await CenterFacet.level(secondTokenIdSent)).to.equal(1)
           let tx2 = await CenterFacet.connect(owner).transferFrom(owner.address, address5.address, secondTokenIdSent)
           let receipt2 = await tx2.wait()
           expect(receipt2.status).to.equal(1)
           expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
           await expect(CenterFacet.level(secondTokenIdSent))
           .to.be.revertedWith("Given tokenId doesn't exist")
           tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
           expect(tokenIdsOfAddress5.length).to.equal(1)
           expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

        })

        it('transferFrom function working as intended and checking merge works as intended for 5x5', async () => {

            // As there is no merge for 5x5 cubes, transfering a 5x5 cube should work as regular transfer
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
            expect(await ERC721AFacet.balanceOf(address4.address)).to.equal(1)
            let firstTokenIdSent = tokenIdsOfOwner[0]
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            let tx = await CenterFacet.connect(owner).transferFrom(owner.address, address4.address, firstTokenIdSent)
            let receipt = await tx.wait()
            expect(receipt.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address4.address)).to.equal(2)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            const newTokenIdsOfAddress4 = await ERC721AFacet.tokensOfOwner(address4.address)
            expect(newTokenIdsOfAddress4.length).to.equal(2)
            expect(newTokenIdsOfAddress4[0]).to.equal(firstTokenIdSent)
            expect(newTokenIdsOfAddress4[1]).to.equal(tokenIdsOfAddress4[0])

        })

        it("transferFrom function reverting if the token doesn't exist", async () => {

            await expect(CenterFacet.connect(owner).transferFrom(owner.address, address5.address, 2334))
            .to.be.revertedWith('Given tokenId does not exist')

        })

        it('transferFrom function reverting if from address is not owner or approaved address', async () => {

            // Not approved or owner wallet transfering the wallet is not successful (Connect wallet and token to transferFrom are different)
            await CenterFacet.connect(address1).transferFrom(address2.address, address5.address, tokenIdsOfAddress2[0])
            expect(await ERC721AFacet.ownerOf(tokenIdsOfAddress2[0])).to.equal(address2.address)

            // Not approved or owner wallet transfering the wallet is not successful (tokenId doesn't not belong to the connect wallet or the from address)
            await CenterFacet.connect(address1).transferFrom(address1.address, address5.address, tokenIdsOfAddress2[0])
            expect(await ERC721AFacet.ownerOf(tokenIdsOfAddress2[0])).to.equal(address2.address)

        })
        
    })

    describe('Check safeTransferFrom function', () => {

        beforeEach(async () => {

            await CenterFacet.reserve(7)
            //await helpers.time.increaseTo(ethers.BigNumber.from(await SaleHandlerFacet.saleTimestamp()).add(await SaleHandlerFacet.privSaleLength()))
            await CenterFacet.connect(address1).mint(1, [], {value: price})
            await CenterFacet.connect(address2).mint(2, [], {value: price*2})
            await CenterFacet.connect(address3).mint(3, [], {value: price*3})
            await CenterFacet.connect(address4).mint(4, [], {value: price*4})
            await CenterFacet.connect(address6).mint(1, [], {value: price})
            tokenIdsOfOwner = await ERC721AFacet.tokensOfOwner(owner.address)
            tokenIdsOfAddress1 = await ERC721AFacet.tokensOfOwner(address1.address)
            tokenIdsOfAddress2 = await ERC721AFacet.tokensOfOwner(address2.address)
            tokenIdsOfAddress3 = await ERC721AFacet.tokensOfOwner(address3.address)
            tokenIdsOfAddress4 = await ERC721AFacet.tokensOfOwner(address4.address)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address4.address)
            tokenIdsOfAddress6 = await ERC721AFacet.tokensOfOwner(address6.address)
            olderTotalSupply = await ERC721AFacet.totalSupply()

        })

        it('safeTransferFrom function working as intended and checking merge works as intended for 3x3', async () => {

            // Four different scenerios to test when receiving a 3x3, as 3x3 and 4x4 are the levels when merge can happen
            // Each wallet can have either 0 or 1 token of 3x3 and 4x4
            // Based on the following four situations come up:
            // 1 => (0, 0); 2 => (1, 0); 3 => (0, 1); 4 => (1, 1)

            let tokenIdToBeSend

            // Situation 1 (0, 0) -> (1, 0) (No burn/merge)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(0)
            let firstTokenIdSent = tokenIdsOfAddress1[0]
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(0)
            let tx1 = await CenterFacet.connect(address1)["safeTransferFrom(address,address,uint256)"](address1.address, address5.address, firstTokenIdSent)
            let receipt1 = await tx1.wait()
            expect(receipt1.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(0)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(0)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

            // Situation 2 (1, 0) -> (0, 1) (1 burn/merge)
            expect(await ERC721AFacet.balanceOf(address3.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            let secondTokenIdSent = tokenIdsOfAddress3[1]
            expect(await CenterFacet.level(secondTokenIdSent)).to.equal(0)
            let tx2 = await CenterFacet.connect(address3)["safeTransferFrom(address,address,uint256)"](address3.address, address5.address, secondTokenIdSent)
            let receipt2 = await tx2.wait()
            expect(receipt2.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address3.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
            await expect(CenterFacet.level(secondTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

            // Situation 3 (0, 1) -> (1, 1) (No burn/merge)
            expect(await ERC721AFacet.balanceOf(address6.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            let thirdTokenIdSent = tokenIdsOfAddress6[0]
            expect(await CenterFacet.level(thirdTokenIdSent)).to.equal(0)
            let tx3 = await CenterFacet.connect(address6)["safeTransferFrom(address,address,uint256)"](address6.address, address5.address, thirdTokenIdSent)
            let receipt3 = await tx3.wait()
            expect(receipt3.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address6.address)).to.equal(0)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(2)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
            expect(await CenterFacet.level((tokenIdsOfAddress1[0]))).to.equal(1)
            expect(await CenterFacet.level(thirdTokenIdSent)).to.equal(0)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(2)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)
            expect(tokenIdsOfAddress5[1]).to.equal(thirdTokenIdSent)

            // Situation 4 (1, 1) -> (0, 0) (2 burn/merge)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(2)
            let fourthTokenIdSent = tokenIdsOfOwner[2]
            expect(await CenterFacet.level(fourthTokenIdSent)).to.equal(0)
            let tx4 = await CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, address5.address, fourthTokenIdSent)
            let receipt4 = await tx4.wait()
            expect(receipt4.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 3)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            await expect(CenterFacet.level(fourthTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            await expect(CenterFacet.level(thirdTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

        })
        
        it('safeTransferFrom function working as intended and checking merge works as intended for 4x4', async () => {

            // Only two different scenerios to test when receiving a 4x4, as it affects 4x4 level
            // Each wallet can have either 0 or 1 token of 4x4
            // Based on the following four situations come up:
            // 1 => (0); 2 => (1)

           // Situation 1 (0) -> (1) (No burn/merge)
           expect(await ERC721AFacet.balanceOf(address2.address)).to.equal(1)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(0)
           let firstTokenIdSent = tokenIdsOfAddress2[0]
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
           let tx1 = await CenterFacet.connect(address2)["safeTransferFrom(address,address,uint256)"](address2.address, address5.address, firstTokenIdSent)
           let receipt1 = await tx1.wait()
           expect(receipt1.status).to.equal(1)
           expect(await ERC721AFacet.balanceOf(address2.address)).to.equal(0)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
           tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
           expect(tokenIdsOfAddress5.length).to.equal(1)
           expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

           // Situation 1 (1) -> (0) (1 burn/merge)
           expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           let secondTokenIdSent = tokenIdsOfOwner[1]
           expect(await CenterFacet.level(secondTokenIdSent)).to.equal(1)
           let tx2 = await CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, address5.address, secondTokenIdSent)
           let receipt2 = await tx2.wait()
           expect(receipt2.status).to.equal(1)
           expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
           await expect(CenterFacet.level(secondTokenIdSent))
           .to.be.revertedWith("Given tokenId doesn't exist")
           tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
           expect(tokenIdsOfAddress5.length).to.equal(1)
           expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

        })

        it('safeTransferFrom function working as intended and checking merge works as intended for 5x5', async () => {

            // As there is no merge for 5x5 cubes, transfering a 5x5 cube should work as regular transfer
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
            expect(await ERC721AFacet.balanceOf(address4.address)).to.equal(1)
            let firstTokenIdSent = tokenIdsOfOwner[0]
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            let tx = await CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, address4.address, firstTokenIdSent)
            let receipt = await tx.wait()
            expect(receipt.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address4.address)).to.equal(2)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            const newTokenIdsOfAddress4 = await ERC721AFacet.tokensOfOwner(address4.address)
            expect(newTokenIdsOfAddress4.length).to.equal(2)
            expect(newTokenIdsOfAddress4[0]).to.equal(firstTokenIdSent)
            expect(newTokenIdsOfAddress4[1]).to.equal(tokenIdsOfAddress4[0])

        })

        it("safeTransferFrom function reverting if the token doesn't exist", async () => {

            await expect(CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256)"](owner.address, address5.address, 2334))
            .to.be.revertedWith('Given tokenId does not exist')

        })

        it('safeTransferFrom function reverting if from address is not owner or approaved address', async () => {

            // Not approved or owner wallet transfering the wallet is not successful (Connect wallet and token to transferFrom are different)
            await CenterFacet.connect(address1)["safeTransferFrom(address,address,uint256)"](address2.address, address5.address, tokenIdsOfAddress2[0])
            expect(await ERC721AFacet.ownerOf(tokenIdsOfAddress2[0])).to.equal(address2.address)

            // Not approved or owner wallet transfering the wallet is not successful (tokenId doesn't not belong to the connect wallet or the from address)
            await CenterFacet.connect(address1)["safeTransferFrom(address,address,uint256)"](address1.address, address5.address, tokenIdsOfAddress2[0])
            expect(await ERC721AFacet.ownerOf(tokenIdsOfAddress2[0])).to.equal(address2.address)

        })
        
    })

    describe('Check _safeTransferFrom function', () => {

        beforeEach(async () => {

            await CenterFacet.reserve(7)
            //await helpers.time.increaseTo(ethers.BigNumber.from(await SaleHandlerFacet.saleTimestamp()).add(await SaleHandlerFacet.privSaleLength()))
            await CenterFacet.connect(address1).mint(1, [], {value: price})
            await CenterFacet.connect(address2).mint(2, [], {value: price*2})
            await CenterFacet.connect(address3).mint(3, [], {value: price*3})
            await CenterFacet.connect(address4).mint(4, [], {value: price*4})
            await CenterFacet.connect(address6).mint(1, [], {value: price})
            tokenIdsOfOwner = await ERC721AFacet.tokensOfOwner(owner.address)
            tokenIdsOfAddress1 = await ERC721AFacet.tokensOfOwner(address1.address)
            tokenIdsOfAddress2 = await ERC721AFacet.tokensOfOwner(address2.address)
            tokenIdsOfAddress3 = await ERC721AFacet.tokensOfOwner(address3.address)
            tokenIdsOfAddress4 = await ERC721AFacet.tokensOfOwner(address4.address)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address4.address)
            tokenIdsOfAddress6 = await ERC721AFacet.tokensOfOwner(address6.address)
            olderTotalSupply = await ERC721AFacet.totalSupply()
            bytesInput = []

        })

        it('_safeTransferFrom function working as intended and checking merge works as intended for 3x3', async () => {

            // Four different scenerios to test when receiving a 3x3, as 3x3 and 4x4 are the levels when merge can happen
            // Each wallet can have either 0 or 1 token of 3x3 and 4x4
            // Based on the following four situations come up:
            // 1 => (0, 0); 2 => (1, 0); 3 => (0, 1); 4 => (1, 1)

            let tokenIdToBeSend

            // Situation 1 (0, 0) -> (1, 0) (No burn/merge)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(0)
            let firstTokenIdSent = tokenIdsOfAddress1[0]
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(0)
            let tx1 = await CenterFacet.connect(address1)["safeTransferFrom(address,address,uint256,bytes)"](address1.address, address5.address, firstTokenIdSent, bytesInput)
            let receipt1 = await tx1.wait()
            expect(receipt1.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address1.address)).to.equal(0)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(0)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

            // Situation 2 (1, 0) -> (0, 1) (1 burn/merge)
            expect(await ERC721AFacet.balanceOf(address3.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            let secondTokenIdSent = tokenIdsOfAddress3[1]
            expect(await CenterFacet.level(secondTokenIdSent)).to.equal(0)
            let tx2 = await CenterFacet.connect(address3)["safeTransferFrom(address,address,uint256,bytes)"](address3.address, address5.address, secondTokenIdSent, bytesInput)
            let receipt2 = await tx2.wait()
            expect(receipt2.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address3.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
            await expect(CenterFacet.level(secondTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

            // Situation 3 (0, 1) -> (1, 1) (No burn/merge)
            expect(await ERC721AFacet.balanceOf(address6.address)).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            let thirdTokenIdSent = tokenIdsOfAddress6[0]
            expect(await CenterFacet.level(thirdTokenIdSent)).to.equal(0)
            let tx3 = await CenterFacet.connect(address6)["safeTransferFrom(address,address,uint256,bytes)"](address6.address, address5.address, thirdTokenIdSent, bytesInput)
            let receipt3 = await tx3.wait()
            expect(receipt3.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(address6.address)).to.equal(0)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(2)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
            expect(await CenterFacet.level((tokenIdsOfAddress1[0]))).to.equal(1)
            expect(await CenterFacet.level(thirdTokenIdSent)).to.equal(0)
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(2)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)
            expect(tokenIdsOfAddress5[1]).to.equal(thirdTokenIdSent)

            // Situation 4 (1, 1) -> (0, 0) (2 burn/merge)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(2)
            let fourthTokenIdSent = tokenIdsOfOwner[2]
            expect(await CenterFacet.level(fourthTokenIdSent)).to.equal(0)
            let tx4 = await CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, address5.address, fourthTokenIdSent, bytesInput)
            let receipt4 = await tx4.wait()
            expect(receipt4.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 3)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            await expect(CenterFacet.level(fourthTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            await expect(CenterFacet.level(thirdTokenIdSent))
            .to.be.revertedWith("Given tokenId doesn't exist")
            tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
            expect(tokenIdsOfAddress5.length).to.equal(1)
            expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

        })
        
        it('_safeTransferFrom function working as intended and checking merge works as intended for 4x4', async () => {

            // Only two different scenerios to test when receiving a 4x4, as it affects 4x4 level
            // Each wallet can have either 0 or 1 token of 4x4
            // Based on the following four situations come up:
            // 1 => (0); 2 => (1)

           // Situation 1 (0) -> (1) (No burn/merge)
           expect(await ERC721AFacet.balanceOf(address2.address)).to.equal(1)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(0)
           let firstTokenIdSent = tokenIdsOfAddress2[0]
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
           let tx1 = await CenterFacet.connect(address2)["safeTransferFrom(address,address,uint256,bytes)"](address2.address, address5.address, firstTokenIdSent, bytesInput)
           let receipt1 = await tx1.wait()
           expect(receipt1.status).to.equal(1)
           expect(await ERC721AFacet.balanceOf(address2.address)).to.equal(0)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(1)
           tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
           expect(tokenIdsOfAddress5.length).to.equal(1)
           expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

           // Situation 1 (1) -> (0) (1 burn/merge)
           expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           let secondTokenIdSent = tokenIdsOfOwner[1]
           expect(await CenterFacet.level(secondTokenIdSent)).to.equal(1)
           let tx2 = await CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, address5.address, secondTokenIdSent, bytesInput)
           let receipt2 = await tx2.wait()
           expect(receipt2.status).to.equal(1)
           expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
           expect(await ERC721AFacet.balanceOf(address5.address)).to.equal(1)
           expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply - 1)
           expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
           await expect(CenterFacet.level(secondTokenIdSent))
           .to.be.revertedWith("Given tokenId doesn't exist")
           tokenIdsOfAddress5 = await ERC721AFacet.tokensOfOwner(address5.address)
           expect(tokenIdsOfAddress5.length).to.equal(1)
           expect(tokenIdsOfAddress5[0]).to.equal(firstTokenIdSent)

        })

        it('_safeTransferFrom function working as intended and checking merge works as intended for 5x5', async () => {

            // As there is no merge for 5x5 cubes, transfering a 5x5 cube should work as regular transfer
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(3)
            expect(await ERC721AFacet.balanceOf(address4.address)).to.equal(1)
            let firstTokenIdSent = tokenIdsOfOwner[0]
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            let tx = await CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, address4.address, firstTokenIdSent, bytesInput)
            let receipt = await tx.wait()
            expect(receipt.status).to.equal(1)
            expect(await ERC721AFacet.balanceOf(owner.address)).to.equal(2)
            expect(await ERC721AFacet.balanceOf(address4.address)).to.equal(2)
            expect(await ERC721AFacet.totalSupply()).to.equal(olderTotalSupply)
            expect(await CenterFacet.level(firstTokenIdSent)).to.equal(2)
            const newTokenIdsOfAddress4 = await ERC721AFacet.tokensOfOwner(address4.address)
            expect(newTokenIdsOfAddress4.length).to.equal(2)
            expect(newTokenIdsOfAddress4[0]).to.equal(firstTokenIdSent)
            expect(newTokenIdsOfAddress4[1]).to.equal(tokenIdsOfAddress4[0])

        })

        it("_safeTransferFrom(bytes) function reverting if the token doesn't exist", async () => {

            await expect(CenterFacet.connect(owner)["safeTransferFrom(address,address,uint256,bytes)"](owner.address, address5.address, 2334, bytesInput))
            .to.be.revertedWith('Given tokenId does not exist')

        })

        it('_safeTransferFrom function reverting if from address is not owner or approaved address', async () => {

            // Not approved or owner wallet transfering the wallet is not successful (Connect wallet and token to transferFrom are different)
            await CenterFacet.connect(address1)["safeTransferFrom(address,address,uint256,bytes)"](address2.address, address5.address, tokenIdsOfAddress2[0], bytesInput)
            expect(await ERC721AFacet.ownerOf(tokenIdsOfAddress2[0])).to.equal(address2.address)

            // Not approved or owner wallet transfering the wallet is not successful (tokenId doesn't not belong to the connect wallet or the from address)
            await CenterFacet.connect(address1)["safeTransferFrom(address,address,uint256,bytes)"](address1.address, address5.address, tokenIdsOfAddress2[0], bytesInput)
            expect(await ERC721AFacet.ownerOf(tokenIdsOfAddress2[0])).to.equal(address2.address)

        })
        
    })

    describe('Check mint function', () => {

        it('mint function reverted as sale ended', async () => {

            const amountToMint = 4
            await helpers.time.increaseTo((await SaleHandlerFacet.saleTimestamp()).add((await SaleHandlerFacet.privSaleLength()).add(await SaleHandlerFacet.publicSaleLength())))
            await expect(CenterFacet.connect(address1).mint(amountToMint, merkleProof2, {value:price*amountToMint}))
            .to.be.revertedWith('CenterFacet: Sale is not active')

        })

    })

    describe('Check test helper functions', () => {
        it('resetNumberMinted', async () => {
            await CenterFacet.reserve(1)
            expect(await ERC721AFacet._numberMinted(owner.address)).to.equal(1)

            await TestDiamond.resetNumberMinted(owner.address)
            expect(await ERC721AFacet._numberMinted(owner.address)).to.equal(0)

            await CenterFacet.reserve(1)
            expect(await ERC721AFacet._numberMinted(owner.address)).to.equal(1)
        })
    })

})