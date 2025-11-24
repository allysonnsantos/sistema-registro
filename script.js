// Script principal da aplicação

// Elementos DOM
const tableBody = document.getElementById('table-body');
const formModal = document.getElementById('form-modal');
const dataForm = document.getElementById('data-form');
const modalTitle = document.getElementById('modal-title');
const additionalFields = document.getElementById('additional-fields');
const btnAdd = document.getElementById('btn-add');
const btnCancel = document.getElementById('btn-cancel');
const closeModal = document.querySelector('.close');
const contentTitle = document.getElementById('content-title');
const sidebarLinks = document.querySelectorAll('.sidebar a');
const escolaSelect = document.getElementById('escola');
const countAlunos = document.getElementById('count-alunos');
const countProfessores = document.getElementById('count-professores');
const countEscolas = document.getElementById('count-escolas');

// Variáveis de controle
let currentTable = 'alunos';
let editingId = null;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadTable('alunos');
    updateStats();
    populateEscolaSelect();
    
    // Event Listeners
    btnAdd.addEventListener('click', openAddModal);
    btnCancel.addEventListener('click', closeFormModal);
    closeModal.addEventListener('click', closeFormModal);
    dataForm.addEventListener('submit', saveData);
    
    // Event listeners para os links do menu lateral
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            loadTable(target);
            
            // Atualizar classe ativa
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Fechar modal ao clicar fora dele
    window.addEventListener('click', function(e) {
        if (e.target === formModal) {
            closeFormModal();
        }
    });
});

// Carregar tabela de acordo com o tipo selecionado
function loadTable(tableType) {
    currentTable = tableType;
    contentTitle.textContent = `Cadastro de ${capitalizeFirstLetter(tableType)}`;
    modalTitle.textContent = `Adicionar ${capitalizeFirstLetter(tableType)}`;
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Preencher tabela com dados
    database[tableType].forEach(item => {
        const row = document.createElement('tr');
        
        // Colunas comuns
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nome}</td>
            <td>${formatDate(item.data_nascimento)}</td>
            <td>${formatCPF(item.cpf)}</td>
            <td>${getEscolaName(item.escola)}</td>
            <td class="actions">
                <button class="btn" onclick="editData(${item.id})">Editar</button>
                <button class="btn btn-danger" onclick="deleteData(${item.id})">Excluir</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    updateStats();
}

// Abrir modal para adicionar novo registro
function openAddModal() {
    editingId = null;
    dataForm.reset();
    setupAdditionalFields();
    formModal.style.display = 'flex';
}

// Fechar modal
function closeFormModal() {
    formModal.style.display = 'none';
    editingId = null;
}

// Configurar campos adicionais específicos para cada tipo
function setupAdditionalFields() {
    additionalFields.innerHTML = '';
    
    switch(currentTable) {
        case 'alunos':
            additionalFields.innerHTML = `
                <div class="form-group">
                    <label for="matricula">Matrícula</label>
                    <input type="text" id="matricula" class="form-control">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="serie">Série/Ano</label>
                        <input type="text" id="serie" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="turma">Turma</label>
                        <input type="text" id="turma" class="form-control">
                    </div>
                </div>
            `;
            break;
            
        case 'professores':
            additionalFields.innerHTML = `
                <div class="form-group">
                    <label for="formacao">Formação Acadêmica</label>
                    <select id="formacao" class="form-control">
                        <option value="">Selecione</option>
                        <option value="graduacao">Graduação</option>
                        <option value="especializacao">Especialização</option>
                        <option value="mestrado">Mestrado</option>
                        <option value="doutorado">Doutorado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="disciplina">Disciplina</label>
                    <input type="text" id="disciplina" class="form-control">
                </div>
            `;
            break;
            
        case 'gestores':
            additionalFields.innerHTML = `
                <div class="form-group">
                    <label for="cargo">Cargo</label>
                    <input type="text" id="cargo" class="form-control">
                </div>
                <div class="form-group">
                    <label for="formacao_gestor">Formação</label>
                    <input type="text" id="formacao_gestor" class="form-control">
                </div>
            `;
            break;
            
        case 'escolas':
            additionalFields.innerHTML = `
                <div class="form-group">
                    <label for="endereco">Endereço</label>
                    <input type="text" id="endereco" class="form-control">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="telefone_escola">Telefone</label>
                        <input type="text" id="telefone_escola" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="email_escola">E-mail</label>
                        <input type="email" id="email_escola" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label for="diretor">Diretor(a)</label>
                    <input type="text" id="diretor" class="form-control">
                </div>
            `;
            break;
            
        case 'tecnicos':
            additionalFields.innerHTML = `
                <div class="form-group">
                    <label for="area_atuacao">Área de Atuação</label>
                    <input type="text" id="area_atuacao" class="form-control">
                </div>
                <div class="form-group">
                    <label for="formacao_tecnico">Formação</label>
                    <input type="text" id="formacao_tecnico" class="form-control">
                </div>
            `;
            break;
    }
}

// Salvar dados (adicionar ou editar)
function saveData(e) {
    e.preventDefault();
    
    // Validações básicas
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const email = document.getElementById('email').value;
    
    if (!nome) {
        showNotification('Por favor, preencha o nome completo.', 'error');
        return;
    }
    
    if (cpf && !validateCPF(cpf.replace(/\D/g, ''))) {
        showNotification('CPF inválido.', 'error');
        return;
    }
    
    if (email && !validateEmail(email)) {
        showNotification('E-mail inválido.', 'error');
        return;
    }
    
    const formData = new FormData(dataForm);
    const data = {};
    
    // Coletar dados do formulário
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Coletar campos adicionais
    const additionalInputs = additionalFields.querySelectorAll('input, select');
    additionalInputs.forEach(input => {
        data[input.id] = input.value;
    });
    
    if (editingId) {
        // Editar registro existente
        const index = database[currentTable].findIndex(item => item.id === editingId);
        if (index !== -1) {
            database[currentTable][index] = { ...database[currentTable][index], ...data };
            showNotification(`${capitalizeFirstLetter(currentTable)} atualizado com sucesso!`);
        }
    } else {
        // Adicionar novo registro
        data.id = getNextId(currentTable);
        database[currentTable].push(data);
        showNotification(`${capitalizeFirstLetter(currentTable)} cadastrado com sucesso!`);
    }
    
    // Salvar no localStorage
    saveDatabase();
    
    // Recarregar tabela e fechar modal
    loadTable(currentTable);
    closeFormModal();
    updateStats();
}

// Editar dados
function editData(id) {
    const item = database[currentTable].find(item => item.id === id);
    if (!item) return;
    
    editingId = id;
    modalTitle.textContent = `Editar ${capitalizeFirstLetter(currentTable)}`;
    
    // Preencher formulário com dados existentes
    Object.keys(item).forEach(key => {
        const field = document.getElementById(key);
        if (field) {
            field.value = item[key];
        }
    });
    
    setupAdditionalFields();
    
    // Preencher campos adicionais
    setTimeout(() => {
        Object.keys(item).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = item[key];
            }
        });
    }, 0);
    
    formModal.style.display = 'flex';
}

// Excluir dados
function deleteData(id) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        database[currentTable] = database[currentTable].filter(item => item.id !== id);
        saveDatabase();
        loadTable(currentTable);
        updateStats();
        showNotification('Registro excluído com sucesso!');
    }
}

// Popular select de escolas
function populateEscolaSelect() {
    escolaSelect.innerHTML = '<option value="">Selecione uma escola</option>';
    database.escolas.forEach(escola => {
        const option = document.createElement('option');
        option.value = escola.id;
        option.textContent = escola.nome;
        escolaSelect.appendChild(option);
    });
}

// Atualizar estatísticas
function updateStats() {
    countAlunos.textContent = database.alunos.length;
    countProfessores.textContent = database.professores.length;
    countEscolas.textContent = database.escolas.length;
}