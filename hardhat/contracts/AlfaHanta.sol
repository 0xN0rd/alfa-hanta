//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";

import "hardhat/console.sol";

contract AlfaHanta is
    ERC721,
    ERC721Enumerable,
    ERC721Burnable,
    ERC721Pausable,
    Ownable
{
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    bool public isAllowListActive = false;
    bool public isPublicLive = false;
    uint256 public constant MAX_PER_TXN = 5;
    uint256 public constant MAX_WHITELIST_MINT = 2;
    uint256 public constant ALFA_PASS_PRICE = 0.04 ether;
    uint256 public constant PRICE = 0.1 ether;
    uint256 public constant MAX_ELEMENTS = 4000;
    address public constant creatorAddress =
        0x3E4e789b2FCb30AbEa420705610895D307d4F866;

    string private URI = "";

    // Alfa Pass contract
    IERC721Enumerable IBaseContract =
        IERC721Enumerable(0xA4e646D987211b407833820E7a5A36783d8f896c);

    mapping(uint256 => bool) public claimedHanta;
    mapping(address => uint256) private _allowList;

    constructor() ERC721("Alfa Hanta", "AlfaHanta") {
        pause(true);
    }

    modifier saleIsOpen() {
        require(_totalSupply() <= MAX_ELEMENTS, "Sale over");
        if (_msgSender() != owner()) {
            require(!paused(), "Pausable: paused");
        }
        _;
    }

    function setIsPublicLive(bool _isPublicLive) external onlyOwner {
        isPublicLive = _isPublicLive;
    }

    function setIsAllowListActive(bool _isAllowListActive) external onlyOwner {
        isAllowListActive = _isAllowListActive;
    }

    function setAllowList(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            _allowList[addresses[i]] = MAX_WHITELIST_MINT;
        }
    }

    function _totalSupply() internal view returns (uint256) {
        return _tokenIdTracker.current();
    }

    function totalMint() public view returns (uint256) {
        return _totalSupply();
    }

    function _baseURI() internal view override returns (string memory) {
        return URI;
    }

    function setURI(string memory _URI) external onlyOwner {
        URI = _URI;
    }

    function price(uint256 _count) public pure returns (uint256) {
        return PRICE.mul(_count);
    }

    function alfaPassPrice(uint256 _count) public pure returns (uint256) {
        return ALFA_PASS_PRICE.mul(_count);
    }

    function _mint(address _to) private {
        uint256 id = _totalSupply();
        _tokenIdTracker.increment();
        _safeMint(_to, id);
    }

    function _alfaPassMint(uint256 tokenId) private {
        require(!claimedHanta[tokenId], "Hanta NFT already claimed");
        require(
            IBaseContract.ownerOf(tokenId) == msg.sender,
            "Alfa Pass not owned"
        );
        uint256 id = _totalSupply();
        _tokenIdTracker.increment();
        _safeMint(msg.sender, id);
        claimedHanta[tokenId] = true;
    }

    function alfaPassMintMultiple(uint256 amount, uint256[] calldata tokenIds)
        public
        payable
    {
        uint256 total = _totalSupply();
        require(total + amount <= MAX_ELEMENTS, "Max limit");
        require(total <= MAX_ELEMENTS, "Sale over");
        require(amount <= MAX_PER_TXN, "Exceeds number");
        require(msg.value >= alfaPassPrice(amount), "Value below price");
        for (uint256 i = 0; i < amount; i++) {
            _alfaPassMint(tokenIds[i]);
        }
    }

    function mintAllowList(uint256 amount) external payable {
        uint256 total = _totalSupply();
        require(isAllowListActive, "Allow list is not active");
        require(
            amount <= _allowList[msg.sender],
            "Exceeds max available to purchase"
        );
        require(total + amount <= MAX_ELEMENTS, "Exceeds number");
        require(msg.value >= price(amount), "Ether value sent is not correct");

        _allowList[msg.sender] -= amount;
        for (uint256 i = 0; i < amount; i++) {
            _mint(msg.sender);
        }
    }

    function publicMint(uint256 amount) public payable saleIsOpen {
        uint256 total = _totalSupply();
        require(isPublicLive, "Public Mint is not live");
        require(amount <= MAX_PER_TXN, "Exceeds number");
        require(amount + total <= MAX_ELEMENTS);
        require(msg.value >= price(amount));

        for (uint256 i = 0; i < amount; i++) {
            _mint(msg.sender);
        }
    }

    function walletOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(_owner);

        uint256[] memory tokensId = new uint256[](tokenCount);
        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    function pause(bool val) public onlyOwner {
        if (val == true) {
            _pause();
            return;
        }
        _unpause();
    }

    function withdrawAll() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0);
        _withdraw(creatorAddress, balance);
    }

    function _withdraw(address _address, uint256 _amount) private {
        (bool success, ) = _address.call{value: _amount}("");
        require(success, "Transfer failed.");
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
