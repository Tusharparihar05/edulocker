 EduLocker – Blockchain Based Document Verification System

A decentralized application (DApp) that stores and verifies academic documents using **Ethereum, IPFS, and React**.

---

 Live Demo
🌐 https://tusharedulocker.vercel.app

---

Problem
Fake certificates and manipulated documents are a major issue in recruitment and academic verification.

---

  Solution
EduLocker uses:
- Blockchain → Immutable hash storage
- IPFS → Decentralized file storage
- Smart Contract → Trustless verification

Even a **1-bit change in the document** results in a different hash → fake detected 

---

 Tech Stack

Frontend
- React (Vite)
- Ethers.js
- Tailwind / CSS

 Blockchain
- Solidity
- Hardhat
- MetaMask
- Sepolia Testnet

 Storage
- IPFS (Pinata)

Deployment
- Vercel

---

 Features

Upload document  
 Store hash on blockchain  
 Verify document authenticity  
 MetaMask wallet connection  
 Tamper-proof verification  

---

 How It Works

 Upload document  
 File stored on IPFS  
 Hash stored on blockchain  
 During verification → hash regenerated & matched  

---

 Project Screenshots

 Upload
![upload](./screenshots/upload.png)

 Verification
![verify](./screenshots/verify.png)

---

 Run Locally

```bash
git clone https://github.com/Tusharparihar05/edulocker
cd edulocker
npm install
npm run dev
