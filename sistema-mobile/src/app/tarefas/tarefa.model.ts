export class Tarefa {
    public id: number;
    public titulo: string;
    public descricao: string;
    public status: number;
    public status_display: string;
    public etiqueta: number;
    public etiqueta_display: string;
    public projeto: number;
    public projeto_nome: string;
    public data_criacao: string;

    constructor() {
        this.id = 0;
        this.titulo = '';
        this.descricao = '';
        this.status = 1;
        this.status_display = '';
        this.etiqueta = 3;
        this.etiqueta_display = '';
        this.projeto = 0;
        this.projeto_nome = '';
        this.data_criacao = '';
    }
}