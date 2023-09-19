const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02");

async function getWeth() {
    const { deployer } = await getNamedAccounts();
    const iWeth = await ethers.getContactAt("IWeth", "", deployer);
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log("WETH balance: ", ethers.utils.formatEther(wethBalance))
}

module.exports = { getWeth, AMOUNT };