// Генерує QR-код сторінки (Google Chart API). Якщо бажаєте локальний генератор,
// можна замінити на іншу бібліотеку.
(function(){
  function setQR(){
    try{
      const qrImg = document.getElementById('qrImage');
      if(!qrImg) return;
      const url = window.location.href;
      const size = 300;
      const src = 'https://chart.googleapis.com/chart?cht=qr&chs='+size+'x'+size+'&chl='+encodeURIComponent(url);
      qrImg.src = src;
      qrImg.alt = 'QR-код: ' + url;
    }catch(e){
      console.error(e);
    }
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setQR);
  } else setQR();
})();
