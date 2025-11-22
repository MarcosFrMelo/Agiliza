import { Component, NgZone } from '@angular/core';
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
export class ProjetosPage {

  public usuario: Usuario = new Usuario();
  public lista_projetos: any[] = [];

  constructor(
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    public controle_alerta: AlertController,
    private router: Router,
    private ngZone: NgZone
  ) {
    addIcons({ add, pencilOutline, trashOutline, folderOpenOutline, logOutOutline });
  }

  async ionViewWillEnter() {
    await this.storage.create();
    const registro = await this.storage.get('usuario');

    if (registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      this.consultarProjetos(); 
    } else {
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  async consultarProjetos() {
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: 'http://127.0.0.1:8000/projeto/api/listar/'
    };

    CapacitorHttp.get(options)
      .then((resposta: HttpResponse) => {
        this.ngZone.run(() => {
          if (resposta.status == 200) {
            this.lista_projetos = resposta.data;
          } else {
            if (resposta.status == 401) this.logout();
          }
        });
      })
      .catch((erro: any) => {
        console.error(erro);
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
      message: 'Deseja excluir este projeto?',
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
    const loading = await this.controle_carregamento.create({ message: 'Excluindo...' });
    await loading.present();

    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.usuario.token}`
      },
      url: `http://127.0.0.1:8000/projeto/api/deletar/${id}/`
    };

    CapacitorHttp.delete(options)
      .then((resposta: HttpResponse) => {
        loading.dismiss();
        this.ngZone.run(() => {
          if (resposta.status == 204 || resposta.status == 200) {
            this.apresenta_mensagem('Projeto excluído!');
            this.lista_projetos = this.lista_projetos.filter(p => p.id !== id);
          } else {
            this.apresenta_mensagem('Erro ao excluir.');
          }
        });
      })
      .catch(() => {
        loading.dismiss();
        this.apresenta_mensagem('Erro de conexão.');
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