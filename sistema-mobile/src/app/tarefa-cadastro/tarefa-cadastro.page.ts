import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Usuario } from '../login/usuario.model';
import { Tarefa } from '../tarefas/tarefa.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tarefa-cadastro',
  templateUrl: './tarefa-cadastro.page.html',
  styleUrls: ['./tarefa-cadastro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [Storage]
})
export class TarefaCadastroPage implements OnInit {

  public usuario: Usuario = new Usuario();
  public tarefa: Tarefa = new Tarefa();
  public lista_projetos: any[] = [];
  public editando: boolean = false;

  constructor(
    public storage: Storage,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private router: Router,
    private ngZone: NgZone
  ) {
    // Recebe dados se for edição
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['tarefa']) {
      this.tarefa = nav.extras.state['tarefa'];
      this.editando = true;
    }
  }

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');
    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      this.carregarProjetos();
    } else {
      this.navCtrl.navigateRoot('/login');
    }
  }

  async carregarProjetos() {
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: 'http://127.0.0.1:8000/projeto/api/listar/'
    };

    try {
      const resposta = await CapacitorHttp.get(options);
      if (resposta.status == 200) {
        this.lista_projetos = resposta.data;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async salvar() {
    if (!this.tarefa.titulo || !this.tarefa.projeto) {
      this.apresenta_mensagem('Preencha título e projeto.');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Salvando...' });
    await loading.present();

    let url = 'http://127.0.0.1:8000/tarefa/api/cadastrar/';
    let metodo = 'post';

    if (this.editando) {
      url = `http://127.0.0.1:8000/tarefa/api/editar/${this.tarefa.id}/`;
      metodo = 'put';
    }

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: url,
      data: this.tarefa
    };

    try {
      const resposta = metodo === 'put' ? await CapacitorHttp.put(options) : await CapacitorHttp.post(options);
      
      loading.dismiss();
      this.ngZone.run(() => {
        if (resposta.status == 200 || resposta.status == 201) {
          this.apresenta_mensagem('Salvo com sucesso!');
          this.navCtrl.navigateBack('/tarefas');
        } else {
          this.apresenta_mensagem(`Erro ao salvar: ${resposta.status}`);
        }
      });
    } catch (error) {
      loading.dismiss();
      this.apresenta_mensagem('Erro na requisição.');
      console.error(error);
    }
  }

  async apresenta_mensagem(texto: string) {
    const toast = await this.toastCtrl.create({ message: texto, duration: 2000 });
    toast.present();
  }
}