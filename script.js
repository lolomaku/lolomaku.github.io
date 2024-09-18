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

// Function to open modal by card ID
function openModalById(cardId) {
    const card = document.querySelector(`.card[data-id="${cardId}"]`);
    if (card) {
        card.click();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch and parse the CSV
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            displayCards(data);

            // Check for card ID in URL and open modal if it exists
            const urlParams = new URLSearchParams(window.location.search);
            const cardId = urlParams.get('cardId');
            if (cardId) {
                openModalById(cardId);

                // Fetch the CSV again to update meta tags
                fetch(csvUrl)
                    .then(response => response.text())
                    .then(data => {
                        const parsedData = Papa.parse(data, { header: true }).data;
                        const card = parsedData.find(row => row.ID === cardId);
                        if (card) {
                            const imageUrl = card.Image;
                            document.querySelector('meta[name="twitter:image"]').setAttribute('content', imageUrl);
                            document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
                        }
                    });
            }
        }
    });

    // Add event listener to the search input box
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            filterCards();
        }
    });

    const modal = document.getElementById('modal');
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.add('hidden');
            resetQrContainers(); // Reset QR containers when modal is clicked
        }
    });

    document.getElementById('gcash-button').addEventListener('click', toggleGcashQr);
    document.getElementById('maya-button').addEventListener('click', toggleMayaQr);

    document.getElementById('download-gcash-qr').addEventListener('click', function() {
        const gcashQrImage = document.getElementById('gcash-qr-image').src;
        downloadImage(gcashQrImage, 'gcash-qr.png');
    });
    document.getElementById('download-maya-qr').addEventListener('click', function() {
        const mayaQrImage = document.getElementById('maya-qr-image').src;
        downloadImage(mayaQrImage, 'maya-qr.png');
    });

    document.getElementById('proceed-gcash').addEventListener('click', function() {
        const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
        const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSceOCVJ3DaZ1tnzecv_0rkVJlK85qrcDULjzz5Fx-EoHqbODQ/viewform?usp=pp_url&entry.1343575495=${cardId}`;
        window.open(formUrl, '_blank');
    });
    
    document.getElementById('proceed-maya').addEventListener('click', function() {
        const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
        const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSceOCVJ3DaZ1tnzecv_0rkVJlK85qrcDULjzz5Fx-EoHqbODQ/viewform?usp=pp_url&entry.1343575495=${cardId}`;
        window.open(formUrl, '_blank');
    });

    // Add event listener for the BuyMeACoffee button
    document.getElementById('buymeacoffee-button').addEventListener('click', function() {
        const buyMeACoffeeLink = this.getAttribute('data-buymeacoffee');
        if (buyMeACoffeeLink) {
            window.open(buyMeACoffeeLink, '_blank');
        } else {
            alert('No BuyMeACoffee link available for this sticker.');
        }
    });

    // Add event listener to the Clear All button
    document.getElementById('clear-tags-button').addEventListener('click', clearAllTags);
});

// Function to display cards with optional sorting
function displayCards(data) {
    const cardsContainer = document.querySelector('#card-container');
    const suggestedTagsContainer = document.querySelector('#suggested-tags');
    
    // Clear existing cards
    cardsContainer.innerHTML = '';

    // Track all unique tags
    const allTags = new Set();

    // Sort data if needed
    if (sortByPopularityFlag) {
        data.sort((a, b) => popularityAscending ? a.Downloads - b.Downloads : b.Downloads - a.Downloads); // Sort by downloads
    } else if (isNewestFirst) {
        data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    } else {
        data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    }

    // Generate cards and collect tags
    data.forEach(row => {
        const card = document.createElement('div');
        card.className = 'card bg-white p-2 dark:bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-blue-900';
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
        card.setAttribute('data-gcash', row.Gcash); // Add Gcash QR code link
        card.setAttribute('data-maya', row.Maya); // Add Maya QR code link
        card.setAttribute('data-buymeacoffee', row.BuyMeACoffee); // Add BuyMeACoffee link

        const hiddenLoveDisplay = row.Downloads < 2 ? 'none' : 'inline';

        card.innerHTML = `
            <img src="${row.Image}" alt="${row.Title}" class="w-full h-48 object-cover rounded-t-lg">
            <h3 class="text-lg font-semibold mt-2 px-2">${row.Title}</h3>
            <p class="mt-0 text-gray-400 px-2">made by <span class="font-bold text-gray-300">${row.Artist}</span> last <span class="font-bold text-gray-300">${row.Date}</span></p>
            <p class="mt-0 text-gray-400 px-2 pb-2"><span style="display: ${hiddenLoveDisplay}";>loved by <span class="font-bold text-red-300">${row.Downloads}</span> people</span></p>
        `;

        cardsContainer.appendChild(card);

        // Add tags to allTags set
        row.Tags.split(',').forEach(tag => allTags.add(tag.trim()));
    });

    // Create buttons for suggested tags
    suggestedTagsContainer.innerHTML = '';
    const clearTagsButton = document.createElement('button');
    clearTagsButton.id = 'clear-tags-button';
    clearTagsButton.type = 'button'; // Prevent form submission
    clearTagsButton.textContent = 'Clear All';
    clearTagsButton.className = 'bg-red-900 text-white px-6 py-2 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500';
    clearTagsButton.addEventListener('click', function() {
        clearAllTags();
    });
    suggestedTagsContainer.appendChild(clearTagsButton);

    // Newest to Oldest button
    const newestOldestButton = document.createElement('button');
    newestOldestButton.id = 'newest-oldest-button';
    newestOldestButton.type = 'button'; // Prevent form submission
    newestOldestButton.textContent = 'Sort by Date';
    newestOldestButton.className = 'bg-yellow-800 text-white px-6 py-2 rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:bg-yellow-700';
    newestOldestButton.addEventListener('click', function() {
        toggleNewestOldest();
    });
    suggestedTagsContainer.appendChild(newestOldestButton);

    // Add Sort by Popularity button
    const popularityButton = document.createElement('button');
    popularityButton.id = 'popularity-button';
    popularityButton.type = 'button';
    popularityButton.textContent = 'Sort by Popularity';
    popularityButton.className = 'bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500';
    popularityButton.addEventListener('click', function() {
        togglePopularitySort();
    });
    suggestedTagsContainer.appendChild(popularityButton);

    // Create buttons for suggested tags
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.textContent = tag;
        button.className = 'tag-button hidden sm:flex flex-wrap bg-gray-700 text-gray-300 px-6 py-2 rounded-full hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';
        button.addEventListener('click', function() {
            toggleTag(tag);
        });
        suggestedTagsContainer.appendChild(button);
    });

    // Add card click event listener to show modal
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', function() {
            document.getElementById('modal-image').src = this.getAttribute('data-image');
            document.getElementById('modal-title').textContent = this.getAttribute('data-title');
            document.getElementById('modal-description').textContent = this.getAttribute('data-description');
            document.getElementById('modal').classList.remove('hidden');

            // Set the share button's data-id attribute
            const modalShareButton = document.getElementById('modal-share-button');
            modalShareButton.setAttribute('data-id', this.getAttribute('data-id'));

            // Set the QR code images
            document.getElementById('gcash-qr-image').src = this.getAttribute('data-gcash');
            document.getElementById('maya-qr-image').src = this.getAttribute('data-maya');

            // Set the BuyMeACoffee link
            const buyMeACoffeeButton = document.getElementById('buymeacoffee-button');
            buyMeACoffeeButton.setAttribute('data-buymeacoffee', this.getAttribute('data-buymeacoffee'));

            // Add tiny image previews
            const imagePreviewsContainer = document.getElementById('image-previews');
            imagePreviewsContainer.innerHTML = ''; // Clear previous previews
            const tinyImages = this.getAttribute('data-image').split(','); // Assuming multiple images are comma-separated
            tinyImages.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.className = 'w-12 h-12 object-cover rounded-lg cursor-pointer border-2 border-blue-500 hover:border-blue-500';
                img.addEventListener('click', function() {
                    document.getElementById('modal-image').src = imgSrc; // Change main image on click
                    updateSelectedImage(img); // Update selected image border
                });
                imagePreviewsContainer.appendChild(img);
            });

            // Add tiny previews of the reference images
            const referenceImgSrcs = this.getAttribute('data-reference-image').split(','); // Assuming multiple reference images are comma-separated
            referenceImgSrcs.forEach(referenceImgSrc => {
                const referenceImg = document.createElement('img');
                referenceImg.src = referenceImgSrc;
                referenceImg.className = 'w-12 h-12 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-blue-500';
                referenceImg.addEventListener('click', function() {
                    document.getElementById('modal-image').src = referenceImgSrc; // Change main image on click
                    updateSelectedImage(referenceImg); // Update selected image border
                });
                imagePreviewsContainer.appendChild(referenceImg);
            });
        });
    });

    // Add modal close functionality
    document.getElementById('modal-close').addEventListener('click', function() {
        document.getElementById('modal').classList.add('hidden');
        resetQrContainers();
    });

    // Initial card display
    filterCards();
}

// Function to update the selected image border
function updateSelectedImage(selectedImg) {
    document.querySelectorAll('#image-previews img').forEach(img => {
        img.classList.remove('border-blue-500');
        img.classList.add('border-transparent');
    });
    selectedImg.classList.add('border-blue-500');
    selectedImg.classList.remove('border-transparent');
}

// Function to filter cards by selected tags and search input
function filterCards() {
    const tags = Array.from(selectedTags);
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(function(card) {
        const cardTags = card.getAttribute('data-tags').split(',').map(tag => tag.trim().toLowerCase());
        const cardTitle = card.getAttribute('data-title').toLowerCase();
        const cardDescription = card.getAttribute('data-description').toLowerCase();
        const cardId = card.getAttribute('data-id').toLowerCase(); // Get the card ID
        const cardArtist = card.getAttribute('data-artist').toLowerCase(); // Get the card Artist

        const matchesTags = tags.length === 0 || tags.every(tag => cardTags.includes(tag.toLowerCase()));
        const matchesSearch = searchTerm === '' || cardTags.some(tag => tag.includes(searchTerm)) || cardTitle.includes(searchTerm) || cardDescription.includes(searchTerm) || cardId.includes(searchTerm) || cardArtist.includes(searchTerm); // Include Artist in search

        card.style.display = matchesTags && matchesSearch ? 'block' : 'none';
    });

    updateTagButtonColors();
}

// Function to update tag button colors based on search term and tag selection
function updateTagButtonColors() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    document.querySelectorAll('.tag-button').forEach(button => {
        const tag = button.textContent.toLowerCase();
        const isSelected = selectedTags.has(tag);

        if (searchTerm === '' || tag.includes(searchTerm)) {
            button.classList.add('bg-blue-900', 'text-white');
            button.classList.remove('bg-gray-700', 'text-gray-300');
        } else {
            button.classList.remove('bg-blue-900', 'text-white');
            button.classList.add('bg-gray-700', 'text-gray-300');
        }

        // Handle the selected state separately
        if (isSelected) {
            button.classList.add('bg-blue-900', 'text-white');
            button.classList.remove('bg-gray-700', 'text-gray-300');
        } else if (!searchTerm) {
            button.classList.remove('bg-blue-900', 'text-white');
            button.classList.add('bg-gray-700', 'text-gray-300');
        }
    });
}

// Function to handle tag selection and update UI
function toggleTag(tag) {
    tag = tag.toLowerCase();
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
    } else {
        selectedTags.add(tag);
    }
    filterCards();
}

// Function to clear all selected tags and reset UI
function clearAllTags() {
    selectedTags.clear();
    document.getElementById('search-input').value = ''; // Clear the search input
    filterCards(); // Apply the changes
}

// Function to handle toggling sorting by popularity
function togglePopularitySort() {
    sortByPopularityFlag = true; // Set the flag for popularity sorting
    popularityAscending = !popularityAscending; // Toggle between ascending and descending
    const button = document.getElementById('popularity-button');
    button.textContent = popularityAscending ? 'Least to Most' : 'Most to Least';

    // Re-fetch and display cards with current filters
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            let data = results.data;
            displayCards(data);
            filterCards();
        }
    });
}

// Function to toggle between Newest to Oldest and Oldest to Newest
function toggleNewestOldest() {
    isNewestFirst = !isNewestFirst;
    const button = document.getElementById('newest-oldest-button');
    button.textContent = isNewestFirst ? 'Newest to Oldest' : 'Oldest to Newest';

    // Re-fetch and display cards with current filters
    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: function(results) {
            let data = results.data;
            
            if (!isNewestFirst) {
                data.reverse(); // Reverse the order if not newest first
            }

            // Pass the current active tags and search term to displayCards
            displayCards(data);
            filterCards();
        }
    });
}

// Call this function initially to ensure correct button colors on page load
filterCards();

const images = [
    'test.png',  
    'test2.png',
    'test.png', 
    'test2.png',
    'test.png',
    'test.png',
    'test.png',
];

let currentIndex = 0;
const cyclingBackgroundDiv = document.getElementById('cycling-background');

// Function to change background image
function changeBackgroundImage() {
    cyclingBackgroundDiv.style.backgroundImage = `url('${images[currentIndex]}')`;
    currentIndex = (currentIndex + 1) % images.length;  // Cycle through the images
}

// Set initial background image
changeBackgroundImage();

// Change image every 5 seconds (5000ms)
setInterval(changeBackgroundImage, 500);
// Function to share on Twitter
function shareOnX() {
    const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
    const shareUrl = `${window.location.origin}${window.location.pathname}?cardId=${cardId}`;
    const text = "Check out this awesome sticker design!";
    const twitterUrl = `https://X.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
}

// Function to share on Facebook
function shareOnFacebook() {
    const cardId = document.getElementById('modal-share-button').getAttribute('data-id');
    const shareUrl = `${window.location.origin}${window.location.pathname}?cardId=${cardId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
}

// Function to copy share link
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

// Function to toggle GCash QR container and modal image parent
function toggleGcashQr() {
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const mayaQrContainer = document.getElementById('maya-qr-container');
    const modalImageParent = document.getElementById('modal-image').parentElement;

    if (gcashQrContainer.classList.contains('hidden')) {
        gcashQrContainer.classList.remove('hidden');
        mayaQrContainer.classList.add('hidden');
        modalImageParent.classList.add('hidden');
    } else {
        gcashQrContainer.classList.add('hidden');
        modalImageParent.classList.remove('hidden');
    }
}

// Function to toggle Maya QR container and modal image parent
function toggleMayaQr() {
    const mayaQrContainer = document.getElementById('maya-qr-container');
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const modalImageParent = document.getElementById('modal-image').parentElement;

    if (mayaQrContainer.classList.contains('hidden')) {
        mayaQrContainer.classList.remove('hidden');
        gcashQrContainer.classList.add('hidden');
        modalImageParent.classList.add('hidden');
    } else {
        mayaQrContainer.classList.add('hidden');
        modalImageParent.classList.remove('hidden');
    }
}

// Function to reset QR containers and show modal image
function resetQrContainers() {
    const gcashQrContainer = document.getElementById('gcash-qr-container');
    const mayaQrContainer = document.getElementById('maya-qr-container');
    const modalImageParent = document.getElementById('modal-image').parentElement;

    gcashQrContainer.classList.add('hidden');
    mayaQrContainer.classList.add('hidden');
    modalImageParent.classList.remove('hidden');
}


// Function to download an image
function downloadImage(imageUrl, filename) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.target = '_blank'; // Open in a new tab
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



