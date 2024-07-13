// gallery.ejs' javascript code

const clubRankings = document.querySelectorAll('.club-ranking');
const galleryContainer = document.querySelector('.gallery');
const rankingsContainer = document.querySelector('.rankings');

// separate vertical scrolling
clubRankings.forEach((clubRanking) => {
    clubRanking.addEventListener('click', () => {
        const index = clubRanking.getAttribute('data-index');
        const gallery = galleryContainer.querySelector('.gallery');
        const targetImage = gallery.querySelector(`.club:nth-child(${parseInt(index) + 1}) img`);

        if (targetImage) {
            // Calculate the target position for scrolling in the gallery
            const targetPosition = targetImage.offsetTop;

            // Scroll the gallery container
            galleryContainer.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Scroll the rankings container
            const targetRanking = rankingsContainer.querySelector(`.club-ranking[data-index="${index}"]`);
            if (targetRanking) {
                rankingsContainer.scrollTo({
                    top: targetRanking.offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// gallery-rank linking
let selectedImage = null;

clubRankings.forEach((clubRanking) => {
    clubRanking.addEventListener('click', () => {
        const index = clubRanking.getAttribute('data-index');
        const gallery = document.querySelector('.gallery');
        const targetImage = gallery.querySelector(`.club:nth-child(${parseInt(index) + 1}) img`);

        if (selectedImage) {
            // Remove the shadow from the previous selected image
            selectedImage.style.boxShadow = 'none';
        }

        if (targetImage) {
            const containerHeight = gallery.clientHeight;
            const imageHeight = targetImage.clientHeight;

            // Calculate the position to center the image without scrolling
            const centerPosition = (containerHeight - imageHeight) / 2;

            // Apply a subtle shadow around the selected image
            targetImage.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
            selectedImage = targetImage;

            // Scroll to the center position
            gallery.scrollTo({
                top: targetImage.offsetTop - centerPosition,
                behavior: 'smooth'
            });
        }
    });
});

// images onclick event handler (anchor elements would have ruined the layout)
document.addEventListener("DOMContentLoaded", function () {
    const clubImages = document.querySelectorAll(".club-image");

    clubImages.forEach((image) => {
        const website = image.getAttribute("data-website");
        
        image.addEventListener("click", () => {
            if (website) {
                const newWindow = window.open("", "_blank");
                newWindow.location.href = website;
                newWindow.blur();
                window.focus();
            }
        });
    });
});