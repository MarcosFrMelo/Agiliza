import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-tarefa-cadastro',
  templateUrl: './tarefa-cadastro.page.html',
  styleUrls: ['./tarefa-cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class TarefaCadastroPage implements OnInit {

  tarefa = {
    titulo: '',
    descricao: '',
    status: 1,
    etiqueta: 3,
    projeto: null
  };
  projetoId: any = null;
  tarefaId: any = null;
  editando = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController
  ) { 
    addIcons({ arrowBack });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.projetoId = params['projetoId'];
      this.tarefaId = params['tarefaId'];

      if (this.tarefaId) {
        this.editando = true;
        this.carregarTarefa();
      } else {
        this.tarefa.projeto = this.projetoId;
      }
    });
  }

  voltar() {
    if (this.projetoId) {
        this.router.navigate(['/tarefas', this.projetoId]);
    } else if (this.tarefa.projeto) {
        this.router.navigate(['/tarefas', this.tarefa.projeto]);
    } else {
        window.history.back();
    }
  }

  carregarTarefa() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const url = `${environment.apiUrl}/tarefa/api/editar/${this.tarefaId}/`;

    this.http.get<any>(url, { headers }).subscribe({
      next: (dados) => {
        this.tarefa = dados;
        this.projetoId = dados.projeto; 
      },
      error: () => this.exibirToast('Erro ao carregar tarefa')
    });
  }

  salvar() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });

    if (this.editando) {
      const url = `${environment.apiUrl}/tarefa/api/editar/${this.tarefaId}/`;
      this.http.patch(url, this.tarefa, { headers }).subscribe({
        next: () => this.finalizar('Tarefa atualizada!'),
        error: () => this.exibirToast('Erro ao atualizar')
      });
    } else {
      const url = `${environment.apiUrl}/tarefa/api/cadastrar/`;
      this.http.post(url, this.tarefa, { headers }).subscribe({
        next: () => this.finalizar('Tarefa criada!'),
        error: () => this.exibirToast('Erro ao criar')
      });
    }
  }

  finalizar(msg: string) {
    this.exibirToast(msg);
    this.voltar();
  }

  async exibirToast(msg: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000 });
    t.present();
  }
}