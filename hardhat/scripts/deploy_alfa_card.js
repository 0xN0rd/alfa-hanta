const main = async () => {
    const contractFactory = await hre.ethers.getContractFactory('AlfaCard');
    const contract = await contractFactory.deploy(['Alfa Card'],);
    await contract.deployed();
    console.log('Contract deployed at address: ', contract.address);

    let txn;
    txn = await contract.mint(1);
    txn.wait();
    console.log('Minted 1 NFT');

    console.log('Deployment completed.');
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