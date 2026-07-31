'use strict';

(function(){
  window.LABDS=window.LABDS||{};
  const DEFAULTS={theme:'system',fontSize:'normal',reducedMotion:false,highContrast:false,sharedDevice:false};
  let prefs={...DEFAULTS};
  let media=null;

  function load(){
    const saved=window.LABDS.Storage?.smallGet?.('accessibility',null);
    prefs=window.LABDS.Schemas?.sanitizePreferences?.(saved||{})||{...DEFAULTS,...saved};
    if(window.LABDS.Storage?.smallGet?.('theme') && !saved?.theme){
      const legacy=window.LABDS.Storage.smallGet('theme');
      if(['dark','light'].includes(legacy)) prefs.theme=legacy;
    }
    return prefs;
  }

  function resolvedTheme(){
    if(prefs.theme==='system') return matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';
    if(prefs.theme==='contrast') return 'dark';
    return prefs.theme;
  }

  function apply(save=true){
    const html=document.documentElement;
    html.dataset.theme=resolvedTheme();
    html.dataset.themeMode=prefs.theme;
    html.dataset.fontSize=prefs.fontSize;
    html.classList.toggle('high-contrast',prefs.theme==='contrast'||prefs.highContrast);
    html.classList.toggle('reduce-motion',prefs.reducedMotion);
    html.classList.toggle('shared-device',prefs.sharedDevice);
    html.style.colorScheme=resolvedTheme();
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content=resolvedTheme()==='light'?'#eef4fb':'#07111f';
    const toggle=document.querySelector('#themeToggle');
    if(toggle){
      const icons={system:'◒',dark:'◐',light:'◑',contrast:'◉'};
      toggle.textContent=icons[prefs.theme]||'◐';
      toggle.title=`Tema: ${prefs.theme==='system'?'usar o aparelho':prefs.theme}`;
      toggle.setAttribute('aria-label',toggle.title);
    }
    const version=document.querySelector('#appVersionBadge');
    if(version) version.textContent=`v${window.LABDS.VERSION}`;
    syncDialog();
    if(save) window.LABDS.Storage?.smallSet?.('accessibility',prefs);
    document.dispatchEvent(new CustomEvent('labds:accessibilitychange',{detail:{...prefs,resolvedTheme:resolvedTheme()}}));
  }

  function syncDialog(){
    const dialog=document.querySelector('#settingsDialog');
    if(!dialog)return;
    const theme=dialog.querySelector(`[name="settingsTheme"][value="${prefs.theme}"]`);if(theme)theme.checked=true;
    const font=dialog.querySelector('#settingsFontSize');if(font)font.value=prefs.fontSize;
    const motion=dialog.querySelector('#settingsReducedMotion');if(motion)motion.checked=prefs.reducedMotion;
    const contrast=dialog.querySelector('#settingsHighContrast');if(contrast)contrast.checked=prefs.highContrast;
    const shared=dialog.querySelector('#settingsSharedDevice');if(shared)shared.checked=prefs.sharedDevice;
  }

  function set(next){prefs=window.LABDS.Schemas?.sanitizePreferences?.({...prefs,...next})||{...prefs,...next};apply(true);}
  function cycleTheme(){const order=['system','dark','light','contrast'];set({theme:order[(order.indexOf(prefs.theme)+1)%order.length]});}
  function open(){syncDialog();document.querySelector('#settingsDialog')?.showModal();}

  function bind(){
    media=matchMedia('(prefers-color-scheme: light)');
    media.addEventListener?.('change',()=>{if(prefs.theme==='system')apply(false);});
    document.querySelector('#settingsBtn')?.addEventListener('click',open);
    document.querySelector('#themeToggle')?.addEventListener('click',cycleTheme);
    document.querySelectorAll('[name="settingsTheme"]').forEach(input=>input.addEventListener('change',()=>input.checked&&set({theme:input.value})));
    document.querySelector('#settingsFontSize')?.addEventListener('change',event=>set({fontSize:event.target.value}));
    document.querySelector('#settingsReducedMotion')?.addEventListener('change',event=>set({reducedMotion:event.target.checked}));
    document.querySelector('#settingsHighContrast')?.addEventListener('change',event=>set({highContrast:event.target.checked}));
    document.querySelector('#settingsSharedDevice')?.addEventListener('change',event=>set({sharedDevice:event.target.checked}));
    document.querySelector('#settingsReset')?.addEventListener('click',()=>{prefs={...DEFAULTS};apply(true);});
    document.querySelector('#settingsClearStudent')?.addEventListener('click',async()=>{
      if(!confirm('Encerrar a sessão atual e remover dados pessoais deste dispositivo?'))return;
      try{await window.LABDS.Session?.finalize?.('Finalizada em dispositivo compartilhado',{clearPersonal:true});}catch{}
      location.reload();
    });
  }

  function init(){load();apply(false);bind();}
  window.LABDS.Accessibility={init,apply,set,get:()=>({...prefs}),open,cycleTheme,resolvedTheme};
})();
