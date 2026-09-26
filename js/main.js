
window.onload = function() {
  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  let sections = document.querySelectorAll('.section');
  let navItems = document.querySelectorAll('.nav li');

  const galleryImgs = document.querySelectorAll('.row > .column > img');
  galleryImgs.forEach(function(item) {
    item.addEventListener('click', function() {
      openModal(item);
    });
  })

  navItems.forEach((navItem, index) => navItem.addEventListener('click', function(event) {
    // const index = event.target.dataset.index;
    const section = sections[index];
    const sectionTop = section.offsetTop;
    navItem.classList.add('active');
    window.scrollTo({ top: sectionTop, left: 0,  });
  }));

  window.addEventListener('scroll', () => {
    let scrollPosition = window.scrollY;
    sections.forEach((section, index) => {
      let sectionTop = section.offsetTop;
      let sectionHeight = section.clientHeight;
      let sectionNavItem = document.querySelector(`.nav li[data-index="${index}"]`);
      sectionNavItem.classList.remove('active');
      if ((index === sections.length - 1 && scrollPosition + window.innerHeight >= document.documentElement.scrollHeight)) {
        let sectionNavItem = document.querySelector(`.nav li[data-index="${index}"]`);
        let prevSectionNavItem = document.querySelector(`.nav li[data-index="${index-1}"]`);
        sectionNavItem.classList.add('active');
        prevSectionNavItem.classList.remove('active');
      } else if(index !== sections.length - 1 && scrollPosition >= sectionTop - 120 && scrollPosition <= sectionTop + sectionHeight - 120) {
        let sectionNavItem = document.querySelector(`.nav li[data-index="${index}"]`);
        sectionNavItem.classList.add('active');
      }
    });
  });
}



const imgModal = document.getElementById("imgModal");

function openModal(item) {
  // const imgModal = document.getElementById("imgModal");
  const image = imgModal.querySelector(".modal-image");
  image.src = item.src;
  image.alt = item.alt;
  image.addEventListener("click", function() {
    closeModal();
  });
  imgModal.addEventListener("click", function() {
    closeModal();
  });
  document.getElementById("imgModal").style.display = "block";
}

function closeModal() {
  // const imgModal = document.getElementById("imgModal");
  imgModal.style.display = "none";
}