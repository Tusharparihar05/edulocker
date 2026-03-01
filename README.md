# 🔐 EduLocker – Blockchain-Based Document Verification System

A decentralized application (DApp) for **tamper-proof academic document storage and verification** using **Ethereum, IPFS, Solidity, and React**.

---

## 🌐 Live Demo

🔗 https://tusharedulocker.vercel.app

---

## 📌 Problem

Fake certificates and manipulated documents are a major issue in recruitment and academic verification.

---

## ✅ Solution

EduLocker ensures trustless verification using:

- **Blockchain** → Immutable hash storage  
- **IPFS** → Decentralized file storage  
- **Smart Contract** → Transparent & secure validation  

Even a **1-bit change in the document generates a completely different hash**, instantly detecting fake documents.

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React (Vite)
- Ethers.js
- CSS / Tailwind

### 🔹 Blockchain
- Solidity
- Hardhat
- MetaMask
- Sepolia Testnet

### 🔹 Storage
- IPFS (Pinata)

### 🔹 Deployment
- Vercel

---

## ✨ Features

- 📤 Upload document  
- ⛓️ Store hash on blockchain  
- 🔍 Verify document authenticity  
- 👛 MetaMask wallet connection  
- 🛡️ Tamper-proof verification  
- 👨‍💼 Admin authorization system  

---

## ⚙️ How It Works

1. User uploads the document  
2. File is stored on **IPFS via Pinata**  
3. Document hash is stored on **Ethereum blockchain**  
4. During verification → hash is regenerated & matched with on-chain data  

---

## 🖼️ Project Screenshots

### 📤 Upload
![upload](./screenshots/upload.png)

### ✅ Verification
![verify](./screenshots/verify.png)

---

## 🧪 Run Locally

```bash
git clone https://github.com/Tusharparihar05/edulocker.git
cd edulocker
npm install
npm run dev
