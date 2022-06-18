const main = async () => {
  const nftContractFactory = await hre.ethers.getContractFactory('AlfaHanta');
  const nftContract = await nftContractFactory.deploy();
  await nftContract.deployed();
  console.log('Contract deployed to:', nftContract.address);
  
  let txn;
  txn = await nftContract.setAllowList([0x3E4e789b2FCb30AbEa420705610895D307d4F866]);
  await txn.wait();
  console.log('Address added to allow list.');

  txn = await nftContract.setIsAllowListActive(true);
  await txn.wait();
  console.log('Allow List Minting set to Active');

  txn = await nftContract.alfaPassMintMultiple(3, [1]);
  await txn.wait();
  console.log('Mint using Alfa Pass completed.');

  txn = await nftContract.mintAllowList(1);
  await txn.wait();
  console.log('Mint using Allow List completed.');

  console.log('Done deploying. Pogger City - population you, bro!');
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
