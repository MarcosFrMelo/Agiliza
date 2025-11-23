import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController, ToastController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Usuario } from '../login/usuario.model';
import { addIcons } from 'ionicons';
import { add, pencilOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.page.html',
  styleUrls: ['./tarefas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [Storage]
})
export class TarefasPage {

  public usuario: Usuario = new Usuario();
  public lista_tarefas: any[] = [];
  public projetoIdFiltro: number | null = null;
  public nomeProjetoFiltro: string = '';

  constructor(
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    public controle_alerta: AlertController,
    private router: Router,
    private ngZone: NgZone
  ) {
    addIcons({ add, pencilOutline, trashOutline, checkmarkCircleOutline, alertCircleOutline });

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.projetoIdFiltro = nav.extras.state['projeto_id'];
      this.nomeProjetoFiltro = nav.extras.state['projeto_nome'];
    }
  }

  async ionViewWillEnter() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      this.consultarTarefas(); 
    } else {
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  async consultarTarefas() {
    const loading = await this.controle_carregamento.create({ message: 'Carregando...', duration: 5000 });
    await loading.present();

    let urlApi = 'http://127.0.0.1:8000/tarefa/api/listar/';
    
    if (this.projetoIdFiltro) {
      urlApi += `?projeto_id=${this.projetoIdFiltro}`;
    }

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: urlApi
    };

    CapacitorHttp.get(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        this.ngZone.run(() => {
          if (resposta.status == 200) {
            this.lista_tarefas = resposta.data;
          } else {
            this.apresenta_mensagem(`Erro ao listar: ${resposta.status}`);
          }
        });
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        console.error(erro);
      });
  }

  novaTarefa() {
    this.router.navigate(['/tarefa-cadastro'], { 
      state: { projeto_pre_selecionado: this.projetoIdFiltro } 
    });
  }

  editar(tarefa: any) {
    this.router.navigate(['/tarefa-cadastro'], { state: { tarefa: tarefa } });
  }

  async confirmarExclusao(id: number) {
    const alert = await this.controle_alerta.create({
      header: 'Tem certeza?',
      message: 'Deseja excluir esta tarefa?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'confirm',
          handler: () => { this.excluirTarefa(id); }
        }
      ]
    });
    await alert.present();
  }

  async excluirTarefa(id: number) {
    const loading = await this.controle_carregamento.create({ message: 'Excluindo...' });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: `http://127.0.0.1:8000/tarefa/api/deletar/${id}/`
    };

    CapacitorHttp.delete(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        this.ngZone.run(() => {
          if (resposta.status == 204) {
            this.apresenta_mensagem('Tarefa excluída!');
            this.consultarTarefas(); 
          } else {
            this.apresenta_mensagem(`Erro ao excluir: ${resposta.status}`);
          }
        });
      })
      .catch(async () => {
        loading.dismiss();
        this.apresenta_mensagem('Erro ao tentar excluir.');
      });
  }

  async apresenta_mensagem(texto: string) {
    const mensagem = await this.controle_toast.create({
      message: texto,
      duration: 2000
    });
    mensagem.present();
  }
}