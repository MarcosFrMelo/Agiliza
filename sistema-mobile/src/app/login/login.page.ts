import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, NavController, ToastController } from '@ionic/angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { Usuario } from './usuario.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink],
  providers: [Storage]
})
export class LoginPage implements OnInit {
  
  public instancia: Usuario = new Usuario();

  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_toast: ToastController,
    public storage: Storage
  ) { }

  async ngOnInit() {
    await this.storage.create();
  }

  async autenticarUsuario() {
    const loading = await this.controle_carregamento.create({message: 'Autenticando...', duration: 15000});
    await loading.present();

    const options: HttpOptions = {
      headers: { 'Content-Type': 'application/json' },
      url: 'http://127.0.0.1:8000/autenticacao-api/',
      data: {
        username: this.instancia.username,
        password: this.instancia.password
      }
    };

    CapacitorHttp.post(options)
      .then(async (resposta: HttpResponse) => {
        if(resposta.status == 200) {
          let usuarioLogado = new Usuario();
          usuarioLogado.username = this.instancia.username;
          usuarioLogado.token = resposta.data.token;

          await this.storage.set('usuario', usuarioLogado);
          
          loading.dismiss();
          this.controle_navegacao.navigateRoot('/projetos');
        } else {
          loading.dismiss();
          this.apresenta_mensagem(`Erro: ${resposta.status}`);
        }
      })
      .catch(async (erro: any) => {
        console.log(erro);
        loading.dismiss();
        this.apresenta_mensagem('Falha na conexão');
      });
  }

  async apresenta_mensagem(texto: string) {
    const mensagem = await this.controle_toast.create({
      message: texto,
      duration: 2000,
      color: 'danger'
    });
    mensagem.present();
  }
}