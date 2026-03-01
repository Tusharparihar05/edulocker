import { useEffect, useState } from "react";
import { getContract, contractAddress } from "./contract";
import "./App.css";

// ── Pinata config ──────────────────────────────────────────────────────────
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || "";
const PINATA_SECRET  = import.meta.env.VITE_PINATA_SECRET  || "";

async function uploadToPinata(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Pinata upload failed: " + res.statusText);
  const data = await res.json();
  return data.IpfsHash;
}

function shortAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}
function formatDate(ts) {
  if (!ts) return "";
  return new Date(Number(ts) * 1000).toLocaleString();
}

export default function App() {
  const [account,  setAccount]  = useState("");
  const [contract, setContract] = useState(null);
  const [isOwner,  setIsOwner]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("upload");

  const [studentId, setStudentId] = useState("");
  const [docName,   setDocName]   = useState("");
  const [hash,      setHash]      = useState("");
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [txStatus,  setTxStatus]  = useState("");

  const [searchId,  setSearchId]  = useState("");
  const [documents, setDocuments] = useState([]);
  const [searching, setSearching] = useState(false);

  const [vStudentId,    setVStudentId]    = useState("");
  const [vHash,         setVHash]         = useState("");
  const [verifyResult,  setVerifyResult]  = useState(null);
  const [verifying,     setVerifying]     = useState(false);

  const [uploaderAddr, setUploaderAddr] = useState("");
  const [adminMsg,     setAdminMsg]     = useState("");

  useEffect(() => {
    (async () => {
      try {
        const result = await getContract();
        if (!result) return;
        const { contract, account } = result;
        setContract(contract);
        setAccount(account);
        const owner = await contract.owner();
        setIsOwner(owner.toLowerCase() === account.toLowerCase());
      } catch (err) {
        alert("⚠️ " + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const storeDocument = async () => {
    if (!contract) return alert("Contract not loaded");
    if (!studentId || !docName) return alert("Fill Student ID and Document Name");
    try {
      setUploading(true);
      let finalHash = hash;
      if (file) {
        if (!import.meta.env.VITE_PINATA_JWT) {
           alert("Missing VITE_PINATA_JWT in environment variables");
          return;
        }
        setTxStatus("pinata");
        finalHash = await uploadToPinata(file);
        setHash(finalHash);
      }
      if (!finalHash) return alert("Select a file or enter a hash");
      setTxStatus("blockchain");
      const tx = await contract.storeDocument(studentId, docName, finalHash);
      await tx.wait();
      setTxStatus("done");
      setStudentId(""); setDocName(""); setHash(""); setFile(null);
      setTimeout(() => setTxStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setTxStatus("error");
      if (err.message.includes("Not authorized")) {
        alert("❌ Your wallet is not authorized.\nAsk the contract owner to authorize you from Admin panel.");
      } else {
        alert("❌ " + err.message);
      }
      setTimeout(() => setTxStatus(""), 3000);
    } finally {
      setUploading(false);
    }
  };

  const getDocuments = async () => {
    if (!contract) return alert("Contract not loaded");
    if (!searchId)  return alert("Enter a Student ID");
    try {
      setSearching(true);
      setDocuments([]);
      const result = await contract.getDocumentsByStudentId(searchId.toString());
      if (!result || result.length === 0) {
        alert("📭 No documents found for: " + searchId);
        return;
      }
      setDocuments(result.map((doc) => ({
        studentId:  doc[0],
        docName:    doc[1],
        hash:       doc[2],
        uploadedBy: doc[3],
        timestamp:  doc[4]?.toString(),
      })));
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const verifyDocument = async () => {
    if (!contract) return alert("Contract not loaded");
    if (!vStudentId || !vHash) return alert("Enter both Student ID and Hash");
    try {
      setVerifying(true);
      setVerifyResult(null);
      const result = await contract.verifyDocument(vStudentId, vHash);
      setVerifyResult({
        isValid:    result[0],
        docName:    result[1],
        uploadedBy: result[2],
        timestamp:  result[3]?.toString(),
      });
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  const authorizeUploader = async () => {
    if (!contract || !uploaderAddr) return;
    try {
      setAdminMsg("⏳ Authorizing...");
      const tx = await contract.authorizeUploader(uploaderAddr);
      await tx.wait();
      setAdminMsg("✅ Authorized: " + uploaderAddr);
      setUploaderAddr("");
    } catch (err) { setAdminMsg("❌ " + err.message); }
  };

  const revokeUploader = async () => {
    if (!contract || !uploaderAddr) return;
    try {
      setAdminMsg("⏳ Revoking...");
      const tx = await contract.revokeUploader(uploaderAddr);
      await tx.wait();
      setAdminMsg("✅ Revoked: " + uploaderAddr);
      setUploaderAddr("");
    } catch (err) { setAdminMsg("❌ " + err.message); }
  };

  if (loading) return (
    <div className="splash">
      <div className="spinner" />
      <p>Connecting to blockchain…</p>
    </div>
  );

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-icon">🎓</span>
          <div>
            <div className="nav-title">EduLocker</div>
            <div className="nav-subtitle">Decentralised Document Vault</div>
          </div>
        </div>
        <div className="nav-wallet">
          <span className="wallet-dot" />
          <span className="wallet-addr">{shortAddr(account)}</span>
          {isOwner && <span className="owner-badge">Owner</span>}
        </div>
      </nav>

      <div className="tabs">
        {[
          { key: "upload", label: "📤 Upload" },
          { key: "search", label: "🔍 Search" },
          { key: "verify", label: "✅ Verify" },
          ...(isOwner ? [{ key: "admin", label: "⚙️ Admin" }] : []),
        ].map((t) => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="main">

        {tab === "upload" && (
          <div className="card">
            <h2 className="card-title">Upload Document</h2>
            <p className="card-sub">Store a tamper-proof document record on the blockchain.</p>

            <label className="field-label">Student ID</label>
            <input className="field" placeholder="e.g. STU2024001" value={studentId} onChange={e => setStudentId(e.target.value)} />

            <label className="field-label">Document Name</label>
            <input className="field" placeholder="e.g. Marksheet Sem 5" value={docName} onChange={e => setDocName(e.target.value)} />

            <label className="field-label">Upload File <span className="optional">(uploads to IPFS via Pinata)</span></label>
            <div className="file-drop" onClick={() => document.getElementById("fileInput").click()}>
              {file ? <span>📄 {file.name}</span> : <span>+ Click to choose file</span>}
              <input id="fileInput" type="file" hidden onChange={e => { setFile(e.target.files[0]); setHash(""); }} />
            </div>

            <div className="divider"><span>OR</span></div>

            <label className="field-label">Enter Hash Manually</label>
            <input className="field" placeholder="QmXyz... or any hash string" value={hash} onChange={e => { setHash(e.target.value); setFile(null); }} />

            {txStatus === "pinata"     && <div className="status info">⏳ Uploading file to IPFS…</div>}
            {txStatus === "blockchain" && <div className="status info">⛓️ Confirm transaction in MetaMask…</div>}
            {txStatus === "done"       && <div className="status success">✅ Document stored on blockchain!</div>}
            {txStatus === "error"      && <div className="status error">❌ Transaction failed</div>}

            <button className="btn-primary" onClick={storeDocument} disabled={uploading}>
              {uploading ? "Processing…" : "🔒 Store on Blockchain"}
            </button>
          </div>
        )}

        {tab === "search" && (
          <div className="card">
            <h2 className="card-title">Search Documents</h2>
            <p className="card-sub">View all documents stored for a Student ID.</p>

            <label className="field-label">Student ID</label>
            <div className="row">
              <input className="field" placeholder="Enter Student ID" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={e => e.key === "Enter" && getDocuments()} />
              <button className="btn-primary inline" onClick={getDocuments} disabled={searching}>
                {searching ? "…" : "Search"}
              </button>
            </div>

            {documents.length > 0 && (
              <div className="doc-list">
                <p className="result-count">{documents.length} document(s) found</p>
                {documents.map((doc, i) => (
                  <div key={i} className="doc-card">
                    <div className="doc-header">
                      <span className="doc-name">📄 {doc.docName}</span>
                      <span className="doc-id">ID: {doc.studentId}</span>
                    </div>
                    <div className="doc-meta">
                      <div>🔗 Hash: <a href={`https://gateway.pinata.cloud/ipfs/${doc.hash}`} target="_blank" rel="noreferrer">{doc.hash.length > 20 ? doc.hash.slice(0, 24) + "…" : doc.hash}</a></div>
                      <div>👤 Uploaded by: {shortAddr(doc.uploadedBy)}</div>
                      <div>🕐 {formatDate(doc.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "verify" && (
          <div className="card">
            <h2 className="card-title">Verify Document</h2>
            <p className="card-sub">Confirm authenticity — check if a hash is genuinely on-chain.</p>

            <label className="field-label">Student ID</label>
            <input className="field" placeholder="Enter Student ID" value={vStudentId} onChange={e => setVStudentId(e.target.value)} />

            <label className="field-label">Document Hash</label>
            <input className="field" placeholder="Enter hash to verify" value={vHash} onChange={e => setVHash(e.target.value)} />

            <button className="btn-primary" onClick={verifyDocument} disabled={verifying}>
              {verifying ? "Verifying…" : "🔍 Verify Document"}
            </button>

            {verifyResult && (
              <div className={`verify-result ${verifyResult.isValid ? "valid" : "invalid"}`}>
                {verifyResult.isValid ? (
                  <>
                    <div className="verify-icon">✅</div>
                    <h3>Document Verified — AUTHENTIC</h3>
                    <p><b>Document:</b> {verifyResult.docName}</p>
                    <p><b>Uploaded by:</b> {shortAddr(verifyResult.uploadedBy)}</p>
                    <p><b>Timestamp:</b> {formatDate(verifyResult.timestamp)}</p>
                  </>
                ) : (
                  <>
                    <div className="verify-icon">❌</div>
                    <h3>NOT Found — Possibly Fake</h3>
                    <p>No matching record on blockchain for this Student ID + Hash.</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "admin" && isOwner && (
          <div className="card">
            <h2 className="card-title">Admin Panel</h2>
            <p className="card-sub">Manage authorized uploaders (institutions).</p>

            <div className="admin-info">
              <span>Owner:</span><code>{account}</code>
            </div>
            <div className="admin-info">
              <span>Contract:</span><code>{contractAddress}</code>
            </div>

            <label className="field-label">Wallet Address to Authorize / Revoke</label>
            <input className="field" placeholder="0x..." value={uploaderAddr} onChange={e => setUploaderAddr(e.target.value)} />

            <div className="row">
              <button className="btn-primary inline" onClick={authorizeUploader}>✅ Authorize</button>
              <button className="btn-danger  inline" onClick={revokeUploader}>🚫 Revoke</button>
            </div>

            {adminMsg && <div className="status info">{adminMsg}</div>}
          </div>
        )}

      </main>

      <footer className="footer">
        EduLocker · Built on Ethereum · Contract: {shortAddr(contractAddress)}
      </footer>
    </div>
  );
}