const assert = require('assert');

const Election = artifacts.require('Election');

const BN = web3.utils.BN;

contract('Election', function(accounts) {
  let electionInstance;

  before(async () => {
    electionInstance = await Election.deployed();
  });

  it('initializes with two candidates', async () => {
    const count = await electionInstance.candidatesCount();
    assert.equal(count, 2);
  });

  it('it initializes the candidates with the correct values', async () => {
    const instance = await Election.deployed();
    electionInstance = instance;
    const candidate1 = await electionInstance.candidates(1);
    assert.equal(candidate1[0], 1, 'contains the correct id');
    assert.equal(candidate1[1], 'Candidate 1', 'contains the correct name');
    assert.equal(candidate1[2], 0, 'contains the correct votes count');
    const candidate2 = await electionInstance.candidates(2);
    assert.equal(candidate2[0], 2, 'contains the correct id');
    assert.equal(candidate2[1], 'Candidate 2', 'contains the correct name');
    assert.equal(candidate2[2], 0, 'contains the correct votes count');
  });

  it('disallows voting on invalid candidates', async () => {
    let err;
    try {
      await electionInstance.vote(1234, { from: accounts[3] });
    } catch (ex) {
      err = ex;
    }
    assert(err, 'expected transaction to revert');
    assert(err.message.indexOf('revert') >= 0,
      'error message must contain revert');
    const candidate1 = await electionInstance.candidates(1);
    const candidate2 = await electionInstance.candidates(2);
    assert.equal(candidate1.voteCount, 0,
      'candidate 1 did not receive any votes');
    assert.equal(candidate2.voteCount, 0,
      'candidate 2 did not receive any votes');
  });

  it('disallows double voting', async () => {
    const candidateId = 2;
    let err;
    let candidate1;
    let candidate2;

    try {
      await electionInstance.vote(candidateId, { from: accounts[2] });
    } catch (ex) {
      err = ex;
    }
    assert(!err, 'expected transaction not to revert');
    candidate1 = await electionInstance.candidates(1);
    candidate2 = await electionInstance.candidates(2);
    assert.equal(candidate1.voteCount, 0,
      'candidate 1 did not receive any votes');
    assert.equal(candidate2.voteCount, 1,
      'candidate 2 did receive a vote');

    try {
      await electionInstance.vote(candidateId, { from: accounts[2] });
    } catch (ex) {
      err = ex;
    }
    assert(err, 'expected transaction to revert');
    assert(err.message.indexOf('revert') >= 0,
      'error message must contain revert');
    candidate1 = await electionInstance.candidates(1);
    candidate2 = await electionInstance.candidates(2);
    assert.equal(candidate1.voteCount, 0,
      'candidate 1 did not receive any extra votes');
    assert.equal(candidate2.voteCount, 1,
      'candidate 2 did not receive any extra votes');
  });

  it('allows a voter to cast a vote', async () => {
    const candidateId = 1;
    const receipt = await electionInstance
      .vote(candidateId, { from: accounts[0] });
    const voted = await electionInstance.voters(accounts[0]);
    const candidate = await electionInstance.candidates(candidateId);
    assert(voted, 'the voter was marked as voted');
    assert.equal(candidate.voteCount, 1, 'increments the candidate\'s vote count');
  });
});
