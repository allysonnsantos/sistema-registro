// Script principal da aplicação - Versão Profissional

class EducacensoApp {
    constructor() {
        this.currentTable = 'alunos';
        this.editingId = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.searchQuery = '';
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.loadTable('alunos');
        this.updateStats();
        this.populateEscolaSelect();
        this.initializeLoading();
    }

    bindEvents() {
        // Menu lateral
        document.querySelectorAll('.cadastro-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.currentTarget.getAttribute('data-target');
                this.loadTable(target);
                
                // Atualizar classe ativa
                document.querySelectorAll('.cadastro-item').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Botões principais
        document.getElementById('btn-add').addEventListener('click', () => this.openAddModal());
        document.getElementById('btn-cancel').addEventListener('click', () => this.closeFormModal());
        document.querySelector('.close').addEventListener('click', () => this.closeFormModal());
        document.getElementById('data-form').addEventListener('submit', (e) => this.saveData(e));
        document.getElementById('btn-export').addEventListener('click', () => this.exportData());
        document.getElementById('btn-filter').addEventListener('click', () => this.showFilters());

        // Pesquisa
        document.getElementById('search-input').addEventListener('input', 
            Utils.debounce((e) => {
                this.searchQuery = e.target.value;
                this.loadTable(this.currentTable);
            }, 300)
        );

        // Paginação
        document.getElementById('btn-prev').addEventListener('click', () => this.previousPage());
        document.getElementById('btn-next').addEventListener('click', () => this.nextPage());

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('form-modal')) {
                this.closeFormModal();
            }
        });

        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeFormModal();
            }
        });
    }

    initializeLoading() {
        // Simular carregamento
        setTimeout(() => {
            document.getElementById('loading').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                Utils.showToast('Sistema carregado com sucesso!', 'success');
            }, 500);
        }, 2000);
    }

    loadTable(tableType) {
        this.currentTable = tableType;
        this.currentPage = 1;
        
        this.updateUI();
        this.renderTable();
        this.updateBadges();
    }

    updateUI() {
        const titles = {
            alunos: { main: 'Alunos', subtitle: 'Gerencie os dados dos alunos do sistema educacional' },
            professores: { main: 'Professores', subtitle: 'Gerencie o corpo docente das instituições' },
            gestores: { main: 'Gestores', subtitle: 'Administre os gestores educacionais' },
            escolas: { main: 'Escolas', subtitle: 'Cadastre e gerencie as instituições de ensino' },
            tecnicos: { main: 'Técnicos', subtitle: 'Controle a equipe técnica do sistema' }
        };

        const title = titles[this.currentTable];
        document.getElementById('content-title').innerHTML = 
            `<i class="fas fa-${this.getTableIcon()}"></i>Cadastro de ${title.main}`;
        document.getElementById('content-subtitle').textContent = title.subtitle;
        document.getElementById('modal-title').innerHTML = 
            `<i class="fas fa-${this.getTableIcon()}"></i>Adicionar ${title.main}`;
    }

    getTableIcon() {
        const icons = {
            alunos: 'user-graduate',
            professores: 'chalkboard-teacher',
            gestores: 'user-tie',
            escolas: 'school',
            tecnicos: 'laptop-code'
        };
        return icons[this.currentTable];
    }

    renderTable() {
        const tableBody = document.getElementById('table-body');
        const data = dbManager.searchData(this.currentTable, this.searchQuery);
        
        // Paginação
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = data.slice(startIndex, endIndex);
        
        tableBody.innerHTML = '';

        if (paginatedData.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div style="padding: 3rem; text-align: center; color: var(--gray-500);">
                            <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                            <h3>Nenhum registro encontrado</h3>
                            <p>${this.searchQuery ? 'Tente ajustar os termos da pesquisa' : 'Adicione o primeiro registro clicando em "Adicionar Novo"'}</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        paginatedData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = this.getTableRowHTML(item);
            tableBody.appendChild(row);
        });

        this.updatePaginationInfo(data.length);
    }

    getTableRowHTML(item) {
        const statusClass = item.status === 'active' ? 'status-active' : 
                           item.status === 'inactive' ? 'status-inactive' : 'status-pending';
        const statusText = item.status === 'active' ? 'Ativo' : 
                          item.status === 'inactive' ? 'Inativo' : 'Pendente';

        return `
            <td>
                <input type="checkbox" class="row-checkbox" value="${item.id}">
            </td>
            <td><strong>#${item.id}</strong></td>
            <td>
                <div class="user-info-small">
                    <div class="user-avatar-sm">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="user-name">${item.nome}</div>
                        ${item.email ? `<div class="user-email">${item.email}</div>` : ''}
                    </div>
                </div>
            </td>
            <td>${Utils.formatDate(item.data_nascimento)}</td>
            <td>${Utils.formatCPF(item.cpf)}</td>
            <td>${dbManager.getEscolaName(item.escola)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="actions">
                <button class="btn btn-outline btn-sm" onclick="app.editData(${item.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="app.deleteData(${item.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    }

    updatePaginationInfo(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const showingCount = Math.min(this.itemsPerPage, totalItems - (this.currentPage - 1) * this.itemsPerPage);
        
        document.getElementById('showing-count').textContent = showingCount;
        document.getElementById('total-count').textContent = totalItems;
        document.querySelector('.pagination-info').textContent = `Página ${this.currentPage} de ${totalPages}`;
        
        document.getElementById('btn-prev').disabled = this.currentPage === 1;
        document.getElementById('btn-next').disabled = this.currentPage === totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTable();
        }
    }

    nextPage() {
        const data = dbManager.searchData(this.currentTable, this.searchQuery);
        const totalPages = Math.ceil(data.length / this.itemsPerPage);
        
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTable();
        }
    }

    openAddModal() {
        this.editingId = null;
        document.getElementById('data-form').reset();
        this.setupAdditionalFields();
        document.getElementById('form-modal').style.display = 'flex';
        
        // Animação de entrada
        setTimeout(() => {
            document.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 10);
    }

    closeFormModal() {
        const modal = document.getElementById('form-modal');
        modal.style.display = 'none';
        this.editingId = null;
    }

    setupAdditionalFields() {
        const additionalFields = document.getElementById('additional-fields');
        
        const fieldsConfig = {
            alunos: `
                <div class="form-section">
                    <h4><i class="fas fa-graduation-cap"></i> Dados Escolares</h4>
                    <div class="form-group">
                        <label for="matricula">
                            <i class="fas fa-id-badge"></i>
                            Matrícula *
                        </label>
                        <input type="text" id="matricula" class="form-control" required placeholder="Número da matrícula">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="serie">
                                <i class="fas fa-book"></i>
                                Série/Ano *
                            </label>
                            <select id="serie" class="form-control" required>
                                <option value="">Selecione</option>
                                <option value="1º Ano">1º Ano</option>
                                <option value="2º Ano">2º Ano</option>
                                <option value="3º Ano">3º Ano</option>
                                <option value="4º Ano">4º Ano</option>
                                <option value="5º Ano">5º Ano</option>
                                <option value="6º Ano">6º Ano</option>
                                <option value="7º Ano">7º Ano</option>
                                <option value="8º Ano">8º Ano</option>
                                <option value="9º Ano">9º Ano</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="turma">
                                <i class="fas fa-users"></i>
                                Turma
                            </label>
                            <input type="text" id="turma" class="form-control" placeholder="Ex: A, B, C">
                        </div>
                    </div>
                </div>
            `,
            professores: `
                <div class="form-section">
                    <h4><i class="fas fa-briefcase"></i> Dados Profissionais</h4>
                    <div class="form-group">
                        <label for="formacao">
                            <i class="fas fa-graduation-cap"></i>
                            Formação Acadêmica *
                        </label>
                        <select id="formacao" class="form-control" required>
                           