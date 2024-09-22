// Function to generate a cache-busting URL
function getCacheBustingUrl(url) {
    const timestamp = new Date().getTime();
    return `${url}?t=${timestamp}`;
}

// URL of the published Google Sheet CSV
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPPY-VhogzYF0HE_B5X7cOcTlYqg05PggpyARwDLXSeAiLg14vaAxfqEd7UIPjIwTCC_dE0RnJRbVV/pub?gid=0&single=true&output=csv';

// Store selected tags
const selectedTags = new Set();
let isNewestFirst = false;
let sortByPopularityFlag = false; // Flag to check current sorting
let popularityAscending = true; // Flag to check current popularity sort order

document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayCards();
    setupEventListeners();
    flickerNotice();
    filterCards();
});

function fetchAndDisplayCards() {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            displayCards(data);
            checkForCardIdInUrl();
        }
    });
}

function checkForCardIdInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('cardId');
    if (cardId) {
        openModalById(cardId);
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keydown', handleSearchInputKeydown);
    searchInput.addEventListener('keyup', handleSearchInputKeyup);

    const modal = document.getElementById('modal');
    modal.addEventListener('click', handleModalClick);

    document.getElementById('gcash-button').addEventListener('click', toggleGcashQr);
    document.getElementById('maya-button').addEventListener('click', toggleMayaQr);
    document.getElementById('download-gcash-qr').addEventListener('click', () => downloadQrImage('gcash-qr-image', 'gcash-qr.png'));
    document.getElementById('download-maya-qr').addEventListener('click', () => downloadQrImage('maya-qr-image', 'maya-qr.png'));
    document.getElementById('proceed-gcash').addEventListener('click', () => proceedToForm('gcash'));
    document.getElementById('proceed-maya').addEventListener('click', () => proceedToForm('maya'));
    document.getElementById('buymeacoffee-button').addEventListener('click', handleBuyMeACoffeeClick);
    document.getElementById('gdrive-button').addEventListener('click', handleGDriveClick);
    document.addEventListener('click', handleCardClick);
    document.getElementById('clear-tags-button').addEventListener('click', clearAllTags);
    document.getElementById('modal-close').addEventListener('click', closeModal);
}

function handleSearchInputKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        createTagFromInput();
    }
    filterCards();
}

function handleSearchInputKeyup(event) {
    if (event.key === ',' || event.key === ' ') {
        createTagFromInput();
    }
}




function handleModalClick(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.classList.add('hidden');
        resetQrContainers();
    }
}

function handleBuyMeACoffeeClick() {
    const buyMeACoffeeLink = this.getAttribute('data-buymeacoffee');
    if (buyMeACoffeeLink) {
        window.open(buyMeACoffeeLink, '_blank');
    } else {
        alert('No BuyMeACoffee link available for this sticker.');
    }
}

function handleGDriveClick() {
    const gdriveLink = this.getAttribute('data-gdrive');
    if (gdriveLink) {
        window.open(gdriveLink, '_blank');
    } else {
        alert('No Google Drive link available for this sticker.');
    }
}

function handleCardClick(event) {
    if (event.target.closest('.card')) {
        const card = event.target.closest('.card');
        const price = card.getAttribute('data-price');
        updateButtonVisibility(price);
    }
}

function openModalById(cardId) {
    const card = document.querySelector(`.card[data-id="${cardId}"]`);
    if (card) {
        card.click();
    }
}

function updateButtonVisibility(price) {
    const mayaButton = document.getElementById('maya-button');
    const gcashButton = document.getElementById('gcash-button');
    const buymeacoffeeButton = document.getElementById('buymeacoffee-button');
    const gdriveButton = document.getElementById('gdrive-button');

    if (price.toLowerCase() === 'free') {
        mayaButton.classList.add('hidden');
        gcashButton.classList.add('hidden');
        buymeacoffeeButton.classList.add('hidden');
        gdriveButton.classList.remove('hidden');
    } else {
        mayaButton.classList.remove('hidden');
        gcashButton.classList.remove('hidden');
        buymeacoffeeButton.classList.remove('hidden');
        gdriveButton.classList.add('hidden');
    }
}

function displayCards(data) {
    const cardsContainer = document.querySelector('#card-container');
    const suggestedTagsContainer = document.querySelector('#suggested-tags');
    
    cardsContainer.innerHTML = '';
    const allTags = new Set();

    sortData(data);

    data.forEach(row => {
        const card = createCard(row);
        cardsContainer.appendChild(card);
        row.Tags.split(',').forEach(tag => allTags.add(tag.trim()));
    });

    createSuggestedTagButtons(allTags, suggestedTagsContainer);
    addCardClickEventListeners();
}

function sortData(data) {
    if (sortByPopularityFlag) {
        data.sort((a, b) => popularityAscending ? a.Downloads - b.Downloads : b.Downloads - a.Downloads);
    } else if (isNewestFirst) {
        data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    } else {
        data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    }
}

function createCard(row) {
    const card = document.createElement('div');
    const isFree = row.Price.toLowerCase() === 'free' || row.Price.toLowerCase() === 'pay any amount';
    card.className = `card p-2 rounded-lg shadow-lg cursor-pointer flex flex-col relative group transition-colors duration-300 ${isFree ? 'bg-cyan-900 hover:bg-blue-800' : 'bg-gray-800 hover:bg-blue-900'} dark:${isFree ? 'bg-cyan-800 hover:bg-blue-700' : 'bg-gray-700 hover:bg-blue-800'}`;
    if (isFree) {
        card.style.animation = 'pulseBackground 4s ease-in-out infinite';
        card.style.setProperty('--hover-color', '#1e40af');
    } else {
        card.style.setProperty('--hover-color', '#1e3a8a');
    }
    setCardAttributes(card, row);
    card.innerHTML = generateCardInnerHTML(row, isFree);
    return card;
}

function setCardAttributes(card, row) {
    card.setAttribute('data-image', row.Image);
    card.setAttribute('data-title', row.Title);
    card.setAttribute('data-artist', row.Artist);
    card.setAttribute('data-tags', row.Tags);
    card.setAttribute('data-description', row.Description);
    card.setAttribute('data-formurl', row.FormURL);
    card.setAttribute('data-date', row.Date);
    card.setAttribute('data-downloads', row.Downloads);
    card.setAttribute('data-id', row.ID);
    card.setAttribute('data-reference-image', row.Reference);
    card.setAttribute('data-gcash', row.Gcash);
    card.setAttribute('data-maya', row.Maya);
    card.setAttribute('data-buymeacoffee', row.BuyMeACoffee);
    card.setAttribute('data-price', row.Price);
    card.setAttribute('data-gdrive', row.GDrive);
}

function generateCardInnerHTML(row, isFree) {
    return `
        <img src="${row.Image}" alt="${row.Title}" class="w-full object-cover rounded-t-lg" width="300px" height="300px">
        <div class="absolute top-4 right-2 flex items-center">
            <div class="priceTag px-3 py-3 transition-colors duration-300 ${isFree ? 'bg-cyan-900 group-hover:bg-blue-800' : 'bg-gray-800 group-hover:bg-blue-900'} dark:${isFree ? 'bg-cyan-800 group-hover:bg-blue-700' : 'bg-gray-700 group-hover:bg-blue-800'}" style="${isFree ? 'animation: pulseBackground 4s ease-in-out infinite;' : ''}">
                <div class="flex items-center">
                    <svg class="w-5 h-5 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <p class="text-lg font-bold ${isFree ? 'text-white' : 'text-gray-300'} dark:${isFree ? 'text-white' : 'text-gray-200'}">${isNaN(row.Price) ? row.Price.toUpperCase() : '₱' + row.Price}</p>
                </div>
            </div>
        </div>
        <h3 class="text-4xl font-semibold mt-2 px-2 lora-medium">${row.Title.toLowerCase()}</h3>
        <p class="mt-0 text-gray-400 px-2 text-sm"> added last <span class="font-bold text-gray-300 dark:text-gray-300">${row.Date}</span></p>
        <p class="mt-0 text-gray-400 px-2 pb-2 text-sm">ID: <span class="font-bold text-red-300 dark:text-red-300">${row.ID.toUpperCase()}</span></p>
    `;

}

function createSuggestedTagButtons(allTags, container) {
    container.innerHTML = '';
    createClearTagsButton(container);
    createSortButtons(container);
}

function createClearTagsButton(container) {
    const clearTagsButton = document.createElement('button');
    clearTagsButton.id = 'clear-tags-button';
    clearTagsButton.type = 'button';
    clearTagsButton.className = 'bg-red-900 text-white px-6 py-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-800 dark:hover:bg-red-600';
    clearTagsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>';
    clearTagsButton.addEventListener('click', clearAllTags);
    container.appendChild(clearTagsButton);
}

function createSortButtons(container) {
    const newestOldestButton = createSortButton('newest-oldest-button', 'Sort by Date', 'bg-yellow-800', 'bg-yellow-600', toggleNewestOldest, '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>');
    container.appendChild(newestOldestButton);

    const popularityButton = createSortButton('popularity-button', 'Sort by Popularity', 'bg-green-800', 'bg-green-600', togglePopularitySort, '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m305-704 112-145q12-16 28.5-23.5T480-880q18 0 34.5 7.5T543-849l112 145 170 57q26 8 41 29.5t15 47.5q0 12-3.5 24T866-523L756-367l4 164q1 35-23 59t-56 24q-2 0-22-3l-179-50-179 50q-5 2-11 2.5t-11 .5q-32 0-56-24t-23-59l4-165L95-523q-8-11-11.5-23T80-570q0-25 14.5-46.5T135-647l170-57Zm49 69-194 64 124 179-4 191 200-55 200 56-4-192 124-177-194-66-126-165-126 165Zm126 135Z"/></svg>');
    container.appendChild(popularityButton);
}

function createSortButton(id, text, bgColor, hvColor, onClick, svgContent) {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.className = `${bgColor} text-white px-6 py-2 rounded-full sm:rounded-full rounded-full sm:hover:${hvColor} focus:outline-none focus:ring-2 focus:${hvColor} dark:${bgColor} dark:hover:${hvColor} flex items-center sm:flex`;
    button.innerHTML = `<span class="inline sm:hidden">${svgContent}</span><span class="hidden sm:inline-block">${text}</span>`;
    button.addEventListener('click', onClick);
    return button;
}

function addCardClickEventListeners() {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            showModal(this);
        });
    });
}

function showModal(card) {
    document.getElementById('modal-image').src = card.getAttribute('data-image');
    document.getElementById('modal-title').textContent = card.getAttribute('data-title');
    document.getElementById('modal-id').textContent = card.getAttribute('data-id').toUpperCase();
    document.getElementById('modal-description').textContent = card.getAttribute('data-description');
    const price = card.getAttribute('data-price');
    document.getElementById('modal-price').textContent = isNaN(price) ? price : `₱${price}`;
    document.getElementById('modal').classList.remove('hidden');

    const modalShareButton = document.getElementById('modal-share-button');
    modalShareButton.setAttribute('data-id', card.getAttribute('data-id'));

    document.getElementById('gcash-qr-image').src = card.getAttribute('data-gcash');
    document.getElementById('maya-qr-image').src = card.getAttribute('data-maya');

    const buyMeACoffeeButton = document.getElementById('buymeacoffee-button');
    buyMeACoffeeButton.setAttribute('data-buymeacoffee', card.getAttribute('data-buymeacoffee'));

    const gdriveButton = document.getElementById('gdrive-button');
    gdriveButton.setAttribute('data-gdrive', card.getAttribute('data-gdrive'));

    addImagePreviews(card);
    updateButtonVisibility(price);
}

function addImagePreviews(card) {
    const imagePreviewsContainer = document.getElementById('image-previews');
    imagePreviewsContainer.innerHTML = '';
    const tinyImages = card.getAttribute('data-image').split(',');
    tinyImages.forEach(imgSrc => {
        const img = createPreviewImage(imgSrc);
        imagePreviewsContainer.appendChild(img);
    });

    const referenceImgSrcs = card.getAttribute('data-reference-image').split(',');
    referenceImgSrcs.forEach(referenceImgSrc => {
        const referenceImg = createReferenceImage(referenceImgSrc);
        imagePreviewsContainer.appendChild(referenceImg);
    });
}

function createPreviewImage(imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.className = 'w-12 h-12 object-cover rounded-lg cursor-pointer border-2 border-blue-500 hover:border-blue-500';
    img.addEventListener('click', function() {
        document.getElementById('modal-image').src = imgSrc;
        updateSelectedImage(img);
    });
    return img;
}

function createReferenceImage(referenceImgSrc) {
    const referenceImg = document.createElement('img');
    referenceImg.src = referenceImgSrc;
    referenceImg.className = 'w-12 h-12 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500';
    referenceImg.addEventListener('click', function() {
        document.getElementById('modal-image').src = referenceImgSrc;
        updateSelectedImage(referenceImg);
    });
    return referenceImg;
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    resetQrContainers();
}

function updateSelectedImage(selectedImg) {
    document.querySelectorAll('#image-previews img').forEach(img => {
        img.classList.remove('border-blue-500');
        img.classList.add('border-transparent');
    });
    selectedImg.classList.add('border-blue-500');
    selectedImg.classList.remove('border-transparent');
}

function filterCards() {
    const tags = Array.from(selectedTags);
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const searchTerms = searchTerm.split(/[\s,]+/).filter(term => term !== '');
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const cardTags = card.getAttribute('data-tags').split(',').map(tag => tag.trim().toLowerCase());
        const cardTitle = card.getAttribute('data-title').toLowerCase();
        const cardDescription = card.getAttribute('data-description').toLowerCase();
        const cardId = card.getAttribute('data-id').toLowerCase();
        const cardArtist = card.getAttribute('data-artist').toLowerCase();
        const cardPrice = card.getAttribute('data-price').toLowerCase();

        const matchesTags = tags.length === 0 || tags.every(tag => 
            cardTags.some(cardTag => cardTag.includes(tag.toLowerCase())) ||
            cardTitle.includes(tag.toLowerCase()) ||
            cardDescription.includes(tag.toLowerCase()) ||
            cardId.includes(tag.toLowerCase()) ||
            cardArtist.includes(tag.toLowerCase()) ||
            cardPrice.includes(tag.toLowerCase())
        );
        const matchesSearch = searchTerms.every(term => 
            term === '' || 
            cardTags.some(tag => tag.includes(term.toLowerCase())) || 
            cardTitle.includes(term.toLowerCase()) || 
            cardDescription.includes(term.toLowerCase()) || 
            cardId.includes(term.toLowerCase()) || 
            cardArtist.includes(term.toLowerCase()) ||
            cardPrice.includes(term.toLowerCase())
        );
        card.style.display = matchesTags && matchesSearch ? 'block' : 'none';
    });

    updateTagButtonColors();
}

function updateTagButtonColors() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const searchTerms = searchTerm.split(',').map(term => term.trim());

    document.querySelectorAll('.tag-button').forEach(button => {
        const tag = button.textContent.toLowerCase();
        const isSelected = selectedTags.has(tag);
        const matchesSearch = searchTerms.some(term => tag.includes(term));

        if (matchesSearch) {
            button.classList.add('bg-blue-900', 'text-white');
            button.classList.remove('bg-gray-700', 'text-gray-300');
        } else {
            button.classList.remove('bg-blue-900', 'text-white');
            button.classList.add('bg-gray-700', 'text-gray-300');
        }

        if (isSelected) {
            button.classList.add('bg-blue-900', 'text-white');
            button.classList.remove('bg-gray-700', 'text-gray-300');
        } else if (!searchTerms.includes(tag)) {
            button.classList.remove('bg-blue-900', 'text-white');
            button.classList.add('bg-gray-700', 'text-gray-300');
        }
    });
}

function toggleTag(tag) {
    tag = tag.toLowerCase();
    const searchInput = document.getElementById('search-input');
    const currentSearch = searchInput.value.toLowerCase().split(',').map(term => term.trim());

    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        searchInput.value = currentSearch.filter(term => term !== tag).join(', ');
        document.querySelectorAll('.tag-button').forEach(button => {
            if (button.textContent.toLowerCase() === tag) {
                button.remove();
            }
        });
    } else {
        selectedTags.add(tag);
        if (!currentSearch.includes(tag)) {
            currentSearch.push(tag);
            searchInput.value = currentSearch.join(', ');
        }
    }
    filterCards();
}

function clearAllTags() {
    selectedTags.clear();
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.tag-button').forEach(button => button.remove());
    filterCards();
}

function togglePopularitySort() {
    sortByPopularityFlag = true;
    popularityAscending = !popularityAscending;
    const button = document.getElementById('popularity-button');
    button.textContent = popularityAscending ? 'Least to Most' : 'Most to Least';

    fetchAndDisplayCards();
}

function toggleNewestOldest() {
    isNewestFirst = !isNewestFirst;
    const button = document.getElementById('newest-oldest-button');
    button.textContent = isNewestFirst ? 'Newest to Oldest' : 'Oldest to Newest';

    fetchAndDisplayCards();
}

function shareOnX() {
    const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
    const shareUrl = `${window.location.origin}${window.location.pathname}?cardId=${cardId}`;
    const text = "Check out this awesome sticker design!";
    const twitterUrl = `https://X.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
}

function shareOnFacebook() {
    const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
    const shareUrl = `${window.location.origin}${window.location.pathname}?cardId=${cardId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
}

function copyShareLink() {
    const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
    const shareUrl = `${window.location.origin}${window.location.pathname}?cardId=${cardId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Share link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy link. Please try again.');
    });
}

function toggleGcashQr() {
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const mayaQrContainer = document.getElementById('maya-qr-container');
    const modalImageParent = document.getElementById('modal-image').parentElement;
    const gcashButton = document.getElementById('gcash-button');
    const mayaButton = document.getElementById('maya-button');

    if (gcashQrContainer.classList.contains('hidden')) {
        gcashQrContainer.classList.remove('hidden');
        mayaQrContainer.classList.add('hidden');
        modalImageParent.classList.add('hidden');
        gcashButton.classList.remove('bg-blue-700');
        gcashButton.classList.add('bg-blue-900');
        mayaButton.classList.remove('bg-green-900');
        mayaButton.classList.add('bg-green-700');
    } else {
        gcashQrContainer.classList.add('hidden');
        modalImageParent.classList.remove('hidden');
        gcashButton.classList.remove('bg-blue-900');
        gcashButton.classList.add('bg-blue-700');
    }
}

function toggleMayaQr() {
    const mayaQrContainer = document.getElementById('maya-qr-container');
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const modalImageParent = document.getElementById('modal-image').parentElement;
    const mayaButton = document.getElementById('maya-button');
    const gcashButton = document.getElementById('gcash-button');

    if (mayaQrContainer.classList.contains('hidden')) {
        mayaQrContainer.classList.remove('hidden');
        gcashQrContainer.classList.add('hidden');
        modalImageParent.classList.add('hidden');
        mayaButton.classList.remove('bg-green-700');
        mayaButton.classList.add('bg-green-900');
        gcashButton.classList.remove('bg-blue-900');
        gcashButton.classList.add('bg-blue-700');
    } else {
        mayaQrContainer.classList.add('hidden');
        modalImageParent.classList.remove('hidden');
        mayaButton.classList.remove('bg-green-900');
        mayaButton.classList.add('bg-green-700');
    }
}

function resetQrContainers() {
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const mayaQrContainer = document.getElementById('maya-qr-container');
    const modalImageParent = document.getElementById('modal-image').parentElement;

    gcashQrContainer.classList.add('hidden');
    mayaQrContainer.classList.add('hidden');
    modalImageParent.classList.remove('hidden');
}

function downloadQrImage(imageId, filename) {
    const imageUrl = document.getElementById(imageId).src;
    downloadImage(imageUrl, filename);
}

function downloadImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function proceedToForm(paymentMethod) {
    const cardId = document.getElementById('modal-share-button').getAttribute('data-id').toUpperCase();
    const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSceOCVJ3DaZ1tnzecv_0rkVJlK85qrcDULjzz5Fx-EoHqbODQ/viewform?usp=pp_url&entry.1343575495=${cardId}&entry.1470546329=${paymentMethod.toUpperCase()}`;
    window.open(formUrl, '_blank');
}


function flickerNotice() {
    const notice = document.getElementById('flickering-notice');
    const flickerInterval = Math.random() * 800 + 300; // Random interval between 500ms and 1500ms
    const randomOpacity = Math.random().toFixed(2); // Random opacity between 0 and 1
    if (notice.style.display === 'none') {
        notice.style.display = 'block';
        notice.style.opacity = randomOpacity;
    } else {
        notice.style.display = 'none';
    }
    setTimeout(flickerNotice, flickerInterval);
}

function createTagFromInput() {
    const searchInput = document.getElementById('search-input');
    const inputVal = searchInput.value.trim();
    const noCommaVal = inputVal.replace(/,/g, "");

    if ((inputVal.slice(-1) === "," || event.key === 'Enter' || event.key === ' ') && noCommaVal.length > 0) {
        if (!selectedTags.has(noCommaVal.toLowerCase())) {
            const newTag = compileTag(noCommaVal);
            document.getElementById('suggested-tags').appendChild(newTag);
            selectedTags.add(noCommaVal.toLowerCase());
        }
        searchInput.value = "";
        filterCards();
    }
}

function createTagsFromSearchButton() {
    const searchInput = document.getElementById('search-input');
    const inputVal = searchInput.value.trim();
    const noCommaVal = inputVal.replace(/,/g, "");

    if (noCommaVal.length > 0) {
        if (!selectedTags.has(noCommaVal.toLowerCase())) {
            const newTag = compileTag(noCommaVal);
            document.getElementById('suggested-tags').appendChild(newTag);
            selectedTags.add(noCommaVal.toLowerCase());
        }
        searchInput.value = "";
        filterCards();
    }
}


function compileTag(tagContent) {
    const existingTag = Array.from(document.getElementsByClassName('tag-button')).find(tag => tag.textContent.trim() === tagContent);
    if (existingTag) {
        return existingTag;
    }

    const tag = document.createElement("button");
    tag.className = 'tag-button bg-gray-700 text-gray-300 px-6 py-2 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
    tag.textContent = tagContent;
    tag.addEventListener('click', function() {
        toggleTag(tagContent);
    });

    const remove = document.createElement("i");
    remove.className = "fa fa-remove";
    remove.id = "remove";
    remove.onclick = function() { 
        this.parentNode.remove(); 
        selectedTags.delete(tagContent.toLowerCase());
        filterCards();
    };

    tag.appendChild(remove);
    return tag;
}

function toggleSuggestedTags() {
    const suggestedTags = document.getElementById('suggested-tags');
    if (suggestedTags.classList.contains('hidden')) {
        suggestedTags.classList.remove('hidden');
    } else {
        suggestedTags.classList.add('hidden');
    }
}

let placeholders = [];
let currentIndex = 0;

function changePlaceholder() {
    const searchInput = document.getElementById('search-input');
    if (placeholders.length > 0) {
        if (window.innerWidth > 640) { 
            searchInput.placeholder = `Search using tags or ID: ( ${placeholders[currentIndex]} )`;
        } else {
            searchInput.placeholder = `${placeholders[currentIndex]}`;
        }
        currentIndex = (currentIndex + 1) % placeholders.length;

    }

}

function fetchPlaceholdersFromCSV() {
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            placeholders = results.data.slice(0, 5).map(row => `${row.Tags.toLowerCase()}, ${row.ID.toUpperCase()}`);
            setInterval(changePlaceholder, 2000);
        }
    });
}

fetchPlaceholdersFromCSV();

document.getElementById('modal-close').addEventListener('click', function() {
    closeModal();
});

flickerNotice();
