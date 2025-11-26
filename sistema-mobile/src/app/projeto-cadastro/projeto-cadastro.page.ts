import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-projeto-cadastro',
  templateUrl: './projeto-cadastro.page.html',
  styleUrls: ['./projeto-cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class ProjetoCadastroPage implements OnInit {

  projeto = {
    nome: '',
    descricao: ''
  };
  arquivoImagem: File | null = null;
  editando = false;
  idProjeto: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.idProjeto = this.route.snapshot.paramMap.get('id');
    
    if (this.idProjeto) {
      this.editando = true;
      this.carregarDados();
    }
  }

  carregarDados() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const url = `${environment.apiUrl}/projeto/api/editar/${this.idProjeto}/`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (dados) => {
        this.projeto.nome = dados.nome;
        this.projeto.descricao = dados.descricao;
      },
      error: () => this.exibirToast('Erro ao carregar projeto')
    });
  }

  onFileSelected(event: any) {
    this.arquivoImagem = event.target.files[0];
  }

  salvar() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const formData = new FormData();
    formData.append('nome', this.projeto.nome);
    formData.append('descricao', this.projeto.descricao);
    if (this.arquivoImagem) {
      formData.append('imagem_capa', this.arquivoImagem);
    }

    if (this.editando) {
      const url = `${environment.apiUrl}/projeto/api/editar/${this.idProjeto}/`;
      this.http.patch(url, formData, { headers }).subscribe({
        next: () => {
          this.exibirToast('Projeto atualizado!');
          this.router.navigate(['/projetos']);
        },
        error: (e) => {
          console.error(e);
          this.exibirToast('Erro ao atualizar.');
        }
      });

    } else {
      const url = `${environment.apiUrl}/projeto/api/cadastrar/`;
      this.http.post(url, formData, { headers }).subscribe({
        next: () => {
          this.exibirToast('Projeto criado!');
          this.router.navigate(['/projetos']);
        },
        error: (e) => {
          console.error(e);
          this.exibirToast('Erro ao criar.');
        }
      });
    }
  }

  async exibirToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000 });
    t.present();
  }
}