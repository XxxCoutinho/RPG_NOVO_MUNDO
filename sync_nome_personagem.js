(function(){
  const PERSONAGENS_KEY = 'rpgNexusPersonagens';
  const LEGACY_KEY = 'rpgNexusAgentes';
  const DRAFT_KEY = 'rpgNexusPersonagemEmCriacao';
  const DEFAULT_NAMES = ['novo personagem','novo npc','personagem sem nome'];

  function getParams(){
    const params = new URLSearchParams(window.location.search || '');
    return {
      id: params.get('personagemId') || params.get('agenteId') || params.get('id') || '',
      modelo: params.get('modelo') || '',
      tipo: params.get('tipo') || ''
    };
  }

  function readJson(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch(error){ return fallback; }
  }

  function writeJson(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }
    catch(error){ console.warn('Não foi possível salvar no localStorage:', error); }
  }

  function cleanName(value){
    const name = String(value || '').trim();
    if(!name) return '';
    if(DEFAULT_NAMES.includes(name.toLowerCase())) return '';
    return name;
  }

  function findNameField(){
    const selectors = [
      '#characterName', '#nomePersonagem', '#nome-personagem', '#personagemNome', '#nome',
      '[name="characterName"]', '[name="nomePersonagem"]', '[name="personagemNome"]', '[name="nome"]',
      '[data-character-name]', '[data-personagem-nome]'
    ];
    for(const selector of selectors){
      const el = document.querySelector(selector);
      if(el && ('value' in el)) return el;
    }

    const candidates = Array.from(document.querySelectorAll('input, textarea'));
    return candidates.find(function(el){
      const text = [el.id, el.name, el.placeholder, el.getAttribute('aria-label'), el.previousElementSibling?.textContent]
        .join(' ')
        .toLowerCase();
      return text.includes('nome') && (text.includes('personagem') || text.includes('agente') || text === ' nome ' || el.name === 'nome' || el.id === 'nome');
    }) || null;
  }

  function updateLocalCharacter(id, name){
    if(!id || !name) return;

    const current = readJson(PERSONAGENS_KEY, null);
    const legacy = readJson(LEGACY_KEY, null);
    const agents = Array.isArray(current) ? current : (Array.isArray(legacy) ? legacy : []);
    let found = false;

    const updated = agents.map(function(agent){
      if(String(agent.id) === String(id)){
        found = true;
        return Object.assign({}, agent, { name: name, updatedAt: new Date().toISOString() });
      }
      return agent;
    });

    if(found) writeJson(PERSONAGENS_KEY, updated);

    const draft = readJson(DRAFT_KEY, null);
    if(draft && String(draft.id) === String(id)){
      draft.name = name;
      draft.updatedAt = new Date().toISOString();
      writeJson(DRAFT_KEY, draft);
    }

    writeJson('rpgNexusNomePersonagem_' + id, { id: id, name: name, updatedAt: new Date().toISOString() });
  }

  async function updateCloudCharacter(id, name){
    if(!id || !name) return;
    try{
      if(!window.firebase || !firebase.auth || !firebase.firestore) return;
      const user = firebase.auth().currentUser;
      if(!user) return;
      await firebase.firestore()
        .collection('usuarios')
        .doc(user.uid)
        .collection('personagens')
        .doc(id)
        .set({ name: name, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }catch(error){
      console.warn('Não foi possível atualizar o nome do personagem no Firestore:', error);
    }
  }

  function syncNow(){
    const params = getParams();
    const field = findNameField();
    const name = cleanName(field && field.value);
    if(!params.id || !name) return;
    updateLocalCharacter(params.id, name);
    updateCloudCharacter(params.id, name);
  }

  function fillNameIfEmpty(){
    const params = getParams();
    const field = findNameField();
    if(!params.id || !field || cleanName(field.value)) return;

    const agents = readJson(PERSONAGENS_KEY, []);
    const agent = Array.isArray(agents) ? agents.find(function(item){ return String(item.id) === String(params.id); }) : null;
    const storedName = cleanName(agent && agent.name);
    if(storedName) field.value = storedName;
  }

  function init(){
    const params = getParams();
    if(!params.id) return;

    fillNameIfEmpty();

    const field = findNameField();
    if(!field) return;

    let timer = null;
    const scheduleSync = function(){
      clearTimeout(timer);
      timer = setTimeout(syncNow, 250);
    };

    field.addEventListener('input', scheduleSync);
    field.addEventListener('change', syncNow);
    field.addEventListener('blur', syncNow);
    syncNow();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
