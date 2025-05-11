const produtosGrid = document.getElementById('produtos-grid');
const carrinhoLista = document.getElementById('carrinho-lista');
const carrinhoTotal = document.getElementById('carrinho-total');
const verCarrinhoBtn = document.getElementById('ver-carrinho');
const carrinhoElement = document.getElementById('carrinho');
const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
const finalizarCompraBtn = document.getElementById('finalizar-compra');
const formEntrega = document.getElementById('form-entrega');
const formDadosEntrega = document.getElementById('form-dados-entrega');

let carrinho = [];
let produtosData = [];
let quantidadeItens = {};

function adicionarAoCarrinho(nome, preco, imagem) {
    if (quantidadeItens[nome]) {
        quantidadeItens[nome]++;
    } else {
        quantidadeItens[nome] = 1;
    }
    const itemNoCarrinho = carrinho.find(item => item.nome === nome);
    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade = quantidadeItens[nome];
    } else {
        carrinho.push({ nome, preco, imagem, quantidade: quantidadeItens[nome] });
    }
    atualizarCarrinho();
    exibirMensagem(`Produto "${nome}" adicionado ao carrinho!`);
}

function atualizarCarrinho() {
    carrinhoLista.innerHTML = '';
    let total = 0;

    if (carrinho.length === 0) {
        carrinhoLista.innerHTML = '<li class="carrinho-vazio">Carrinho Vazio</li>';
        carrinhoTotal.textContent = 'Total: R$ 0,00';
        finalizarCompraBtn.disabled = true;
    } else {
        carrinho.forEach(item => {
            const quantidadeInputId = `quantidade-${item.nome}`;
            const li = document.createElement('li');
            li.classList.add('carrinho-lista-item');
            li.innerHTML = `
                <img src="${item.imagem}" alt="${item.nome}">
                <span>${item.nome}</span>
                <div class="preco-quantidade">
                    <span>R$ ${item.preco.toFixed(2)}</span>
                    <input type="number" id="${quantidadeInputId}" class="quantidade-input" value="${item.quantidade}" min="1">
                    <button class="remover-item" data-nome="${item.nome}">Remover</button>
                </div>
            `;
            carrinhoLista.appendChild(li);

            total += item.preco * item.quantidade;
        });
        carrinhoTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
        finalizarCompraBtn.disabled = false;
    }
}

function exibirMensagem(mensagem) {
    mensagemProduto.textContent = mensagem;
    mensagemProduto.classList.add('fadeIn');
    setTimeout(() => {
        mensagemProduto.classList.remove('fadeIn');
        mensagemProduto.classList.add('fadeOut');
        setTimeout(() => {
            mensagemProduto.textContent = '';
            mensagemProduto.classList.remove('fadeOut');
        }, 500);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('produtos.json')
        .then(response => response.json())
        .then(data => {
            produtosData = data;
            carregarProdutos();
        })
        .catch(error => console.error('Erro ao obter produtos:', error));


    verCarrinhoBtn.addEventListener('click', () => {
        carrinhoElement.classList.add('ativo');
        document.body.style.overflow = 'hidden';
    });

    fecharCarrinhoBtn.addEventListener('click', () => {
        carrinhoElement.classList.remove('ativo');
        document.body.style.overflow = '';
    });

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('remover-item')) {
            const nomeProduto = event.target.dataset.nome;
            carrinho = carrinho.filter(item => item.nome !== nomeProduto);
            delete quantidadeItens[nomeProduto];
            atualizarCarrinho();
            exibirMensagem(`Produto "${nomeProduto}" removido do carrinho!`);
        }
    });

    document.addEventListener('change', (event) => {
        if (event.target.classList.contains('quantidade-input')) {
            const nomeProduto = event.target.closest('li').querySelector('span').textContent;
            quantidadeItens[nomeProduto] = parseInt(event.target.value);
            const itemNoCarrinho = carrinho.find(item => item.nome === nomeProduto);
             if (itemNoCarrinho) {
                itemNoCarrinho.quantidade = quantidadeItens[nomeProduto];
             }
            atualizarCarrinho();
        }
    });

    formDadosEntrega.addEventListener('submit', (event) => {
        event.preventDefault();

        const nome = document.getElementById('nome').value;
        const endereco = document.getElementById('endereco').value;
        const cep = document.getElementById('cep').value;

        let mensagemWhatsApp = "Olá, gostaria de fazer um pedido:\n\n";
        let totalPedido = 0;

        carrinho.forEach(item => {
            mensagemWhatsApp += `* ${item.nome} - R$ ${item.preco.toFixed(2)} x ${item.quantidade}\n`;
            totalPedido += item.preco * item.quantidade;
        });

        mensagemWhatsApp += `\n*Total do Pedido: R$ ${totalPedido.toFixed(2)}*\n\n`;
        mensagemWhatsApp += `Nome: ${nome}\nEndereço: ${endereco}\nCEP: ${cep}\n\n`;
        mensagemWhatsApp += "Por favor, confirme seu pedido e informe a forma de pagamento.";

        const numeroWhatsApp = "+5543998403039";
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`;
        window.open(urlWhatsApp, '_blank');

        carrinho = [];
        quantidadeItens = {};
        atualizarCarrinho();
        carrinhoElement.classList.remove('ativo');
        document.body.style.overflow = '';
        exibirMensagem('Pedido enviado com sucesso! Entraremos em contato.');
        formDadosEntrega.reset();
    });
});

function carregarProdutos() {
    produtosGrid.innerHTML = '';
    produtosData.forEach(produto => {
        const produtoCard = document.createElement('div');
        produtoCard.classList.add('produto-card');
        produtoCard.innerHTML = `
            <img src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>
            <p>R$ ${produto.preco.toFixed(2)}</p>
            <button onclick="adicionarAoCarrinho('${produto.nome}', ${produto.preco}, '${produto.imagem}')">Adicionar ao Carrinho</button>
        `;
        produtosGrid.appendChild(produtoCard);
    });
}