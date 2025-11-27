import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { ellipsisVertical, add, checkmarkDoneCircleOutline, create, trash, close } from 'ionicons/icons';

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.page.html',
  styleUrls: ['./tarefas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, HttpClientModule]
})
export class TarefasPage implements OnInit {
  projetoId: string | null = null;
  tarefas: any[] = [];
  segmento = '1';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    addIcons({ ellipsisVertical, add, checkmarkDoneCircleOutline, create, trash, close });
  }

  ngOnInit() {
    this.projetoId = this.route.snapshot.paramMap.get('id');
  }

  ionViewWillEnter() {
    this.carregarTarefas();
  }

  carregarTarefas() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const url = `${environment.apiUrl}/tarefa/api/listar/?projeto_id=${this.projetoId}`;

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (dados) => this.tarefas = dados,
      error: (e) => console.error(e)
    });
  }

  get tarefasFiltradas() {
    return this.tarefas.filter(t => t.status == this.segmento);
  }

  getCorPrioridade(etiqueta: number) {
    switch(etiqueta) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'primary';
      case 4: return 'medium';
      case 5: return 'light';
      default: return 'medium';
    }
  }

  getNomePrioridade(etiqueta: number) {
    const nomes = ['', 'Urgente', 'Importante', 'Normal', 'Baixa', 'Opcional'];
    return nomes[etiqueta] || 'Normal';
  }

  async abrirOpcoes(tarefa: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: tarefa.titulo,
      buttons: [
        {
          text: 'Editar',
          icon: 'create',
          handler: () => {
            this.router.navigate(['/tarefa-cadastro'], { 
              queryParams: { tarefaId: tarefa.id } 
            });
          }
        },
        {
          text: 'Excluir',
          role: 'destructive',
          icon: 'trash',
          handler: () => this.deletarTarefa(tarefa.id)
        },
        { text: 'Cancelar', role: 'cancel', icon: 'close' }
      ]
    });
    await actionSheet.present();
  }

  deletarTarefa(id: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': 'Token ' + token });
    const url = `${environment.apiUrl}/tarefa/api/deletar/${id}/`;

    this.http.delete(url, { headers }).subscribe(() => {
      this.carregarTarefas();
      this.toastCtrl.create({ message: 'Tarefa excluída', duration: 2000 }).then(t => t.present());
    });
  }

  novaTarefa() {
    this.router.navigate(['/tarefa-cadastro'], { 
      queryParams: { projetoId: this.projetoId } 
    });
  }
}