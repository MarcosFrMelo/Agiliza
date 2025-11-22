import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjetoCadastroPage } from './projeto-cadastro.page';

describe('ProjetoCadastroPage', () => {
  let component: ProjetoCadastroPage;
  let fixture: ComponentFixture<ProjetoCadastroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjetoCadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
