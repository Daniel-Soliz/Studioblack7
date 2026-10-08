# Studio Black7 — revisão de lançamento

Data: 8 de outubro de 2026. Site: https://daniel-soliz.github.io/Studioblack7/

## Resultado e limites

As correções abaixo foram implementadas no site e no servidor. Compilação, verificação de tipos, testes isolados dos pagamentos/autenticação e testes transacionais do banco passaram. O processamento automático de pagamentos respondeu HTTP 200 sem falhas na execução observada.

A conferência visual pública cobriu seleção de corte, horários, dados do cliente, opção de sinal ou valor integral, catálogo, carrinho, frete, checkout e orientação de instalação. Não foi criada uma compra fictícia nem realizado um novo pagamento bancário nesta revisão. A interface administrativa autenticada e a instalação em aparelhos físicos ainda precisam de validação operacional pelo responsável. Portanto, esta revisão não certifica um pagamento real de ponta a ponta nem compatibilidade com todos os celulares.

## Correções realizadas

| Área | Problema encontrado | Correção |
|---|---|---|
| Dados privados | Catálogo e pedidos compartilhavam acesso público de leitura e escrita | Acesso público limitado ao catálogo e informações comerciais; pedidos, gravações e uploads exigem autorização |
| Loja / Pix | Pedido e estoque dependiam de gravações do navegador | Pedido criado no servidor, estoque reservado em transação e validação do preço/frete no servidor |
| Repetição de cobrança | Nova tentativa podia iniciar uma cobrança diferente | Identificador persistido e criação idempotente dos pedidos da loja |
| Confirmação | Processamento dependia da permanência do cliente no site | Reconciliação automática no servidor a cada minuto, além das consultas da página e entrada para notificações do provedor |
| Cancelamento | Risco de estoque restaurado várias vezes ou apagar histórico pago | Cancelamento pendente restaura uma vez; pagamento aprovado não pode ser apagado pelo fluxo de pedidos |
| Administração | Alterações concorrentes podiam sobrescrever dados e a confirmação local confundia | Controle de versão nas gravações e aviso de salvamento/sucesso/erro real no painel |
| Sessão ADM | Sessões antigas permaneciam utilizáveis após mudanças de credenciais | Revogação no logout, versão de credenciais e limite de tentativas de login |
| Horários | Rodapé informava horários diferentes da agenda | Horários públicos derivados da configuração da agenda; acesso antigo de horários aponta para a agenda real |
| Atendimento | Duração nos cartões não correspondia à reserva de uma hora | Cartões informam a janela reservada de uma hora por cliente |
| Etapas | Avançar podia acionar a validação do formulário antes da hora | Botão de avanço separado do botão de envio |
| Entrega | Consulta do CEP era o único caminho para preencher o endereço | Rua, bairro, cidade, UF e complemento editáveis; conferência dos campos obrigatórios antes de gerar Pix |
| Aplicativo | Não havia instalação pelo site | Manifesto, ícones, serviço de cache seguro e orientação Android/iPhone |
| Privacidade | Faltava explicação visível sobre uso de dados | Página de privacidade com finalidade, fornecedores e contato |
| Desempenho | Código administrativo carregava junto da página pública | Rotas administrativas e agenda carregadas sob demanda; pacote principal reduzido em cerca de um terço |

## Conferências técnicas executadas

- Preços, quantidade, frete e estoque validados no servidor.
- Tentativa repetida de criação sem nova baixa de estoque.
- Falta de estoque bloqueia cobrança.
- Cancelamento repetido não duplica reposição.
- Notificação com status falso não confirma pagamento sem consulta ao Mercado Pago.
- Valor recebido diferente do esperado não confirma pedido.
- Pedido pago não pode ser cancelado pelo fluxo de pendências nem ter o pagamento Pix alterado manualmente.
- Token administrativo adulterado, expirado ou revogado é recusado.
- Dados privados não retornam para o papel público; escrita pública e execução pública dos comandos financeiros estão bloqueadas.
- Banco impede dois agendamentos sobrepostos para o mesmo profissional.
- Arquivos de instalação, escopo e dimensões dos ícones validados; requisições de pagamentos e dados privados não entram no cache offline.
- Dados temporários dos testes transacionais foram revertidos.

## Verificações necessárias antes de divulgar amplamente

1. Realizar um agendamento real: conferir valor integral ou sinal, pagar no banco, verificar confirmação no site e registro no ADM. Para sinal, conferir saldo restante. Uma consulta a cada dois segundos não garante aprovação bancária em dois segundos.
2. Realizar uma compra real de produto: conferir total com frete, pagamento aprovado, pedido no ADM e baixa única de estoque.
3. No ADM, alterar um horário, aguardar o aviso de salvamento no servidor, sair e entrar novamente e confirmar a persistência. Abrir relatório mensal e baixar o PDF para conferir totais e apresentação.
4. Instalar em Android e iPhone reais. Android utiliza a confirmação do navegador quando disponível. No iPhone, abrir no Safari, Compartilhar e Adicionar à Tela de Início. Instalação gratuita sem cadastro; sistema operacional exige confirmação. Não é publicação na App Store ou Google Play.
5. Conferir preços, estoque físico, endereço de retirada e possibilidade real de atender cada serviço na janela de uma hora.

## Pendências comerciais identificadas

Existem 110 produtos ativos no catálogo. Três estão sem preço definido e ficam para consulta, sem compra Pix:

- Esponja Nudred Dompel para cabelo afro.
- Máquina de cortar cabelo Mondial Hair Stylo CR-02.
- Máquina de cortar cabelo Kemei KM-1990 sem fio.

O responsável deve definir preços e conferir a disponibilidade física. Os estoques não foram reiniciados nesta revisão para preservar as movimentações existentes. Descrições genéricas e categorias de alguns cosméticos também merecem revisão comercial.

## Próximas melhorias recomendadas

| Prioridade | Melhoria | Situação |
|---|---|---|
| Alta | Configurar notificações de pedidos no Mercado Pago para o endpoint de pagamento | Entrada implementada; configuração no painel do provedor não foi validada nesta revisão |
| Alta | Política operacional de cancelamento e reembolso | Cancelar atendimento/pedido pago não devolve o dinheiro automaticamente |
| Alta | Contas individuais e permissões para a equipe | Acesso administrativo compartilhado existente; separação por pessoa e cargo ainda não implementada |
| Média | Lembrete automático dez minutos antes com site fechado | Lembrete na página/calendário existente; push ou WhatsApp automático ainda não implementado |
| Média | Recuperar agendamento em outro aparelho | Pendências do cliente são recuperadas no navegador/dispositivo usado; recuperação entre aparelhos precisa de identificação segura |
| Média | Custos, taxas e lucro líquido | Relatório exibe faturamento recebido; lucro líquido exige custos e taxas cadastrados |
| Média | Otimização das imagens e descrição comercial | Algumas imagens são grandes e o catálogo contém textos genéricos |
| Média | Monitoramento, alertas de falhas e teste de restauração de backup | Recomendado para operação contínua; não concluído nesta revisão |

## Orientação de operação

Depois da atualização, atualizar a página e entrar novamente no ADM. Aguardar a confirmação de salvamento no servidor antes de fechar uma edição. Para consulta financeira, usar pagamento aprovado como evidência; não marcar um Pix como pago apenas por relato ou comprovante. Cancelamento de um pedido pago é uma situação distinta de reembolso e mantém o faturamento até a devolução efetiva ser tratada.
