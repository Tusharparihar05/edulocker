import { ethers } from "ethers";

export const contractAddress = (
  import.meta.env.VITE_EDU_LOCKER_ADDRESS || "0x740ab2148D3Cd27980C47eb814E447007a9174Ae"
).trim().replace(/;/g, "");

// ✅ Inline ABI — no file import needed (works on Vercel)
export const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "studentId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "docName", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "uploadedBy", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "DocumentStored",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "uploader", "type": "address" }
    ],
    "name": "UploaderAuthorized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "uploader", "type": "address" }
    ],
    "name": "UploaderRevoked",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_uploader", "type": "address" }],
    "name": "authorizeUploader",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "authorizedUploaders",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getDocument",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "studentId", "type": "string" },
          { "internalType": "string", "name": "docName", "type": "string" },
          { "internalType": "string", "name": "hash", "type": "string" },
          { "internalType": "address", "name": "uploadedBy", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct EduLocker.Document",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_studentId", "type": "string" }],
    "name": "getDocumentsByStudentId",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "studentId", "type": "string" },
          { "internalType": "string", "name": "docName", "type": "string" },
          { "internalType": "string", "name": "hash", "type": "string" },
          { "internalType": "address", "name": "uploadedBy", "type": "address" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct EduLocker.Document[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDocumentsCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_uploader", "type": "address" }],
    "name": "revokeUploader",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_studentId", "type": "string" },
      { "internalType": "string", "name": "_docName", "type": "string" },
      { "internalType": "string", "name": "_hash", "type": "string" }
    ],
    "name": "storeDocument",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_studentId", "type": "string" },
      { "internalType": "string", "name": "_hash", "type": "string" }
    ],
    "name": "verifyDocument",
    "outputs": [
      { "internalType": "bool", "name": "isValid", "type": "bool" },
      { "internalType": "string", "name": "docName", "type": "string" },
      { "internalType": "address", "name": "uploadedBy", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "documents",
    "outputs": [
      { "internalType": "string", "name": "studentId", "type": "string" },
      { "internalType": "string", "name": "docName", "type": "string" },
      { "internalType": "string", "name": "hash", "type": "string" },
      { "internalType": "address", "name": "uploadedBy", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

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
      ".\nMake sure contract is deployed to Sepolia."
    );
  }

  const contract = new ethers.Contract(validatedAddress, contractABI, signer);
  return { contract, account };
};