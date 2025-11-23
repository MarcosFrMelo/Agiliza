import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TarefaCadastroPage } from './tarefa-cadastro.page';

describe('TarefaCadastroPage', () => {
  let component: TarefaCadastroPage;
  let fixture: ComponentFixture<TarefaCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TarefaCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
