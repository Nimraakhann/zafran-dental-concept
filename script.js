const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{ if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
},{threshold:.12,rootMargin:'0px 0px -30px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

const parallaxEls=[...document.querySelectorAll('[data-parallax]')];
let ticking=false;
function parallax(){
  const y=window.scrollY;
  parallaxEls.forEach(el=>{
    const rect=el.getBoundingClientRect();
    const speed=parseFloat(el.dataset.parallax||0);
    if(rect.bottom>0 && rect.top<innerHeight){
      const offset=(innerHeight/2-(rect.top+rect.height/2))*speed;
      el.style.transform=`translate3d(0,${offset}px,0)`;
    }
  });
  ticking=false;
}
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(parallax);ticking=true;}},{passive:true});
parallax();

if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(800px) rotateX(${y*-3}deg) rotateY(${x*4}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
  document.querySelectorAll('.magnetic').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.12}px)`;
    });
    btn.addEventListener('mouseleave',()=>btn.style.transform='');
  });
}
