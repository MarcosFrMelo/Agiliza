import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from '../login/usuario.model';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';

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
    public controle_carregamento: LoadingController
  ) { }

  async ngOnInit() {
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
        if (resposta.status == 200) {
          this.lista_projetos = resposta.data;
          loading.dismiss();
        } else {
          loading.dismiss();
          this.apresenta_mensagem(`Erro: ${resposta.status}`);
          if (resposta.status == 401) this.logout();
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem('Erro de conexão');
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
}