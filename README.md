# Freelancer BC 🌊🍸

SaaS moderno e responsivo desenvolvido com **React**, **Tailwind CSS** e **Ícones Lucide**, conectando Empresas (bares, casas noturnas, restaurantes, eventos) e Freelancers (garçons, bartenders, seguranças, limpeza, recepção) em **Balneário Camboriú - SC**.

---

## 🚀 Como Executar

### Opção 1: Execução Imediata (Sem Instalar Nada)
Basta abrir o arquivo **`index.html`** no seu navegador (Google Chrome, Microsoft Edge, etc.):
1. Vá até a pasta do projeto: `c:\Users\user\Documents\antigravity\quirky-hubble\`
2. Dê um duplo clique no arquivo **`index.html`**
3. A aplicação carregará completa com React 18, Tailwind CSS e ícones, 100% funcional!

### Opção 2: Uso em Projeto React (Vite / Next.js / CRA)
O código React modular está disponível no arquivo **`App.jsx`**:
- Dependências: `react`, `lucide-react`, `tailwindcss`
- Basta importar e renderizar `<App />`.

---

## 🆕 Novas Funcionalidades e Correções Implementadas

1. **Edição Completa de Vagas & Capacidade**:
   - A empresa pode editar qualquer dado da vaga clicando no botão **Editar** (Ícone de lápis).
   - Gerencia a quantidade de **Vagas Totais Oferecidas** (`totalSpots`) e **Vagas já Preenchidas** (`filledSpots`).
   - Exibe barra de capacidade dinâmica e o cálculo de **Vagas Restantes**.

2. **Modelos Flexíveis de Remuneração da Vaga**:
   - 💵 **Diária Fixa**: Valor fechado em R$ (ex: R$ 250,00).
   - ⏱️ **Por Hora**: Valor por hora (ex: R$ 15,00/hora, R$ 20,00/hora) com estimativa de ganho total calculada automaticamente pelo turno (início e fim).
   - 📈 **Só Comissão**: Percentual sobre vendas (ex: 3%, 7%, 10% ou valor personalizado) para promotores, barmen comissionados e vendas de camarotes.
   - ⚡ **Fixo + Comissão**: Valor base diário somado a uma porcentagem de vendas (ex: R$ 150,00 + 5% sobre vendas).
   - **Pré-visualização do Anúncio**: A empresa vê exatamente o badge e o texto formatado antes de salvar.
   - **Filtros de Remuneração**: O freelancer pode filtrar as vagas por Diária, Por Hora ou Com Comissão.
   - **WhatsApp Inteligente**: O clique para o WhatsApp gera mensagem citando o formato exato da remuneração.

3. **Link Oficial de Pagamento (Checkout Seguro)**:
   - URL criptografada permanente: `https://pagamento.freelancerbc.com.br/fatura/PIX-BC-XXXXXX`
   - Botão para **Copiar Link Oficial** para pagar em outro aparelho ou repassar ao financeiro.
   - Validação por Webhook em tempo real e emissão de comprovante bancário com protocolo oficial e link de autenticidade eletrônica.

4. **Pausar e Despausar Anúncios**:
   - Botão **"Pausar" / "Despausar"** diretamente no card da vaga.
   - Vagas pausadas saem do feed dos freelancers.

5. **Visualização de Quem Chamou no WhatsApp & Perfil Completo**:
   - Registra o perfil de quem clicou no WhatsApp com Nome, Telefone, Profissão e CPF validado.

6. **Marcar Vaga como Preenchida com Pesquisa de Atribuição**:
   - Pergunta se a contratação aconteceu pelo Freelancer BC ou por fora.

---

## 🔑 Credenciais Pré-configuradas para Testes

| Perfil | E-mail | Senha | Status Inicial |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@freelancerbc.com.br` | `admin` | Super Admin |
| **Empresa (Taj BC)** | `contato@tajbc.com.br` | `123` | Empresa com trial ativo e vagas |
| **Freelancer (Lucas)**| `lucas.bar@gmail.com` | `123` | Bartender com CPF verificado |
| **Freelancer (Juliana)**| `juliana.eventos@hotmail.com` | `123` | Hostess pendente de aprovação |
