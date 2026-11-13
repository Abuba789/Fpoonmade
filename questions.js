(() => {
  'use strict';
  // correctAnswer is a zero-based index into options. Keep IDs stable when adding questions.
  const rows = [
    ['osi','Modelo OSI','facil','Quantas camadas possui o modelo OSI?',['4.','5.','7.','8.'],2,'O modelo OSI organiza a comunicação em sete camadas, da Física à Aplicação.'],
    ['ipv4','IPv4','facil','Quantos bits possui um endereço IPv4?',['16 bits.','32 bits.','64 bits.','128 bits.'],1,'Um endereço IPv4 possui 32 bits, normalmente representados por quatro octetos decimais.'],
    ['dns','DNS','media','Qual é a principal função do DNS?',['Criptografar arquivos.','Traduzir nomes de domínio em endereços IP.','Distribuir endereços MAC.','Controlar a velocidade da internet.'],1,'O DNS consulta registros como A e AAAA para resolver nomes em endereços IPv4 e IPv6.'],
    ['dhcp','DHCP','media','Qual é a função principal do protocolo DHCP?',['Atribuir automaticamente configurações de rede aos dispositivos.','Bloquear conexões externas.','Converter endereços IPv4 em IPv6.','Detectar vírus na rede.'],0,'O DHCP fornece configurações como endereço IP, máscara, gateway e servidores DNS.'],
    ['tcp','TCP e UDP','media','Qual característica diferencia o TCP do UDP?',['TCP não utiliza portas.','TCP oferece entrega confiável e controle de transmissão.','TCP funciona exclusivamente em redes sem fio.','TCP não permite comunicação entre computadores.'],1,'O TCP usa confirmações, retransmissões e controle de fluxo para entregar um fluxo de bytes ordenado e confiável.'],
    ['switch','Switches','facil','Qual é a principal função de um switch de camada 2 em uma rede local?',['Encaminhar quadros com base nos endereços MAC.','Distribuir endereços IP automaticamente.','Converter nomes de domínio em IP.','Criptografar toda a comunicação da internet.'],0,'O switch aprende os endereços MAC de origem e consulta sua tabela para encaminhar quadros às portas adequadas.'],
    ['router','Roteadores','facil','Qual é a principal função de um roteador?',['Armazenar arquivos compartilhados.','Encaminhar pacotes entre redes diferentes.','Substituir o servidor DNS.','Identificar exclusivamente endereços MAC.'],1,'O roteador consulta rotas e usa o endereço IP de destino para encaminhar pacotes entre redes.'],
    ['https','HTTP e HTTPS','media','Qual é a principal diferença entre HTTP e HTTPS?',['HTTPS utiliza TLS para proteger a comunicação.','HTTP funciona apenas em redes locais.','HTTPS não utiliza portas.','HTTP é exclusivo para dispositivos móveis.'],0,'O HTTPS protege a comunicação HTTP com TLS, oferecendo criptografia, integridade e autenticação do servidor.'],
    ['mac','Endereços MAC','facil','O que representa um endereço MAC?',['Um endereço lógico utilizado para identificar uma rede IP.','Um endereço de enlace associado a uma interface de rede.','Uma senha de acesso ao roteador.','Um endereço de servidor DNS.'],1,'O endereço MAC identifica uma interface na camada de enlace; ele pode ser configurado ou aleatorizado.'],
    ['ipv6','IPv6','facil','Quantos bits possui um endereço IPv6?',['32 bits.','48 bits.','64 bits.','128 bits.'],3,'Endereços IPv6 possuem 128 bits e são normalmente escritos em grupos hexadecimais.'],
    ['arp','ARP','media','Qual é a função do protocolo ARP em redes IPv4?',['Resolver endereços IPv4 em endereços MAC na rede local.','Distribuir endereços IPv6.','Criptografar pacotes TCP.','Verificar a velocidade da conexão.'],0,'O ARP descobre o endereço MAC correspondente a um IPv4 no enlace local, incluindo o do gateway.'],
    ['nat','NAT','media','Qual é a principal função do NAT?',['Traduzir endereços IP, permitindo, por exemplo, que vários dispositivos compartilhem um endereço IPv4 público.','Converter endereços MAC em nomes de domínio.','Aumentar fisicamente a velocidade do cabo.','Substituir o protocolo DHCP.'],0,'O NAT traduz endereços IP. Com tradução de portas (NAPT/PAT), vários dispositivos podem compartilhar um IPv4 público.'],
    ['mask24','Máscaras de sub-rede','media','Qual máscara corresponde ao prefixo /24 em IPv4?',['255.255.0.0.','255.255.255.0.','255.0.0.0.','255.255.255.255.'],1,'O prefixo /24 tem 24 bits de rede iguais a 1: 255.255.255.0.'],
    ['ping','Diagnóstico de rede','facil','Qual comando testa a conectividade com outro dispositivo utilizando mensagens ICMP Echo?',['mkdir.','ping.','format.','copy.'],1,'O ping envia ICMP Echo Request e aguarda Echo Reply. Filtros de ICMP podem impedir respostas mesmo com o destino ativo.'],
    ['udp','TCP e UDP','media','Qual das características abaixo pertence ao protocolo UDP?',['Estabelece obrigatoriamente uma conexão antes de transmitir.','Garante a entrega de todos os pacotes.','Não possui garantia de entrega ou ordenação dos dados.','Funciona somente em redes cabeadas.'],2,'O UDP envia datagramas sem estabelecer conexão e não fornece retransmissão ou ordenação.'],
    ['ap','Pontos de acesso','facil','Qual é a função típica de um Access Point em modo bridge?',['Conectar dispositivos Wi-Fi à rede local cabeada.','Resolver nomes DNS obrigatoriamente.','Converter qualquer cabo em fibra óptica.','Substituir o endereçamento IP por senhas.'],0,'Um ponto de acesso em bridge conecta clientes sem fio ao mesmo domínio de enlace da rede cabeada.'],
    ['star','Topologias de rede','facil','Em qual topologia cada dispositivo possui uma conexão com um equipamento central?',['Anel.','Barramento.','Estrela.','Malha completa.'],2,'Na topologia estrela, os dispositivos se conectam a um ponto central, como um switch.'],
    ['ethernet','Redes cabeadas e sem fio','facil','Qual combinação associa corretamente tecnologias a seus meios de acesso?',['Ethernet por par trançado: cabo; Wi-Fi: ondas de rádio.','Ethernet por par trançado: rádio; Wi-Fi: cabo coaxial.','Ambas exigem fibra óptica.','Ambas exigem cabo de par trançado até cada cliente.'],0,'Ethernet por par trançado usa cabos de cobre; Wi-Fi transmite por rádio.'],
    ['tcpip','Modelo TCP/IP','media','No modelo TCP/IP de quatro camadas, em qual camada atua o protocolo IP?',['Aplicação.','Transporte.','Internet.','Acesso à rede.'],2,'A camada Internet contém o IP e trata do endereçamento e encaminhamento de pacotes.'],
    ['osi-routing','Modelo OSI','facil','Qual camada OSI é responsável pelo roteamento entre redes diferentes?',['Aplicação.','Transporte.','Rede.','Física.'],2,'A camada de Rede (camada 3) realiza endereçamento lógico e encaminhamento de pacotes.'],
    ['subnet26','Cálculo de sub-redes','dificil','Em uma sub-rede IPv4 /26 convencional, quantos endereços podem ser atribuídos a hosts, excluindo rede e broadcast?',['62.','64.','126.','30.'],0,'Restam 6 bits de host: 2⁶ = 64 endereços. Excluindo rede e broadcast, restam 62 hosts.'],
    ['subnet27','Cálculo de sub-redes','dificil','Qual é o endereço de rede do host 192.168.10.77/27?',['192.168.10.0.','192.168.10.64.','192.168.10.77.','192.168.10.96.'],1,'Um /27 cria blocos de 32 endereços. O endereço 77 pertence ao bloco de 64 a 95.'],
    ['broadcast','Cálculo de sub-redes','dificil','Qual é o broadcast da sub-rede 192.168.1.128/26?',['192.168.1.129.','192.168.1.190.','192.168.1.191.','192.168.1.255.'],2,'O bloco /26 começa em 128 e termina em 191; o último endereço é o broadcast.'],
    ['dns-failure','Diagnóstico de rede','dificil','Um cliente acessa um serviço pelo IP, mas a consulta de seu nome com nslookup falha. Qual serviço deve ser investigado primeiro?',['DHCP, por sempre impedir acesso por IP.','DNS e sua configuração no cliente.','ARP, por traduzir nomes de domínio.','NAT, por substituir todas as consultas DNS.'],1,'Acesso por IP com falha de resolução do nome sugere investigar o DNS configurado e os registros do domínio.'],
    ['gateway','Configuração de redes','dificil','Um host 192.168.1.10/24 precisa de um gateway diretamente alcançável nessa sub-rede. Qual endereço é adequado?',['192.168.2.1.','192.168.1.0.','192.168.1.255.','192.168.1.1.'],3,'192.168.1.1 é um endereço de host na mesma /24. O endereço .0 é a rede e .255 é o broadcast.'],
    ['firewall','Segurança de redes','dificil','Qual regra de firewall segue o princípio do menor privilégio para um servidor web HTTPS público?',['Permitir todas as portas de entrada.','Desativar a filtragem de entrada.','Permitir a porta do serviço HTTPS necessário e negar entradas não autorizadas.','Liberar administração remota para qualquer origem.'],2,'O menor privilégio permite apenas o tráfego necessário, reduzindo a superfície exposta do servidor.'],
    ['wifi-security','Segurança de redes sem fio','dificil','Qual mecanismo do WPA3-Personal substitui o método de autenticação PSK do WPA2-Personal?',['WEP.','SAE.','ARP.','HTTP.'],1,'O SAE (Simultaneous Authentication of Equals) autentica usando senha e dificulta ataques de dicionário offline contra a troca capturada.'],
    ['route','Roteamento','dificil','Uma tabela possui rotas 10.0.0.0/8 e 10.1.0.0/16. Qual é escolhida para 10.1.2.3 pelo critério de maior prefixo?',['10.0.0.0/8.','As duas rotas sempre são usadas igualmente.','10.1.0.0/16.','Nenhuma, pois o destino é privado.'],2,'O encaminhamento escolhe a rota compatível mais específica: /16 tem um prefixo maior que /8.'],
    ['tracert','Diagnóstico de rede','dificil','Qual comando do Windows identifica saltos até um destino variando o TTL das sondas?',['ipconfig.','nslookup.','arp.','tracert.'],3,'O tracert aumenta o TTL e usa respostas ICMP para identificar saltos; alguns roteadores podem não responder.'],
    ['ospf','Protocolos de roteamento','dificil','Qual protocolo de roteamento interno utiliza estado de enlace e o algoritmo SPF?',['DHCP.','OSPF.','DNS.','ARP.'],1,'O OSPF distribui informações de estado de enlace e calcula caminhos com o algoritmo SPF de Dijkstra.']
  ];
  window.SANITY_QUESTIONS = rows.map(([id, category, difficulty, question, options, correctAnswer, explanation]) =>
    Object.freeze({ id, category, difficulty, question, options: Object.freeze(options), correctAnswer, explanation }));

  function isValid(q) {
    return q && typeof q.id === 'string' && q.id.trim() &&
      ['facil', 'media', 'dificil'].includes(q.difficulty) &&
      ['category', 'question', 'explanation'].every(key => typeof q[key] === 'string' && q[key].trim()) &&
      Array.isArray(q.options) && q.options.length === 4 &&
      q.options.every(option => typeof option === 'string' && option.trim()) &&
      new Set(q.options.map(option => option.trim().toLowerCase())).size === 4 &&
      Number.isInteger(q.correctAnswer) && q.correctAnswer >= 0 && q.correctAnswer < 4;
  }
  const levelFor = streak => streak >= 4 ? 'dificil' : streak >= 2 ? 'media' : 'facil';
  function select(bank, streak, seen, lastId, random = Math.random) {
    const ids = new Set();
    const pool = bank.filter(q => {
      if (!isValid(q) || ids.has(q.id)) return false;
      ids.add(q.id);
      return q.difficulty === levelFor(streak);
    });
    if (!pool.length) return null;
    let candidates = pool.filter(q => !seen.includes(q.id));
    // Restart only the exhausted difficulty: preserve progress in the other tiers.
    if (!candidates.length) {
      const tierIds = new Set(pool.map(q => q.id));
      const retained = seen.filter(id => !tierIds.has(id));
      seen.splice(0, seen.length, ...retained);
      candidates = pool;
    }
    if (candidates.length > 1) candidates = candidates.filter(q => q.id !== lastId);
    const selected = candidates[Math.floor(random() * candidates.length)];
    seen.push(selected.id);
    return selected;
  }
  window.SanityQuizBank = { isValid, levelFor, select };
})();
