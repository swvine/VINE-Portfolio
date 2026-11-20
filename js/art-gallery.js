
/* VINE — Interactive Art Gallery */

document.addEventListener("DOMContentLoaded", () => {
    const cards = Array.from(document.querySelectorAll(".art-card"));
    const lightbox = document.getElementById("art-lightbox");
    const image = document.getElementById("lightbox-image");
    const title = document.getElementById("lightbox-title");
    const course = document.getElementById("lightbox-course");
    const description = document.getElementById("lightbox-description");
  
    const closeButton = document.getElementById("close-lightbox");
    const previousButton = document.getElementById("previous-art");
    const nextButton = document.getElementById("next-art");
  
    // Artwork descriptions
    
  // Complete portfolio artwork descriptions
  const artworkDescriptions = {
    "Fabric Drapery Study":
      `This drawing explores the relationship between light, shadow, texture, and form through the observation of draped fabric. The folds and overlapping surfaces create variations in value, allowing the composition to demonstrate depth and dimension. Through careful shading and attention to the direction of the fabric, I worked to represent the way light interacts with different surfaces. This project helped strengthen my observational drawing skills, particularly in recognizing highlights, midtones, and shadows. It also provided an opportunity to practice creating realistic textures and three-dimensional forms using traditional drawing techniques, reinforcing the importance of patience, proportion, and visual accuracy in art.`,

    "Still-Life Drawing":
      `This still-life drawing explores observational skills, composition, proportion, and the relationship between objects arranged within a shared space. I used charcoal to develop variations in value, shading, and contrast, emphasizing how light and shadow define individual forms. The composition required careful attention to the placement and proportions of each object, along with the interaction between positive and negative space. Using highlights, midtones, and darker values, I worked to establish depth and a sense of three-dimensional structure. This assignment strengthened my understanding of observational drawing, visual balance, and traditional charcoal techniques.`,

    "Bridge Landscape":
      `This landscape drawing was created using a photograph as a visual reference, with a bridge serving as the central subject. I used white, gray, and black charcoal to develop the composition, focusing on perspective, depth, contrast, and the relationship between natural and constructed elements. The different charcoal tones allowed me to establish highlights, midtones, and shadows while creating a sense of dimension throughout the landscape. Translating the photograph into a charcoal drawing required careful observation of proportions, structural details, and spatial relationships. This project strengthened my understanding of tonal values, landscape composition, and traditional drawing techniques.`,

    "Anime-Inspired Painting":
      `This painting explores character illustration, color, composition, and personal artistic expression through anime-inspired imagery. I developed the composition using visual references, including plush toys and posters, to guide the arrangement and appearance of the subjects. After establishing the initial sketch, I used Winsor & Newton Galeria acrylic paints with gel medium to develop the colors, shapes, and details. The gel medium helped extend the working time of the acrylic paint, allowing me to adjust throughout the painting process. This project provided an opportunity to combine traditional painting techniques with contemporary illustration influences while strengthening my understanding of color relationships and composition.`
  };

  
    let currentIndex = 0;
  
    function displayArtwork(index) {
      currentIndex = (index + cards.length) % cards.length;
  
      const card = cards[currentIndex];
      const artworkTitle = card.dataset.title;
  
      image.src = card.dataset.image;
      image.alt = card.querySelector("img").alt;
      title.textContent = artworkTitle;
      course.textContent = card.dataset.course;
      description.textContent =
        artworkDescriptions[artworkTitle] || "";
    }
  
    function openArtwork(index) {
      displayArtwork(index);
      lightbox.showModal();
    }
  
    cards.forEach((card, index) => {
      card.addEventListener("click", () => openArtwork(index));
    });
  
    closeButton.addEventListener("click", () => {
      lightbox.close();
    });
  
    previousButton.addEventListener("click", () => {
      displayArtwork(currentIndex - 1);
    });
  
    nextButton.addEventListener("click", () => {
      displayArtwork(currentIndex + 1);
    });
  
    // Keyboard navigation
    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        displayArtwork(currentIndex - 1);
      }
  
      if (event.key === "ArrowRight") {
        displayArtwork(currentIndex + 1);
      }
    });
  
    // Close when clicking outside the artwork viewer
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        lightbox.close();
      }
    });
  });
  