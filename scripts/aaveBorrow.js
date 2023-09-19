const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");

async function main() {
  await getWeth();
  const { depolyer } = await getNamedAccounts();
  const lendingPool = await getLendingPool(depolyer);
  console.log("lendingPool.address:", lendingPool.address);

  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, depolyer);

  //存入weth
  await lendingPool.deposit(wethTokenAddress, AMOUNT, depolyer, 0);

  //获取账户借贷信息
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    depolyer
  );
  // availableBorrowsETH转化为可借贷DAI
  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow =
    availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  const amountDaiToBorrowWei = ethers.utils.parseEther(
    amountDaiToBorrow.toString()
  );
  //借贷
  const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
  await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, depolyer);
  await getBorrowUserData(lendingPool, depolyer);
  //还款
  await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, depolyer);
  await getBorrowUserData(lendingPool, depolyer);
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveErc20(daiAddress, lendingPool.address, amount, account);
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
  await repayTx.wait(1);
}

async function borrowDai(
  daiAddress,
  lendingPool,
  amountDaiToBorrowWei,
  account
) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrowWei,
    1,
    0,
    account
  );
  await borrowTx.wait(1);
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  );

  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log("DAI/ETH price: ", price.toString());
  return price;
}

async function getBorrowUserData(lendingPool, account) {
  const {
    totalCollateralETH,
    totalDebtETH,
    availableBorrowsETH,
  } = await lendingPool.getUserAccountData(account);
  return { availableBorrowsETH, totalDebtETH };
}

async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt(
    "IERC20",
    erc20Address,
    account
  );
  const tx = await erc20Token.approve(spenderAddress, amountToSpend);
  await tx.wait(1);
}

async function getLendingPool(account) {
  const lendingPoolAddressProvier = await ethers.getContractAt(
    "ILendingPoolAddressProvider",
    "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    account
  );
  const lendingPoolAddress = await lendingPoolAddressProvier.getLendingPool();
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress,
    account
  );
  return lendingPool;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
