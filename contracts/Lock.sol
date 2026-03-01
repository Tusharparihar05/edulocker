// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EduLocker {

    address public owner;

    struct Document {
        string studentId;
        string docName;
        string hash;
        address uploadedBy;
        uint256 timestamp;
    }

    Document[] public documents;

    // authorized uploaders (institutions)
    mapping(address => bool) public authorizedUploaders;

    event DocumentStored(string studentId, string docName, address uploadedBy, uint256 timestamp);
    event UploaderAuthorized(address uploader);
    event UploaderRevoked(address uploader);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedUploaders[msg.sender],
            "Not authorized to upload"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedUploaders[msg.sender] = true;
    }

    // Owner can authorize institutions/uploaders
    function authorizeUploader(address _uploader) public onlyOwner {
        authorizedUploaders[_uploader] = true;
        emit UploaderAuthorized(_uploader);
    }

    // Owner can revoke access
    function revokeUploader(address _uploader) public onlyOwner {
        authorizedUploaders[_uploader] = false;
        emit UploaderRevoked(_uploader);
    }

    // Store document - only authorized uploaders
    function storeDocument(
        string memory _studentId,
        string memory _docName,
        string memory _hash
    ) public onlyAuthorized {
        documents.push(
            Document(
                _studentId,
                _docName,
                _hash,
                msg.sender,
                block.timestamp
            )
        );
        emit DocumentStored(_studentId, _docName, msg.sender, block.timestamp);
    }

    function getDocument(uint256 index)
        public
        view
        returns (Document memory)
    {
        return documents[index];
    }

    function getDocumentsCount() public view returns (uint256) {
        return documents.length;
    }

    // Get all documents for a student ID
    function getDocumentsByStudentId(string memory _studentId)
        public
        view
        returns (Document[] memory)
    {
        uint256 total = documents.length;
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            if (
                keccak256(bytes(documents[i].studentId)) ==
                keccak256(bytes(_studentId))
            ) {
                count++;
            }
        }

        Document[] memory result = new Document[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < total; i++) {
            if (
                keccak256(bytes(documents[i].studentId)) ==
                keccak256(bytes(_studentId))
            ) {
                result[j] = documents[i];
                j++;
            }
        }

        return result;
    }

    // ✅ VERIFICATION: Check if a specific hash exists for a student
    function verifyDocument(string memory _studentId, string memory _hash)
        public
        view
        returns (bool isValid, string memory docName, address uploadedBy, uint256 timestamp)
    {
        for (uint256 i = 0; i < documents.length; i++) {
            if (
                keccak256(bytes(documents[i].studentId)) == keccak256(bytes(_studentId)) &&
                keccak256(bytes(documents[i].hash)) == keccak256(bytes(_hash))
            ) {
                return (true, documents[i].docName, documents[i].uploadedBy, documents[i].timestamp);
            }
        }
        return (false, "", address(0), 0);
    }
}
