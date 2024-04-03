const clientWidth = document.documentElement.clientWidth;
function tapChapter(event) {
  const bounds = document.querySelector('html').getBoundingClientRect();
  const { clientX, clientY } = event;
  const { x, y } = { x: clientX / bounds.width, y: clientY / bounds.height };

  if (y < 0.2) {
    movePage('prev');
  } else if (y > 0.8) {
    movePage('next');
  } else if (x < 0.33) {
    movePage('prev');
  } else if (x > 0.66) {
    movePage('next');
  } else {
    movePage();
  }
}

function movePage(panel) {
  let page = getInt('page');
  const pages = getInt('pages');
  if (isNaN(page)) {
    page = 0;
  }
  switch (panel) {
    case 'next':
      if (page == pages) reader.post({ type: 'next' });
      else page++;
      break;
    case 'prev':
      if (page == 0) reader.post({ type: 'prev' });
      else page--;
      break;
    default:
      reader.post({ type: 'hide' });
      break;
  }

  chapter.style.transform = 'translate(-' + page * 100 + '%)';
  setAttr('data-page', page);
}
