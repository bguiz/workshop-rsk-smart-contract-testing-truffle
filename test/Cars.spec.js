const Cars = artifacts.require('Cars');

const BN = web3.utils.BN;

contract('Cars - initial state', (accounts) => {

  // tests go here

});

contract('Cars - state transitions', (accounts) => {

  // tests go here

});

contract('Cars - events', (accounts) => {

  before(async () => {
    // set up contract with relevant initial state
    const instance = await Cars.deployed();

    await instance.addCar(
      '0xff00ff', // colour: purple
      new BN(4), // doors: 4
      new BN(0), // distance: 0
      new BN(0), // lat: 0
      new BN(0), // lon: 0
      {
        from: accounts[1],
        value: web3.utils.toWei('0.11', 'ether'),
      },
    );

    await instance.addCar(
      '0xffff00', // colour: yellow
      new BN(2), // doors: 2
      new BN(0), // distance: 0
      new BN(0), // lat: 0
      new BN(0), // lon: 0
      {
        from: accounts[2],
        value: web3.utils.toWei('0.11', 'ether'),
      },
    );

    // just a sanity check, we do not really need to do assertions
    // within the set up, as this should be for "known working state"
    // only
    const numCars =
      await instance.numCars.call();
    assert.equal(numCars.toString(), '2');
  });

  // tests go here

  // tests go here

});
