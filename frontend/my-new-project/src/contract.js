import { ethers } from "ethers";
import EduLockerArtifact from "../../../artifacts/contracts/Lock.sol/EduLocker.json";

export const contractAddress = (
  import.meta.env.VITE_EDU_LOCKER_ADDRESS || "0x740ab2148D3Cd27980C47eb814E447007a9174Ae"
).trim().replace(/;/g, "");

export const contractABI = EduLockerArtifact.abi;

export const getContract = async () => {
  if (!window.ethereum) throw new Error("MetaMask not detected");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network  = await provider.getNetwork();

  if (Number(network.chainId) !== 11155111) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      window.location.reload();
      return null;
    } catch {
      throw new Error("Please switch MetaMask to Sepolia Testnet and refresh.");
    }
  }

  const signer  = await provider.getSigner();
  const account = await signer.getAddress();

  const validatedAddress = ethers.getAddress(contractAddress);
  const code = await provider.getCode(validatedAddress);
  if (!code || code === "0x") {
    throw new Error(
      "No contract code at " + validatedAddress +
      ".\nRun: npx hardhat run scripts/deploy.js --network localhost"
    );
  }

  const contract = new ethers.Contract(validatedAddress, contractABI, signer);
  return { contract, account };
};