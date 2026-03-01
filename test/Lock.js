const { expect } = require("chai");
const { ethers } = require("hardhat");

// simple tests for the EduLocker contract
describe("EduLocker", function () {
  let eduLocker;
  let owner;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
    const EduLocker = await ethers.getContractFactory("EduLocker");
    eduLocker = await EduLocker.deploy();
    await eduLocker.waitForDeployment();
  });

  it("stores a document and allows lookup by student ID", async function () {
    await eduLocker.storeDocument("101", "Result", "qw123d");

    const docs = await eduLocker.getDocumentsByStudentId("101");
    expect(docs.length).to.equal(1);
    expect(docs[0].studentId).to.equal("101");
    expect(docs[0].docName).to.equal("Result");
    expect(docs[0].hash).to.equal("qw123d");
    expect(docs[0].uploadedBy).to.equal(owner.address);
  });

  it("returns an empty array if no matching documents exist", async function () {
    const docs = await eduLocker.getDocumentsByStudentId("999");
    expect(docs.length).to.equal(0);
  });
});
