(() => {
  const player = [
    { id: 'dash-extra', name: '+1 DASH EXTRA', category: 'MOBILIDADE', rarity: 'Rara', rarityKey: 'rare', description: 'Ganha uma carga adicional de dash.' },
    { id: 'super-dash', name: 'SUPER DASH', category: 'MOBILIDADE', rarity: 'Épica', rarityKey: 'epic', description: 'Dash percorre 45% mais distância e deixa rastro vermelho.' },
    { id: 'quick-recovery', name: 'QUICK RECOVERY', category: 'MOBILIDADE', rarity: 'Comum', rarityKey: 'common', description: 'Recupera cargas de dash 30% mais rápido.' },
    { id: 'phantom-step', name: 'PHANTOM STEP', category: 'MOBILIDADE', rarity: 'Rara', rarityKey: 'rare', description: 'Dash deixa imagens residuais que desaparecem.' },
    { id: 'double-damage', name: 'DOUBLE DAMAGE', category: 'COMBATE', rarity: 'Épica', rarityKey: 'epic', description: 'Dobra o dano das armas.' },
    { id: 'quick-reload', name: 'QUICK RELOAD', category: 'COMBATE', rarity: 'Comum', rarityKey: 'common', description: 'Reduz em 30% o tempo de recarga.' },
    { id: 'deadly-precision', name: 'DEADLY PRECISION', category: 'COMBATE', rarity: 'Rara', rarityKey: 'rare', description: 'Pellets próximos ao centro da mira causam dano extra.' },
    { id: 'blood-harvest', name: 'BLOOD HARVEST', category: 'COMBATE', rarity: 'Comum', rarityKey: 'common', description: 'Cada eliminação recupera 3 de sanidade.' },
    { id: 'extra-ammunition', name: 'EXTRA AMMUNITION', category: 'COMBATE', rarity: 'Comum', rarityKey: 'common', description: 'Aumenta em 2 a capacidade do carregador.' },
    { id: 'ricochet', name: 'RICOCHET', category: 'COMBATE', rarity: 'Épica', rarityKey: 'epic', description: 'Cada pellet pode ricochetear uma vez em uma parede.' },
    { id: 'regeneration', name: 'REGENERATION', category: 'SOBREVIVÊNCIA', rarity: 'Rara', rarityKey: 'rare', description: 'Regenera 0,7 de sanidade por segundo.' },
    { id: 'adrenaline', name: 'ADRENALINE', category: 'SOBREVIVÊNCIA', rarity: 'Rara', rarityKey: 'rare', description: 'Com menos de 30% de vida, move-se 35% mais rápido.' },
    { id: 'second-chance', name: 'SECOND CHANCE', category: 'SOBREVIVÊNCIA', rarity: 'Lendária', rarityKey: 'legendary', description: 'Sobrevive uma vez a um golpe fatal por partida.' },
    { id: 'iron-body', name: 'IRON BODY', category: 'SOBREVIVÊNCIA', rarity: 'Rara', rarityKey: 'rare', description: 'Reduz em 20% o dano recebido.' },
    { id: 'kernel-patch', name: 'PATCH DE KERNEL', category: 'COMBATE', rarity: 'Comum', rarityKey: 'common', description: 'Aumenta em 1 o dano base da espingarda.' },
    { id: 'cache-clean', name: 'CACHE LIMPO', category: 'SOBREVIVÊNCIA', rarity: 'Rara', rarityKey: 'rare', description: 'Aumenta a vida máxima em 25 e recupera essa vida.' },
    { id: 'clock-overdrive', name: 'CLOCK OVERDRIVE', category: 'MOBILIDADE', rarity: 'Rara', rarityKey: 'rare', description: 'Aumenta a velocidade de movimento em 12%.' }
  ];

  const enemies = [
    { id: 'reinforced', name: 'CARAPAÇA REFORÇADA', description: '+1 ponto de vida máximo para todos os inimigos.' },
    { id: 'overclocked', name: 'OVERCLOCK', description: 'Inimigos movem-se 15% mais rápido.' },
    { id: 'rapid-fire', name: 'TIRO ACELERADO', description: 'Inimigos atiram 18% mais rápido.' },
    { id: 'vampiric', name: 'PROTOCOLO VAMPÍRICO', description: 'Acertos curam o inimigo que disparou.' },
    { id: 'hunters', name: 'CAÇADORES', description: 'Inimigos detectam o protagonista de mais longe.' },
    { id: 'ballistic', name: 'MUNIÇÃO BALÍSTICA', description: 'Projéteis inimigos viajam 20% mais rápido.' }
  ];

  window.SANITY_BUFFS = { player, enemies };
})();
