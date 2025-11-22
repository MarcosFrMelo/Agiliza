import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController, ToastController, AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Usuario } from '../login/usuario.model';
import { addIcons } from 'ionicons';
import { add, pencilOutline, trashOutline, folderOpenOutline, logOutOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.page.html',
  styleUrls: ['./projetos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  providers: [Storage]
})
export class ProjetosPage implements OnInit {

  public usuario: Usuario = new Usuario();
  public lista_projetos: any[] = [];

  constructor(
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    public controle_alerta: AlertController,
    private router: Router
  ) {
    addIcons({ add, pencilOutline, trashOutline, folderOpenOutline, logOutOutline });
  }

  async ngOnInit() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
    } else {
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  ionViewWillEnter() {
    if (this.usuario.token) {
      this.consultarProjetos();
    }
  }

  async consultarProjetos() {
    const loading = await this.controle_carregamento.create({ message: 'Carregando...', duration: 60000 });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: 'http://127.0.0.1:8000/projeto/api/listar/'
    };

    CapacitorHttp.get(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        if (resposta.status == 200) {
          this.lista_projetos = resposta.data;
        } else {
          this.apresenta_mensagem(`Erro ao listar: ${resposta.status}`);
          if (resposta.status == 401) this.logout();
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        console.error(erro);
        this.apresenta_mensagem('Erro de conexão');
      });
  }

  novoProjeto() {
    this.controle_navegacao.navigateForward('/projeto-cadastro');
  }

  editar(projeto: any) {
    this.router.navigate(['/projeto-cadastro'], { state: { projeto: projeto } });
  }

  async confirmarExclusao(id: number) {
    const alert = await this.controle_alerta.create({
      header: 'Tem certeza?',
      message: 'Deseja realmente excluir este projeto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'confirm',
          handler: () => { this.excluirProjeto(id); }
        }
      ]
    });
    await alert.present();
  }

  async excluirProjeto(id: number) {
    const loading = await this.controle_carregamento.create({ message: 'Excluindo...', duration: 30000 });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: `http://127.0.0.1:8000/projeto/api/deletar/${id}/`
    };

    CapacitorHttp.delete(options)
      .then(async (resposta: HttpResponse) => {
        loading.dismiss();
        if (resposta.status == 204) {
          this.apresenta_mensagem('Projeto excluído com sucesso!');
          this.consultarProjetos();
        } else {
          this.apresenta_mensagem(`Erro ao excluir: ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        loading.dismiss();
        this.apresenta_mensagem('Erro ao tentar excluir.');
      });
  }

  async logout() {
    await this.storage.remove('usuario');
    this.controle_navegacao.navigateRoot('/home');
  }

  async apresenta_mensagem(texto: string) {
    const mensagem = await this.controle_toast.create({
      message: texto,
      duration: 2000
    });
    mensagem.present();
  }

  handleRefresh(event: any) {
    this.consultarProjetos().then(() => event.target.complete());
  }
}