// Gerenciamento do banco de dados

let database = {
    alunos: [],
    professores: [],
    gestores: [],
    escolas: [],
    tecnicos: []
};

// Carregar dados do localStorage se existirem
function loadDatabase() {
    const savedData = localStorage.getItem('educacenso2025');
    if (savedData) {
        database = JSON.parse(savedData);
    }
    addSampleData(); // Adiciona dados de exemplo se estiver vazio
}

// Salvar dados no localStorage
function saveDatabase() {
    localStorage.setItem('educacenso2025', JSON.stringify(database));
}

// Adicionar dados de exemplo
function addSampleData() {
    if (database.escolas.length === 0) {
        database.escolas = [
            { 
                id: 1, 
                nome: 'Escola Municipal João Paulo II', 
                endereco: 'Rua das Flores, 123', 
                telefone_escola: '(11) 1234-5678', 
                email_escola: 'contato@joaopauloii.edu.br', 
                diretor: 'Maria Silva' 
            },
            { 
                id: 2, 
                nome: 'Colégio Estadual Dom Pedro I', 
                endereco: 'Av. Principal, 456', 
                telefone_escola: '(11) 2345-6789', 
                email_escola: 'secretaria@dompedroi.edu.br', 
                diretor: 'José Santos' 
            }
        ];
    }
    
    if (database.alunos.length === 0) {
        database.alunos = [
            { 
                id: 1, 
                nome: 'Ana Carolina Souza', 
                data_nascimento: '2010-05-15', 
                cpf: '123.456.789-00', 
                rg: '12.345.678-9', 
                email: 'ana.souza@email.com', 
                telefone: '(11) 98765-4321', 
                escola: 1, 
                matricula: '2024001', 
                serie: '8º Ano', 
                turma: 'A' 
            },
            { 
                id: 2, 
                nome: 'Bruno Oliveira Mendes', 
                data_nascimento: '2009-08-22', 
                cpf: '234.567.890-11', 
                rg: '23.456.789-0', 
                email: 'bruno.mendes@email.com', 
                telefone: '(11) 97654-3210', 
                escola: 2, 
                matricula: '2024002', 
                serie: '9º Ano', 
                turma: 'B' 
            }
        ];
    }
    
    if (database.professores.length === 0) {
        database.professores = [
            { 
                id: 1, 
                nome: 'Carlos Eduardo Lima', 
                data_nascimento: '1985-03-10', 
                cpf: '345.678.901-22', 
                rg: '34.567.890-1', 
                email: 'carlos.lima@email.com', 
                telefone: '(11) 96543-2109', 
                escola: 1, 
                formacao: 'mestrado', 
                disciplina: 'Matemática' 
            },
            { 
                id: 2, 
                nome: 'Fernanda Rodrigues Alves', 
                data_nascimento: '1979-11-28', 
                cpf: '456.789.012-33', 
                rg: '45.678.901-2', 
                email: 'fernanda.alves@email.com', 
                telefone: '(11) 95432-1098', 
                escola: 2, 
                formacao: 'doutorado', 
                disciplina: 'Português' 
            }
        ];
    }
    
    if (database.gestores.length === 0) {
        database.gestores = [
            { 
                id: 1, 
                nome: 'Roberto Costa Silva', 
                data_nascimento: '1975-02-14', 
                cpf: '567.890.123-44', 
                rg: '56.789.012-3', 
                email: 'roberto.silva@email.com', 
                telefone: '(11) 94321-0987', 
                escola: 1, 
                cargo: 'Diretor', 
                formacao_gestor: 'Pedagogia' 
            }
        ];
    }
    
    if (database.tecnicos.length === 0) {
        database.tecnicos = [
            { 
                id: 1, 
                nome: 'Patrícia Santos Oliveira', 
                data_nascimento: '1988-07-30', 
                cpf: '678.901.234-55', 
                rg: '67.890.123-4', 
                email: 'patricia.oliveira@email.com', 
                telefone: '(11) 93210-9876', 
                escola: 1, 
                area_atuacao: 'Tecnologia Educacional', 
                formacao_tecnico: 'Análise de Sistemas' 
            }
        ];
    }
    
    saveDatabase();
}

// Obter próximo ID para uma tabela
function getNextId(tableType) {
    if (database[tableType].length === 0) return 1;
    return Math.max(...database[tableType].map(item => item.id)) + 1;
}

// Obter escola pelo ID
function getEscolaById(id) {
    return database.escolas.find(escola => escola.id == id);
}

// Obter nome da escola pelo ID
function getEscolaName(id) {
    const escola = getEscolaById(id);
    return escola ? escola.nome : 'N/A';
}

// Carregar dados iniciais
loadDatabase();